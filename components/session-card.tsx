"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ActualExerciseEntry,
  BjjDetails,
  Effort,
  PhotoLog,
  PlannedExercise,
  PlannedSession,
  SessionLog,
} from "@/lib/types";
import PhotoUploader from "@/components/photo-uploader";

const effortOptions: Effort[] = ["easy", "moderate", "hard"];

function numberOrNull(value: string) {
  const num = Number(value);
  return Number.isFinite(num) && value !== "" ? num : null;
}

function buildDefaultExercises(exercises: PlannedExercise[] | undefined): ActualExerciseEntry[] {
  if (!exercises?.length) return [];
  return exercises.map((exercise) => ({
    name: exercise.name,
    sets: exercise.defaultSets,
    reps: exercise.defaultReps,
    weightKg: exercise.defaultWeightKg,
    notes: "",
  }));
}

export default function SessionCard({
  dateIso,
  session,
  savedLog,
  sessionPhotos,
  onSaved,
  onPhotoUploaded,
}: {
  dateIso: string;
  session: PlannedSession;
  savedLog?: SessionLog;
  sessionPhotos: PhotoLog[];
  onSaved: (log: SessionLog) => void;
  onPhotoUploaded: (photo: PhotoLog) => void;
}) {
  const [completed, setCompleted] = useState(savedLog?.completed ?? false);
  const [effort, setEffort] = useState<Effort | null>(savedLog?.actual_effort ?? null);
  const [distance, setDistance] = useState(savedLog?.actual_distance_km?.toString() ?? "");
  const [duration, setDuration] = useState(savedLog?.actual_duration_min?.toString() ?? "");
  const [notes, setNotes] = useState(savedLog?.actual_notes ?? "");
  const [actualExercises, setActualExercises] = useState<ActualExerciseEntry[]>(
    savedLog?.actual_exercises?.length
      ? savedLog.actual_exercises
      : buildDefaultExercises(session.exercises),
  );
  const [bjjDetails, setBjjDetails] = useState<BjjDetails>(savedLog?.bjj_details ?? {});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCompleted(savedLog?.completed ?? false);
    setEffort(savedLog?.actual_effort ?? null);
    setDistance(savedLog?.actual_distance_km?.toString() ?? "");
    setDuration(savedLog?.actual_duration_min?.toString() ?? "");
    setNotes(savedLog?.actual_notes ?? "");
    setActualExercises(
      savedLog?.actual_exercises?.length
        ? savedLog.actual_exercises
        : buildDefaultExercises(session.exercises),
    );
    setBjjDetails(savedLog?.bjj_details ?? {});
  }, [savedLog, session.exercises]);

  const paceLabel = useMemo(() => {
    const d = Number(distance);
    const t = Number(duration);

    if (!Number.isFinite(d) || !Number.isFinite(t) || d <= 0 || t <= 0) return null;

    const paceMin = t / d;
    const whole = Math.floor(paceMin);
    const seconds = Math.round((paceMin - whole) * 60)
      .toString()
      .padStart(2, "0");

    return `${whole}:${seconds} / km`;
  }, [distance, duration]);

  function updateExercise(index: number, field: keyof ActualExerciseEntry, value: string) {
    setActualExercises((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "notes" || field === "name"
                  ? value
                  : value === ""
                    ? undefined
                    : Number(value),
            }
          : item,
      ),
    );
  }

  async function saveSession() {
    setSaving(true);
    setMessage("");

    try {
      const payload: SessionLog = {
        log_date: dateIso,
        session_key: session.id,
        session_type: session.sessionType,
        title: session.title,
        completed,
        actual_effort: effort,
        actual_distance_km: numberOrNull(distance),
        actual_duration_min: numberOrNull(duration),
        actual_notes: notes || null,
        actual_exercises: actualExercises,
        bjj_details: session.sessionType === "bjj" ? bjjDetails : null,
      };

      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Save failed.");
      }

      const data = await response.json();
      onSaved(data.log);
      setMessage("Saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="card-shell rounded-[28px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold text-white">{session.title}</h3>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
              {session.sessionType}
            </span>
            {session.optional ? (
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-amber-200">
                Optional
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
            {session.timeLabel ? (
              <span className="rounded-full bg-white/5 px-3 py-1">Time: {session.timeLabel}</span>
            ) : null}
            {session.durationMin ? (
              <span className="rounded-full bg-white/5 px-3 py-1">
                {session.durationMaxMin
                  ? `${session.durationMin}-${session.durationMaxMin} min`
                  : `${session.durationMin} min`}
              </span>
            ) : null}
            {session.distanceKm ? (
              <span className="rounded-full bg-white/5 px-3 py-1">{session.distanceKm} km</span>
            ) : null}
            {session.interval ? (
              <span className="rounded-full bg-white/5 px-3 py-1">
                {session.interval.runMin}:{session.interval.walkMin} run/walk
              </span>
            ) : null}
          </div>

          {session.goal ? (
            <p className="mt-4 text-sm text-slate-200">
              <span className="font-medium text-white">Goal:</span> {session.goal}
            </p>
          ) : null}
          {session.howItShouldFeel ? (
            <p className="mt-2 text-sm text-slate-300">
              <span className="font-medium text-white">Should feel:</span>{" "}
              {session.howItShouldFeel}
            </p>
          ) : null}
          {session.coachingCue ? (
            <p className="mt-2 text-sm text-slate-400">
              <span className="font-medium text-white">Cue:</span> {session.coachingCue}
            </p>
          ) : null}
          {session.notes ? <p className="mt-2 text-sm text-slate-400">{session.notes}</p> : null}
        </div>

        <button
          type="button"
          onClick={() => setCompleted((v) => !v)}
          className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
            completed
              ? "bg-emerald-400 text-slate-950"
              : "border border-white/10 bg-white/10 text-slate-200 hover:bg-white/15"
          }`}
        >
          {completed ? "Completed" : "Mark complete"}
        </button>
      </div>

      {session.executionSteps?.length ? (
        <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-white">How to do it</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
            {session.executionSteps.map((step, index) => (
              <li key={`${session.id}-step-${index}`}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}

      {session.exercises?.length ? (
        <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-white">Exercises</p>
          <div className="mt-4 space-y-4">
            {session.exercises.map((exercise, index) => (
              <div key={exercise.id} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">{exercise.name}</p>
                <p className="text-sm text-slate-400">
                  Planned: {exercise.defaultSets} × {exercise.defaultReps}
                  {exercise.repRange ? ` (${exercise.repRange})` : ""}
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <label className="text-sm text-slate-300">
                    Sets
                    <input
                      type="number"
                      value={actualExercises[index]?.sets ?? ""}
                      onChange={(e) => updateExercise(index, "sets", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="text-sm text-slate-300">
                    Reps
                    <input
                      type="number"
                      value={actualExercises[index]?.reps ?? ""}
                      onChange={(e) => updateExercise(index, "reps", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="text-sm text-slate-300">
                    Weight kg
                    <input
                      type="number"
                      value={actualExercises[index]?.weightKg ?? ""}
                      onChange={(e) => updateExercise(index, "weightKg", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                  </label>

                  <label className="text-sm text-slate-300">
                    Notes
                    <input
                      type="text"
                      value={actualExercises[index]?.notes ?? ""}
                      onChange={(e) => updateExercise(index, "notes", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-medium text-white">Actual effort</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {effortOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setEffort(option)}
                className={`rounded-2xl px-4 py-2 text-sm capitalize transition ${
                  effort === option
                    ? "bg-sky-400/15 text-sky-100 ring-1 ring-sky-300/20"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {session.sessionType === "run" ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-slate-300">
                Actual distance (km)
                <input
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>

              <label className="text-sm text-slate-300">
                Actual duration (min)
                <input
                  type="number"
                  step="0.1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>
            </div>
          ) : (
            <label className="mt-4 block text-sm text-slate-300">
              Duration (min)
              <input
                type="number"
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </label>
          )}

          {session.sessionType === "bjj" ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm text-slate-300">
                Technique focus
                <input
                  type="text"
                  value={bjjDetails.technique_focus ?? ""}
                  onChange={(e) =>
                    setBjjDetails((prev) => ({ ...prev, technique_focus: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>

              <label className="text-sm text-slate-300">
                Rounds
                <input
                  type="number"
                  value={bjjDetails.rounds ?? ""}
                  onChange={(e) =>
                    setBjjDetails((prev) => ({
                      ...prev,
                      rounds: numberOrNull(e.target.value) ?? undefined,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>

              <label className="text-sm text-slate-300">
                Hard rounds
                <input
                  type="number"
                  value={bjjDetails.hard_rounds ?? ""}
                  onChange={(e) =>
                    setBjjDetails((prev) => ({
                      ...prev,
                      hard_rounds: numberOrNull(e.target.value) ?? undefined,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>

              <label className="text-sm text-slate-300">
                Sparring minutes
                <input
                  type="number"
                  value={bjjDetails.sparring_minutes ?? ""}
                  onChange={(e) =>
                    setBjjDetails((prev) => ({
                      ...prev,
                      sparring_minutes: numberOrNull(e.target.value) ?? undefined,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>
            </div>
          ) : null}

          {paceLabel ? (
            <p className="mt-3 text-sm text-emerald-300">Estimated pace: {paceLabel}</p>
          ) : null}

          <label className="mt-4 block text-sm text-slate-300">
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={saveSession}
              disabled={saving}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save session"}
            </button>

            {message ? <p className="text-sm text-slate-400">{message}</p> : null}
          </div>
        </div>

        <PhotoUploader
          dateIso={dateIso}
          sessionKey={session.id}
          photos={sessionPhotos}
          onUploaded={onPhotoUploaded}
        />
      </div>
    </article>
  );
}