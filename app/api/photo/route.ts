import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedJson } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatSupabaseError } from "@/lib/supabase-error";

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  const formData = await request.formData();
  const file = formData.get("file");
  const date = formData.get("date");
  const sessionKey = formData.get("sessionKey");

  if (!(file instanceof File) || typeof date !== "string" || typeof sessionKey !== "string") {
    return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
  }

  const bucket = process.env.PHOTO_BUCKET || "training-photos";
  const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
  const path = `${date}/${sessionKey}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: formatSupabaseError(uploadError) }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(path);

  const { data, error } = await supabaseAdmin
    .from("training_photo_logs")
    .insert({
      log_date: date,
      session_key: sessionKey,
      storage_path: path,
      public_url: publicUrlData.publicUrl,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: formatSupabaseError(error) }, { status: 500 });
  }

  return NextResponse.json({ photo: data });
}