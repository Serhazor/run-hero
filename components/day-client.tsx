"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BodyweightCard from "@/components/bodyweight-card";
import DailySummaryCard from "@/components/daily-summary-card";
import SessionCard from "@/components/session-card";
import WeeklySummaryCard from "@/components/weekly-summary-card";
import { addDays, getPlannedSessionsForDate } from "@/lib/plan";
import type { DayApiResponse, PhotoLog, SessionLog } from "@/lib/types";

export default function DayClient({
  dateIso,
  pageTitle,
}: {
  dateIso: string;
  pageTitle: string;
}) {
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoLog[]>([]);
  const [loading, setLoading] = useState(true);

  const { weekNumber, sessions } = useMemo(
    () => getPlannedSessionsForDate(dateIso),
    [dateIso],
  );

  async function loadDay() {
    setLoading(true);
    try {
      const response = await fetch(`/api/day?date=${dateIso}`);
      const data: DayApiResponse = await response.json();
      setLogs(data.logs ?? []);
      setSummary(data.summary ?? null);
      setPhotos(data.photos ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDay();
  }, [dateIso]);

  function handleSaved(log: SessionLog) {
    setLogs((prev) => {
      const existing = prev.findIndex((item) => item.session_key === log.session_key);
      if (existing === -1) return [...prev, log];

      const copy = [...prev];
      copy[existing] = log;
      return copy;
    });
  }

  function handlePhotoUploaded(photo: PhotoLog) {
    setPhotos((prev) => [photo, ...prev]);
  }

  const completedCount = logs.filter((log) => log.completed).length;

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="card-shell rounded-[24px] p-4 md:rounded-[32px] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300/80">
              Week {weekNumber}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white [font-family:var(--font-display)] md:text-3xl">
              {pageTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Planned sessions: {sessions.length} · Completed logs saved: {completedCount}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/day/${addDays(dateIso, -1)}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Previous
            </Link>
            <Link
              href="/calendar"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Calendar
            </Link>
            <Link
              href={`/day/${addDays(dateIso, 1)}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Next
            </Link>
          </div>
        </div>
      </section>

      <DailySummaryCard
        dateIso={dateIso}
        summary={summary}
        onSummarySaved={(value) => setSummary(value)}
      />

      {loading ? (
        <section className="card-shell rounded-[24px] p-4 text-sm text-slate-400 md:rounded-[28px] md:p-6">
          Loading day data...
        </section>
      ) : null}

      <div className="grid gap-4 md:gap-5">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            dateIso={dateIso}
            session={session}
            savedLog={logs.find((log) => log.session_key === session.id)}
            sessionPhotos={photos.filter((photo) => photo.session_key === session.id)}
            onSaved={handleSaved}
            onPhotoUploaded={handlePhotoUploaded}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BodyweightCard dateIso={dateIso} />
        <WeeklySummaryCard dateIso={dateIso} />
      </div>
    </div>
  );
}