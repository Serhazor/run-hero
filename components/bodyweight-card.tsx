"use client";

import { useEffect, useState } from "react";

type BodyweightLog = {
  log_date: string;
  weight_kg: number;
  notes: string | null;
};

export default function BodyweightCard({ dateIso }: { dateIso: string }) {
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/weight?date=${dateIso}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.log) {
          setWeight(String(data.log.weight_kg));
          setNotes(data.log.notes ?? "");
        } else {
          setWeight("");
          setNotes("");
        }
      });
  }, [dateIso]);

  async function save() {
    setMessage("");

    const response = await fetch("/api/weight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        log_date: dateIso,
        weight_kg: Number(weight),
        notes,
      }),
    });

    if (!response.ok) {
      setMessage("Failed to save weight.");
      return;
    }

    setMessage("Weight saved.");
  }

  return (
    <section className="card-shell rounded-[28px] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">Bodyweight</p>
      <h3 className="mt-1 text-xl font-semibold text-white">Daily log</h3>

      <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr_auto]">
        <label className="text-sm text-slate-300">
          Weight (kg)
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
          />
        </label>

        <label className="text-sm text-slate-300">
          Notes
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
          />
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={save}
            className="rounded-2xl bg-white px-4 py-2 font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Save
          </button>
        </div>
      </div>

      {message ? <p className="mt-3 text-sm text-slate-400">{message}</p> : null}
    </section>
  );
}