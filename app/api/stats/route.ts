import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedJson } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatSupabaseError } from "@/lib/supabase-error";
import type { StatsApiResponse } from "@/lib/types";

function getIsoDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  const windowParam = request.nextUrl.searchParams.get("window") ?? "30";
  const sessionType = request.nextUrl.searchParams.get("type") ?? "all";

  const since =
    windowParam === "all" ? "2000-01-01" : getIsoDaysAgo(Number(windowParam));

  const [{ data: logs, error: logsError }, { data: weights, error: weightsError }] =
    await Promise.all([
      supabaseAdmin
        .from("training_session_logs")
        .select("*")
        .gte("log_date", since)
        .order("log_date", { ascending: true }),
      supabaseAdmin
        .from("bodyweight_logs")
        .select("*")
        .gte("log_date", since)
        .order("log_date", { ascending: true }),
    ]);

  if (logsError || weightsError) {
    return NextResponse.json(
      { error: formatSupabaseError(logsError || weightsError) },
      { status: 500 },
    );
  }

  const allRows = logs ?? [];
  const scopedRows =
    sessionType === "all"
      ? allRows
      : allRows.filter((row) => row.session_type === sessionType);

  const completedRows = scopedRows.filter((row) => row.completed);
  const runRows = completedRows.filter((row) => row.session_type === "run");

  const totalRunKm = runRows.reduce(
    (sum, row) => sum + Number(row.actual_distance_km || 0),
    0,
  );

  const longestRunKm = runRows.reduce(
    (max, row) => Math.max(max, Number(row.actual_distance_km || 0)),
    0,
  );

  const paceValues = runRows
    .filter((row) => Number(row.actual_distance_km) > 0 && Number(row.actual_duration_min) > 0)
    .map((row) => Number(row.actual_duration_min) / Number(row.actual_distance_km));

  const averageRunPaceMinPerKm =
    paceValues.length > 0
      ? paceValues.reduce((sum, value) => sum + value, 0) / paceValues.length
      : null;

  const pullupReps = completedRows.reduce((sum, row) => {
    const exercises = Array.isArray(row.actual_exercises) ? row.actual_exercises : [];
    return (
      sum +
      exercises.reduce((exerciseSum: number, exercise: any) => {
        const name = String(exercise?.name || "").toLowerCase();
        if (name.includes("pull")) {
          return exerciseSum + Number(exercise?.sets || 0) * Number(exercise?.reps || 0);
        }
        return exerciseSum;
      }, 0)
    );
  }, 0);

  const effortCounts = {
    easy: completedRows.filter((row) => row.actual_effort === "easy").length,
    moderate: completedRows.filter((row) => row.actual_effort === "moderate").length,
    hard: completedRows.filter((row) => row.actual_effort === "hard").length,
  };

  const runDistanceMap = new Map<string, number>();
  runRows.forEach((row) => {
    const current = runDistanceMap.get(row.log_date) ?? 0;
    runDistanceMap.set(row.log_date, current + Number(row.actual_distance_km || 0));
  });

  const trendDays = windowParam === "7" ? 7 : windowParam === "90" ? 30 : 14;
  const dailyRunDistanceTrend: Array<{ date: string; km: number }> = [];
  for (let i = trendDays - 1; i >= 0; i--) {
    const date = getIsoDaysAgo(i);
    dailyRunDistanceTrend.push({
      date,
      km: runDistanceMap.get(date) ?? 0,
    });
  }

  const bodyweightRows = weights ?? [];
  const latestWeightKg =
    bodyweightRows.length > 0
      ? Number(bodyweightRows[bodyweightRows.length - 1].weight_kg)
      : null;

  const weightChangeKg =
    bodyweightRows.length >= 2
      ? Number(bodyweightRows[bodyweightRows.length - 1].weight_kg) -
        Number(bodyweightRows[0].weight_kg)
      : null;

  const bodyweightTrend = bodyweightRows.slice(-trendDays).map((row) => ({
    date: row.log_date,
    weightKg: Number(row.weight_kg),
  }));

  const response: StatsApiResponse = {
    totalCompletedSessions: completedRows.length,
    completedRuns: runRows.length,
    totalRunKm,
    longestRunKm,
    averageRunPaceMinPerKm,
    hardSessions: effortCounts.hard,
    completionRate: scopedRows.length ? (completedRows.length / scopedRows.length) * 100 : 0,
    pullupReps,
    dailyRunDistanceTrend,
    effortCounts,
    latestWeightKg,
    weightChangeKg,
    bodyweightTrend,
    windowDays: windowParam,
    sessionType,
  };

  return NextResponse.json(response);
}