import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedJson } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  const date = request.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "Missing date." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("bodyweight_logs")
    .select("*")
    .eq("log_date", date)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: data ?? null });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  const body = await request.json();

  const payload = {
    log_date: body.log_date,
    weight_kg: body.weight_kg,
    notes: body.notes || null,
  };

  const { data, error } = await supabaseAdmin
    .from("bodyweight_logs")
    .upsert(payload, { onConflict: "log_date" })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log: data });
}