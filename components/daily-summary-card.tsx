"use client";

import { useState } from "react";

export default function DailySummaryCard({
  dateIso,
  summary,
  onSummarySaved,
}: {
  dateIso: string;
  summary: string | null;
  onSummarySaved: (value: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateSummary() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateIso }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary.");
      }

      const data = await response.json();
      onSummarySaved(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something broke.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card-shell rounded-[28px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">AI daily summary</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Motivation, but based on data</h3>
        </div>

        <button
          type="button"
          onClick={generateSummary}
          disabled={loading}
          className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-100 transition hover:bg-sky-400/15 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate summary"}
        </button>
      </div>

      {summary ? (
        <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-slate-200 whitespace-pre-wrap">
          {summary}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          No summary saved for this day yet.
        </p>
      )}

      {error ? <p className="mt-3 text-sm text-orange-300">{error}</p> : null}
    </section>
  );
}