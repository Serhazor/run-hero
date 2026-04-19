import { NextResponse } from "next/server";
import { requireUser, unauthorizedJson } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  const [{ data: photos, error: photosError }, { data: weights, error: weightsError }] =
    await Promise.all([
      supabaseAdmin
        .from("training_photo_logs")
        .select("*")
        .order("log_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("bodyweight_logs").select("log_date, weight_kg"),
    ]);

  if (photosError || weightsError) {
    return NextResponse.json(
      { error: photosError?.message || weightsError?.message },
      { status: 500 },
    );
  }

  const weightMap = new Map(
    (weights ?? []).map((row) => [row.log_date, Number(row.weight_kg)]),
  );

  const groupsMap = new Map<
    string,
    { date: string; weightKg: number | null; photos: any[] }
  >();

  for (const photo of photos ?? []) {
    const key = photo.log_date;
    const existing = groupsMap.get(key);

    if (existing) {
      existing.photos.push(photo);
    } else {
      groupsMap.set(key, {
        date: key,
        weightKg: weightMap.get(key) ?? null,
        photos: [photo],
      });
    }
  }

  const groups = Array.from(groupsMap.values()).sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );

  return NextResponse.json({ groups });
}