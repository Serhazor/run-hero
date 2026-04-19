"use client";

import { useEffect, useState } from "react";

type WeeklySummaryResponse = {
  weekStart: string;
  weekEnd: string;
  summary: string | null;
};

export default function WeeklySummaryCard({ dateIso }: { dateIso: string }) {
  const [data, setData] = useState<WeeklySummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const response = await fetch(`/api/weekly-summary?date=${dateIso}`);
    const json = await response.json();
    setData(json);
  }

  useEffect(() => {
    load();
  }, [dateIso]);

  async function generate() {
    setLoading(true);
    const response = await fetch("/api/weekly-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date: dateIso }),
    });
    const json = await response.json();
    setData(json);
    setLoading(false);
  }

  return (
    <section className="card-shell rounded-[28px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">Weekly summary</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Week roll-up</h3>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-100 transition hover:bg-sky-400/15 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate weekly summary"}
        </button>
      </div>

      {data ? (
        <>
          <p className="mt-3 text-sm text-slate-400">
            {data.weekStart} to {data.weekEnd}
          </p>
          <div className="mt-4 whitespace-pre-wrap rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
            {data.summary ?? "No weekly summary yet."}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-400">Loading weekly summary...</p>
      )}
    </section>
  );
}