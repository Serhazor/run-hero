import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedJson } from "@/lib/auth";
import { getWeekBounds } from "@/lib/plan";
import { supabaseAdmin } from "@/lib/supabase-admin";

function buildFallbackWeeklySummary(rows: any[], weightRows: any[]) {
  const completed = rows.filter((row) => row.completed);
  const hard = completed.filter((row) => row.actual_effort === "hard").length;
  const runKm = completed
    .filter((row) => row.session_type === "run")
    .reduce((sum, row) => sum + Number(row.actual_distance_km || 0), 0);

  const startWeight = weightRows[0]?.weight_kg ?? null;
  const endWeight = weightRows[weightRows.length - 1]?.weight_kg ?? null;

  return [
    `- Completed sessions this week: ${completed.length}.`,
    `- Total running distance this week: ${runKm.toFixed(1)} km.`,
    `- Hard sessions logged this week: ${hard}.`,
    `- Bodyweight trend: ${
      startWeight !== null && endWeight !== null
        ? `${startWeight} kg to ${endWeight} kg`
        : "not enough data yet"
    }.`,
  ].join("\n");
}

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Missing date." }, { status: 400 });
  }

  const { weekStartIso, weekEndIso } = getWeekBounds(date);

  const { data, error } = await supabaseAdmin
    .from("weekly_summaries")
    .select("*")
    .eq("week_start", weekStartIso)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    weekStart: weekStartIso,
    weekEnd: weekEndIso,
    summary: data?.summary_text ?? null,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  const body = await request.json();
  const date = body.date as string;

  if (!date) {
    return NextResponse.json({ error: "Missing date." }, { status: 400 });
  }

  const { weekStartIso, weekEndIso } = getWeekBounds(date);

  const [{ data: rows }, { data: weightRows }] = await Promise.all([
    supabaseAdmin
      .from("training_session_logs")
      .select("*")
      .gte("log_date", weekStartIso)
      .lte("log_date", weekEndIso)
      .order("log_date", { ascending: true }),
    supabaseAdmin
      .from("bodyweight_logs")
      .select("*")
      .gte("log_date", weekStartIso)
      .lte("log_date", weekEndIso)
      .order("log_date", { ascending: true }),
  ]);

  let summary = buildFallbackWeeklySummary(rows ?? [], weightRows ?? []);

  if (process.env.GEMINI_API_KEY) {
    const prompt = `
Write exactly 4 bullet points for this athlete's weekly training summary.
Keep it practical and grounded.
Mention:
1. overall session completion,
2. running progress,
3. bodyweight trend if available,
4. one useful coaching observation.

Week start: ${weekStartIso}
Week end: ${weekEndIso}

Training rows:
${JSON.stringify(rows ?? [], null, 2)}

Bodyweight rows:
${JSON.stringify(weightRows ?? [], null, 2)}
`.trim();

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text === "string" && text.trim()) {
        summary = text.trim();
      }
    }
  }

  const { error } = await supabaseAdmin.from("weekly_summaries").upsert(
    {
      week_start: weekStartIso,
      week_end: weekEndIso,
      summary_text: summary,
    },
    { onConflict: "week_start" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    weekStart: weekStartIso,
    weekEnd: weekEndIso,
    summary,
  });
}