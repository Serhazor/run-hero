import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedJson } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatSupabaseError } from "@/lib/supabase-error";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  const date = request.nextUrl.searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date." }, { status: 400 });
  }

  const [
    { data: logs, error: logsError },
    { data: summaryRow, error: summaryError },
    { data: photos, error: photosError },
  ] = await Promise.all([
    supabaseAdmin
      .from("training_session_logs")
      .select("*")
      .eq("log_date", date)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("training_day_summaries")
      .select("summary_text")
      .eq("log_date", date)
      .maybeSingle(),
    supabaseAdmin
      .from("training_photo_logs")
      .select("*")
      .eq("log_date", date)
      .order("created_at", { ascending: false }),
  ]);

  if (logsError || summaryError || photosError) {
    return NextResponse.json(
      {
        error: formatSupabaseError(logsError || summaryError || photosError),
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    logs: logs ?? [],
    summary: summaryRow?.summary_text ?? null,
    photos: photos ?? [],
  });
}