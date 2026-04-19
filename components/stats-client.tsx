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
  const [stats, setStats] = useState<StatsApiResponse | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <section className="card-shell rounded-[28px] p-6 text-sm text-slate-400">
        Loading stats...
      </section>
    );
  }

  const maxKm = Math.max(...stats.dailyRunDistance14d.map((d) => d.km), 1);

  return (
    <div className="space-y-6">
      <section className="card-shell rounded-[30px] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-300/80">Stats</p>
        <h2 className="mt-2 text-3xl font-bold [font-family:var(--font-display)]">
          Useful numbers
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enough to show progress, not enough to turn your life into a spreadsheet cult.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Completed sessions"
          value={String(stats.totalCompletedSessions)}
          helper="Logged completed sessions."
        />
        <StatCard
          title="Runs completed"
          value={String(stats.completedRuns)}
          helper="Completed running sessions."
        />
        <StatCard
          title="Run km (30d)"
          value={`${stats.totalRunKm30d.toFixed(1)} km`}
          helper="Total distance logged in the last 30 days."
        />
        <StatCard
          title="Longest run"
          value={`${stats.longestRunKm.toFixed(1)} km`}
          helper="Best logged long run so far."
        />
        <StatCard
          title="Avg pace"
          value={
            stats.averageRunPaceMinPerKm
              ? `${Math.floor(stats.averageRunPaceMinPerKm)}:${String(
                  Math.round((stats.averageRunPaceMinPerKm % 1) * 60),
                ).padStart(2, "0")} / km`
              : "—"
          }
          helper="Average across runs with both time and distance logged."
        />
        <StatCard
          title="Hard sessions"
          value={String(stats.hardSessions30d)}
          helper="Last 30 days marked hard."
        />
        <StatCard
          title="Completion rate"
          value={`${stats.completionRate30d.toFixed(0)}%`}
          helper="Completed vs saved sessions in the last 30 days."
        />
        <StatCard
          title="Pull-up reps"
          value={String(stats.pullupReps30d)}
          helper="Total pull-up style reps found in exercise logs over 30 days."
        />
      </div>

      <section className="card-shell rounded-[28px] p-5">
        <h3 className="text-xl font-semibold text-white">14-day run distance trend</h3>
        <div className="mt-4 space-y-3">
          {stats.dailyRunDistance14d.map((day) => (
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
        <h3 className="text-xl font-semibold text-white">Effort distribution (30d)</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(["easy", "moderate", "hard"] as const).map((key) => (
            <div key={key} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{key}</p>
              <p className="mt-2 text-3xl font-bold text-white">{stats.effortCounts30d[key]}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}