import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { StatsApiResponse } from "@/lib/types";

function getIsoDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET() {
  const since30 = getIsoDaysAgo(30);
  const since14 = getIsoDaysAgo(14);

  const { data: logs, error } = await supabaseAdmin
    .from("training_session_logs")
    .select("*")
    .gte("log_date", since30)
    .order("log_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = logs ?? [];
  const completedRows = rows.filter((row) => row.completed);
  const runRows = completedRows.filter((row) => row.session_type === "run");

  const totalRunKm30d = runRows.reduce(
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

  const pullupReps30d = completedRows.reduce((sum, row) => {
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

  const effortCounts30d = {
    easy: completedRows.filter((row) => row.actual_effort === "easy").length,
    moderate: completedRows.filter((row) => row.actual_effort === "moderate").length,
    hard: completedRows.filter((row) => row.actual_effort === "hard").length,
  };

  const map = new Map<string, number>();
  rows
    .filter((row) => row.log_date >= since14 && row.session_type === "run" && row.completed)
    .forEach((row) => {
      const current = map.get(row.log_date) ?? 0;
      map.set(row.log_date, current + Number(row.actual_distance_km || 0));
    });

  const dailyRunDistance14d: Array<{ date: string; km: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const date = getIsoDaysAgo(i);
    dailyRunDistance14d.push({
      date,
      km: map.get(date) ?? 0,
    });
  }

  const response: StatsApiResponse = {
    totalCompletedSessions: completedRows.length,
    completedRuns: runRows.length,
    totalRunKm30d,
    longestRunKm,
    averageRunPaceMinPerKm,
    hardSessions30d: effortCounts30d.hard,
    completionRate30d: rows.length ? (completedRows.length / rows.length) * 100 : 0,
    pullupReps30d,
    dailyRunDistance14d,
    effortCounts30d,
  };

  return NextResponse.json(response);
}