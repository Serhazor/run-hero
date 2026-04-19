import { PlannedSession, WeekRunPlan } from "@/lib/types";
import { RUN_WEEKS, PLAN_START_DATE, strengthAExercises, strengthBExercises } from "@/data/training-plan";

export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromIsoDate(iso: string) {
  return new Date(`${iso}T12:00:00`);
}

export function addDays(iso: string, days: number) {
  const date = fromIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function formatLongDate(iso: string) {
  const date = fromIsoDate(iso);
  return new Intl.DateTimeFormat("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: process.env.NEXT_PUBLIC_APP_TIMEZONE || "Europe/Dublin",
  }).format(date);
}

export function getTodayIsoInTimezone() {
  const timeZone = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Europe/Dublin";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value ?? "2026";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

export function getWeekNumber(isoDate: string) {
  const start = fromIsoDate(PLAN_START_DATE);
  start.setHours(0, 0, 0, 0);

  const current = fromIsoDate(isoDate);
  current.setHours(0, 0, 0, 0);

  const diffMs = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  const week = Math.floor(diffDays / 7) + 1;

  return Math.max(1, Math.min(week, RUN_WEEKS.length));
}

function getRunWeek(isoDate: string): WeekRunPlan {
  const week = getWeekNumber(isoDate);
  return RUN_WEEKS[week - 1];
}

function buildBjjSession(
  id: string,
  title: string,
  timeLabel: string,
  optional = false,
): PlannedSession {
  return {
    id,
    sessionType: "bjj",
    title,
    timeLabel,
    optional,
    targetEffort: optional ? "moderate" : "moderate",
    howItShouldFeel: optional
      ? "Only do this if recovery is good."
      : "Normal technical or rolling effort for the day.",
  };
}

export function getPlannedSessionsForDate(isoDate: string) {
  const date = fromIsoDate(isoDate);
  const day = date.getDay();
  const weekNumber = getWeekNumber(isoDate);
  const runWeek = getRunWeek(isoDate);

  let sessions: PlannedSession[] = [];

  if (day === 0) {
    sessions = [
      {
        id: "active-recovery",
        sessionType: "recovery",
        title: "Active recovery",
        prescriptionMode: "time",
        durationMin: 30,
        durationMaxMin: 45,
        targetEffort: "easy",
        goal: "Recover, loosen up, and arrive fresher for the next training week.",
        howItShouldFeel: "Refreshing, not tiring.",
        executionSteps: [
          "Walk for 30 to 45 minutes.",
          "Do 10 to 15 minutes of mobility work.",
          "Keep the full day low stress.",
        ],
        coachingCue: "Recovery day means recovery. Do not turn it into another training session.",
        notes: "Optional sauna later in the day for relaxation and sleep support.",
      },
      {
        id: "sauna",
        sessionType: "sauna",
        title: "Sauna",
        optional: true,
        targetEffort: "easy",
        howItShouldFeel: "Relaxing and restorative.",
        notes: "Optional sauna session.",
      },
    ];
  }

  if (day === 1) {
    sessions = [
      ...(runWeek.mondayOptionalRun ? [{ ...runWeek.mondayOptionalRun, optional: true }] : []),
      {
        id: "strength-a",
        sessionType: "strength",
        title: "Strength A",
        timeLabel: "Morning or lunch",
        prescriptionMode: "time",
        durationMin: 35,
        durationMaxMin: 45,
        targetEffort: "moderate",
        goal: "Build upper-body pulling strength and improve pull-up ability without frying yourself for evening BJJ.",
        howItShouldFeel: "Challenging, but with clean form and a rep or two left in reserve.",
        executionSteps: [
          "Move with control on every rep.",
          "Do not grind or hit failure.",
          "Keep the session crisp rather than heroic.",
        ],
        coachingCue: "Strong and repeatable beats smashed and useless.",
        exercises: strengthAExercises,
      },
      buildBjjSession("monday-nogi", "No-Gi class", "18:00"),
      buildBjjSession("monday-gi", "Gi class", "19:00", true),
    ];
  }

  if (day === 2) {
    sessions = [runWeek.tuesday, buildBjjSession("tuesday-gi", "Gi class", "19:00")];
  }

  if (day === 3) {
    sessions = [
      {
        id: "strength-b",
        sessionType: "strength",
        title: "Strength B",
        timeLabel: "Morning or lunch",
        prescriptionMode: "time",
        durationMin: 35,
        durationMaxMin: 45,
        targetEffort: "moderate",
        goal: "Build lower-body durability, calves, trunk stability, and injury resistance for running and BJJ.",
        howItShouldFeel: "Solid work, but never sloppy or max-effort.",
        executionSteps: [
          "Use controlled reps.",
          "Leave a little in the tank.",
          "Prioritize calves, trunk, and clean movement.",
        ],
        coachingCue: "You are training resilience here, not showing off.",
        exercises: strengthBExercises,
      },
      buildBjjSession("wednesday-nogi", "No-Gi class", "18:00"),
      buildBjjSession("wednesday-gi", "Gi class", "19:00", true),
    ];
  }

  if (day === 4) {
    sessions = [runWeek.thursday, buildBjjSession("thursday-gi", "Gi class", "19:00")];
  }

  if (day === 5) {
    sessions = [
      runWeek.friday,
      buildBjjSession("friday-gi", "Gi class", "19:00", true),
    ];
  }

  if (day === 6) {
    sessions = [
      buildBjjSession("saturday-open-mat", "Open mat", "12:00"),
      {
        id: "saturday-mobility",
        sessionType: "recovery",
        title: "Walk and mobility",
        optional: true,
        prescriptionMode: "time",
        durationMin: 15,
        durationMaxMin: 20,
        targetEffort: "easy",
        howItShouldFeel: "Loose and light.",
        goal: "Prepare the body for open mat without adding fatigue.",
        executionSteps: [
          "Do a short walk.",
          "Add basic mobility for hips, calves, thoracic spine, and ankles.",
        ],
        coachingCue: "Wake the body up. Do not pre-fatigue it.",
      },
    ];
  }

  return { weekNumber, sessions };
}