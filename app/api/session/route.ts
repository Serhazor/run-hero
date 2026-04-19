import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedJson } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatSupabaseError } from "@/lib/supabase-error";

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  const body = await request.json();

  const payload = {
    log_date: body.log_date,
    session_key: body.session_key,
    session_type: body.session_type,
    title: body.title,
    completed: Boolean(body.completed),
    actual_effort: body.actual_effort ?? null,
    actual_distance_km: body.actual_distance_km ?? null,
    actual_duration_min: body.actual_duration_min ?? null,
    actual_notes: body.actual_notes ?? null,
    actual_exercises: body.actual_exercises ?? [],
    bjj_details: body.bjj_details ?? {},
  };

  const { data, error } = await supabaseAdmin
    .from("training_session_logs")
    .upsert(payload, {
      onConflict: "log_date,session_key",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: formatSupabaseError(error) }, { status: 500 });
  }

  return NextResponse.json({ log: data });
}