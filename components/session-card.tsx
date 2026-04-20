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

function ExerciseEditor({
  exercise,
  value,
  onChange,
}: {
  exercise: PlannedExercise;
  value: ActualExerciseEntry;
  onChange: (field: keyof ActualExerciseEntry, nextValue: string) => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{exercise.name}</p>
          <p className="text-sm text-slate-400">
            Planned: {exercise.defaultSets} × {exercise.defaultReps}
            {exercise.repRange ? ` (${exercise.repRange})` : ""}
          </p>
          {exercise.howItShouldFeel ? (
            <p className="mt-1 text-xs text-slate-500">{exercise.howItShouldFeel}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
        >
          {showAdvanced ? "Less" : "Advanced"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm text-slate-300">
          Sets
          <input
            type="number"
            inputMode="numeric"
            value={value?.sets ?? ""}
            onChange={(e) => onChange("sets", e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
          />
        </label>

        <label className="text-sm text-slate-300">
          Reps
          <input
            type="number"
            inputMode="numeric"
            value={value?.reps ?? ""}
            onChange={(e) => onChange("reps", e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
          />
        </label>
      </div>

      {showAdvanced ? (
        <div className="mt-3 grid gap-3">
          <label className="text-sm text-slate-300">
            Weight kg
            <input
              type="number"
              inputMode="decimal"
              value={value?.weightKg ?? ""}
              onChange={(e) => onChange("weightKg", e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>

          <label className="text-sm text-slate-300">
            Notes
            <input
              type="text"
              value={value?.notes ?? ""}
              onChange={(e) => onChange("notes", e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
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
  const [showPlan, setShowPlan] = useState(false);
  const [showLog, setShowLog] = useState(true);

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
    <article className="card-shell rounded-[24px] p-4 md:rounded-[28px] md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white md:text-xl">{session.title}</h3>

            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300 md:text-xs">
              {session.sessionType}
            </span>

            {session.optional ? (
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200 md:text-xs">
                Optional
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300 md:text-sm">
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
            {session.targetEffort ? (
              <span className="rounded-full bg-sky-400/10 px-3 py-1 text-sky-200">
                Planned: {session.targetEffort}
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCompleted((v) => !v)}
          className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition ${
            completed
              ? "bg-emerald-400 text-slate-950"
              : "border border-white/10 bg-white/10 text-slate-200 hover:bg-white/15"
          }`}
        >
          {completed ? "Completed" : "Complete"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowPlan((v) => !v)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
        >
          {showPlan ? "Hide plan" : "Show plan"}
        </button>

        <button
          type="button"
          onClick={() => setShowLog((v) => !v)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
        >
          {showLog ? "Hide log" : "Show log"}
        </button>
      </div>

      {showPlan ? (
        <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 p-4">
          {session.goal ? (
            <p className="text-sm text-slate-200">
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

          {session.executionSteps?.length ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-white">How to do it</p>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-300">
                {session.executionSteps.map((step, index) => (
                  <li key={`${session.id}-step-${index}`}>{step}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      ) : null}

      {showLog ? (
        <div className="mt-4 grid gap-4">
          {session.exercises?.length ? (
            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">Exercises</p>
              <div className="mt-4 space-y-3">
                {session.exercises.map((exercise, index) => (
                  <ExerciseEditor
                    key={exercise.id}
                    exercise={exercise}
                    value={actualExercises[index] ?? { name: exercise.name }}
                    onChange={(field, value) => updateExercise(index, field, value)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-medium text-white">Actual effort</p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {effortOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEffort(option)}
                  className={`rounded-xl px-3 py-2 text-sm capitalize transition ${
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
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-sm text-slate-300">
                  Distance
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                  />
                </label>

                <label className="text-sm text-slate-300">
                  Duration
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
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
                  inputMode="decimal"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                />
              </label>
            )}

            {session.sessionType === "bjj" ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                    inputMode="numeric"
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
                    inputMode="numeric"
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
                    inputMode="numeric"
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
                rows={3}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </label>

            <div className="mt-4 flex flex-wrap items-center gap-3">
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
      ) : null}
    </article>
  );
}