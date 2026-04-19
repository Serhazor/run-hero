import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

function fallbackSummary(date: string, rows: any[]) {
  const completed = rows.filter((row) => row.completed);
  const runKm = completed
    .filter((row) => row.session_type === "run")
    .reduce((sum, row) => sum + Number(row.actual_distance_km || 0), 0);

  const hardCount = completed.filter((row) => row.actual_effort === "hard").length;

  return [
    `- On ${date}, you completed ${completed.length} planned session${completed.length === 1 ? "" : "s"}.`,
    `- Total logged run distance for the day: ${runKm.toFixed(1)} km.`,
    `- Hard sessions logged today: ${hardCount}.`,
    `- Keep the next day honest. Progress comes from consistency, not dramatic overcooking.`,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const date = body.date as string;

  if (!date) {
    return NextResponse.json({ error: "Missing date." }, { status: 400 });
  }

  const sevenDaysAgo = new Date(`${date}T12:00:00`);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const since = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, "0")}-${String(sevenDaysAgo.getDate()).padStart(2, "0")}`;

  const { data: rows, error } = await supabaseAdmin
    .from("training_session_logs")
    .select("*")
    .gte("log_date", since)
    .lte("log_date", date)
    .order("log_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const currentDayRows = (rows ?? []).filter((row) => row.log_date === date);
  let summary = fallbackSummary(date, currentDayRows);

  if (process.env.GEMINI_API_KEY) {
    const prompt = `
You are writing a concise, grounded training summary for one athlete.

Write exactly 4 bullet points.
Keep them practical and motivating, not cheesy.
Use only the data provided.
Mention:
1. what was completed today,
2. effort level pattern,
3. simple weekly context,
4. one useful coaching observation.

Today's date: ${date}

Session rows for the last 7 days:
${JSON.stringify(rows ?? [], null, 2)}
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
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (typeof text === "string" && text.trim()) {
        summary = text.trim();
      }
    }
  }

  const { error: saveError } = await supabaseAdmin
    .from("training_day_summaries")
    .upsert(
      {
        log_date: date,
        summary_text: summary,
      },
      { onConflict: "log_date" },
    );

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 });
  }

  return NextResponse.json({ summary });
}