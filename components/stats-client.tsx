"use client";

import { useEffect, useState } from "react";
import type { StatsApiResponse } from "@/lib/types";

function StatCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="card-shell rounded-[26px] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </article>
  );
}

export default function StatsClient() {
  const [windowDays, setWindowDays] = useState("30");
  const [sessionType, setSessionType] = useState("all");
  const [stats, setStats] = useState<StatsApiResponse | null>(null);

  useEffect(() => {
    fetch(`/api/stats?window=${windowDays}&type=${sessionType}`)
      .then((res) => res.json())
      .then(setStats);
  }, [windowDays, sessionType]);

  if (!stats) {
    return (
      <section className="card-shell rounded-[28px] p-6 text-sm text-slate-400">
        Loading stats...
      </section>
    );
  }

  const maxKm = Math.max(...stats.dailyRunDistanceTrend.map((d) => d.km), 1);
  const maxWeight = Math.max(...stats.bodyweightTrend.map((d) => d.weightKg), 1);

  return (
    <div className="space-y-6">
      <section className="card-shell rounded-[30px] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300/80">Stats</p>
            <h2 className="mt-2 text-3xl font-bold [font-family:var(--font-display)]">
              Useful numbers
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="text-sm text-slate-300">
              Window
              <select
                value={windowDays}
                onChange={(e) => setWindowDays(e.target.value)}
                className="ml-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              >
                <option value="7">7d</option>
                <option value="30">30d</option>
                <option value="90">90d</option>
                <option value="all">All</option>
              </select>
            </label>

            <label className="text-sm text-slate-300">
              Session
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="ml-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              >
                <option value="all">All</option>
                <option value="run">Run</option>
                <option value="bjj">BJJ</option>
                <option value="strength">Strength</option>
                <option value="recovery">Recovery</option>
                <option value="sauna">Sauna</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Completed sessions" value={String(stats.totalCompletedSessions)} helper="Within the current filter." />
        <StatCard title="Runs completed" value={String(stats.completedRuns)} helper="Completed running sessions." />
        <StatCard title="Run km" value={`${stats.totalRunKm.toFixed(1)} km`} helper="Running volume in the current filter." />
        <StatCard title="Longest run" value={`${stats.longestRunKm.toFixed(1)} km`} helper="Best logged long run in scope." />
        <StatCard
          title="Avg pace"
          value={
            stats.averageRunPaceMinPerKm
              ? `${Math.floor(stats.averageRunPaceMinPerKm)}:${String(
                  Math.round((stats.averageRunPaceMinPerKm % 1) * 60),
                ).padStart(2, "0")} / km`
              : "—"
          }
          helper="Runs with both time and distance logged."
        />
        <StatCard title="Hard sessions" value={String(stats.hardSessions)} helper="Marked hard in the selected window." />
        <StatCard title="Completion rate" value={`${stats.completionRate.toFixed(0)}%`} helper="Completed vs logged sessions." />
        <StatCard title="Pull-up reps" value={String(stats.pullupReps)} helper="Pull-up style reps found in exercise logs." />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card-shell rounded-[28px] p-5">
          <h3 className="text-xl font-semibold text-white">Run distance trend</h3>
          <div className="mt-4 space-y-3">
            {stats.dailyRunDistanceTrend.map((day) => (
              <div key={day.date} className="grid grid-cols-[88px_1fr_56px] items-center gap-3">
                <span className="text-sm text-slate-400">{day.date.slice(5)}</span>
                <div className="metric-bar">
                  <span style={{ width: `${(day.km / maxKm) * 100}%` }} />
                </div>
                <span className="text-right text-sm text-slate-300">{day.km.toFixed(1)} km</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card-shell rounded-[28px] p-5">
          <h3 className="text-xl font-semibold text-white">Bodyweight trend</h3>
          <p className="mt-2 text-sm text-slate-400">
            Latest: {stats.latestWeightKg ?? "—"} kg · Change:{" "}
            {stats.weightChangeKg === null ? "—" : `${stats.weightChangeKg.toFixed(1)} kg`}
          </p>
          <div className="mt-4 space-y-3">
            {stats.bodyweightTrend.map((day) => (
              <div key={day.date} className="grid grid-cols-[88px_1fr_64px] items-center gap-3">
                <span className="text-sm text-slate-400">{day.date.slice(5)}</span>
                <div className="metric-bar">
                  <span style={{ width: `${(day.weightKg / maxWeight) * 100}%` }} />
                </div>
                <span className="text-right text-sm text-slate-300">{day.weightKg.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card-shell rounded-[28px] p-5">
        <h3 className="text-xl font-semibold text-white">Effort distribution</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(["easy", "moderate", "hard"] as const).map((key) => (
            <div key={key} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{key}</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.effortCounts[key]}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}