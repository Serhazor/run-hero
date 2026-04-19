import { PlannedExercise, PlannedSession, WeekRunPlan } from "@/lib/types";

export const PLAN_START_DATE = "2026-04-19";

function easyTimedRun(input: {
  id: string;
  title?: string;
  durationMin: number;
  durationMaxMin?: number;
  runMin: number;
  walkMin: number;
  distanceKm?: number;
  goal: string;
  feel: string;
  cue: string;
  notes?: string;
}): PlannedSession {
  return {
    id: input.id,
    sessionType: "run",
    title: input.title ?? "Easy run / walk",
    prescriptionMode: input.distanceKm ? "hybrid" : "time",
    durationMin: input.durationMin,
    durationMaxMin: input.durationMaxMin,
    distanceKm: input.distanceKm,
    interval: { runMin: input.runMin, walkMin: input.walkMin },
    targetEffort: "easy",
    goal: input.goal,
    howItShouldFeel: input.feel,
    executionSteps: [
      "Warm up with 5 minutes brisk walking.",
      `Run ${input.runMin} minutes, walk ${input.walkMin} minute${input.walkMin > 1 ? "s" : ""}.`,
      `Repeat until you reach ${input.durationMaxMin ? `${input.durationMin} to ${input.durationMaxMin}` : input.durationMin} minutes total.`,
      "Keep the running pace slow enough that breathing stays controlled.",
      "Cool down with 5 minutes easy walking.",
    ],
    coachingCue: input.cue,
    notes: input.notes,
  };
}

function steadyHybridRun(input: {
  id: string;
  distanceKm: number;
  durationMin?: number;
  title: string;
  goal: string;
  feel: string;
  cue: string;
  steps: string[];
  notes?: string;
}): PlannedSession {
  return {
    id: input.id,
    sessionType: "run",
    title: input.title,
    prescriptionMode: input.durationMin ? "hybrid" : "distance",
    distanceKm: input.distanceKm,
    durationMin: input.durationMin,
    targetEffort: "moderate",
    goal: input.goal,
    howItShouldFeel: input.feel,
    executionSteps: input.steps,
    coachingCue: input.cue,
    notes: input.notes,
  };
}

function easyDistanceRun(input: {
  id: string;
  distanceKm: number;
  title?: string;
  goal: string;
  feel: string;
  cue: string;
  notes?: string;
}): PlannedSession {
  return {
    id: input.id,
    sessionType: "run",
    title: input.title ?? "Easy run",
    prescriptionMode: "distance",
    distanceKm: input.distanceKm,
    targetEffort: "easy",
    goal: input.goal,
    howItShouldFeel: input.feel,
    executionSteps: [
      "Warm up with 5 minutes brisk walking.",
      "Start gently and keep the whole session controlled.",
      "Run at a pace where you could still speak in short sentences.",
      "Finish with 5 minutes easy walking.",
    ],
    coachingCue: input.cue,
    notes: input.notes,
  };
}

function longRun(input: {
  id: string;
  distanceKm?: number;
  durationMin?: number;
  durationMaxMin?: number;
  runMin?: number;
  walkMin?: number;
  title?: string;
  goal: string;
  feel: string;
  cue: string;
  notes?: string;
}): PlannedSession {
  const isTimed = typeof input.durationMin === "number";
  const hasInterval = isTimed && input.runMin && input.walkMin;

  return {
    id: input.id,
    sessionType: "run",
    title: input.title ?? "Long run",
    prescriptionMode: isTimed ? "hybrid" : "distance",
    distanceKm: input.distanceKm,
    durationMin: input.durationMin,
    durationMaxMin: input.durationMaxMin,
    interval:
      hasInterval
        ? { runMin: input.runMin!, walkMin: input.walkMin! }
        : undefined,
    targetEffort: "easy",
    goal: input.goal,
    howItShouldFeel: input.feel,
    executionSteps: hasInterval
      ? [
          "Warm up with 5 minutes brisk walking.",
          `Run ${input.runMin!} minutes, walk ${input.walkMin!} minute${input.walkMin! > 1 ? "s" : ""}.`,
          `Repeat until you reach ${input.durationMaxMin ? `${input.durationMin} to ${input.durationMaxMin}` : input.durationMin} minutes total.`,
          "Stay patient throughout the session.",
          "Cool down with 5 minutes walking.",
        ]
      : [
          "Warm up with 5 minutes brisk walking.",
          "Run relaxed from the start and stay controlled throughout.",
          "If breathing spikes or form gets sloppy, slow down immediately.",
          "Cool down with 5 minutes walking.",
        ],
    coachingCue: input.cue,
    notes: input.notes,
  };
}

function optionalRecoveryJog(distanceKm: number): PlannedSession {
  return {
    id: "monday-optional-run",
    sessionType: "run",
    title: "Optional recovery jog",
    optional: true,
    prescriptionMode: "distance",
    distanceKm,
    targetEffort: "easy",
    goal: "Add a little aerobic work without interfering with recovery.",
    howItShouldFeel: "Very light, almost too easy.",
    executionSteps: [
      "Only do this if legs feel good.",
      "Run gently with no pressure on pace.",
      "Stop early if you feel beaten up from the weekend.",
    ],
    coachingCue: "If in doubt, skip it.",
    notes: "Use this only in the later phase and only if recovery is genuinely good.",
  };
}

function strengthExercise(
  id: string,
  name: string,
  defaultSets: number,
  defaultReps: number,
  extra?: Partial<PlannedExercise>,
): PlannedExercise {
  return {
    id,
    name,
    defaultSets,
    defaultReps,
    ...extra,
  };
}

export const strengthAExercises: PlannedExercise[] = [
  strengthExercise("band-pullups", "Band-assisted pull-ups", 5, 4, {
    repRange: "4-6",
    targetEffort: "moderate",
    howItShouldFeel: "Challenging but clean. You should have 1 to 2 reps in reserve.",
    notes: "Stay strict. Do not grind.",
  }),
  strengthExercise("negatives", "Slow negatives", 3, 3, {
    targetEffort: "moderate",
    howItShouldFeel: "Controlled lowering, not collapsing.",
    notes: "Lower for 3 to 5 seconds.",
  }),
  strengthExercise("rows", "Rows", 4, 8, {
    repRange: "8-12",
    targetEffort: "moderate",
    howItShouldFeel: "Solid back work without ugly form.",
  }),
  strengthExercise("pushups", "Push-ups or bench press", 3, 8, {
    repRange: "8-12",
    targetEffort: "moderate",
  }),
  strengthExercise("shoulder-press", "Shoulder press", 3, 8, {
    targetEffort: "moderate",
  }),
  strengthExercise("dead-hang", "Dead hang", 3, 20, {
    targetEffort: "easy",
    notes: "Treat reps as seconds.",
  }),
  strengthExercise("plank", "Plank or hollow hold", 3, 30, {
    targetEffort: "easy",
    notes: "Treat reps as seconds.",
  }),
];

export const strengthBExercises: PlannedExercise[] = [
  strengthExercise("goblet-squat", "Goblet squat or front squat", 3, 5, {
    repRange: "5-8",
    targetEffort: "moderate",
  }),
  strengthExercise("rdl", "Romanian deadlift", 3, 6, {
    repRange: "6-8",
    targetEffort: "moderate",
  }),
  strengthExercise("split-squat", "Split squat", 3, 8, {
    targetEffort: "moderate",
    notes: "Each leg.",
  }),
  strengthExercise("calf-raises", "Calf raises", 4, 12, {
    repRange: "12-20",
    targetEffort: "moderate",
  }),
  strengthExercise("tibialis-raises", "Tibialis raises", 3, 15, {
    repRange: "15-20",
    targetEffort: "moderate",
  }),
  strengthExercise("side-plank", "Side plank", 3, 30, {
    targetEffort: "easy",
    notes: "Treat reps as seconds.",
  }),
  strengthExercise("hanging-knee-raises", "Hanging knee raises", 3, 8, {
    repRange: "8-12",
    targetEffort: "moderate",
  }),
];

export const RUN_WEEKS: WeekRunPlan[] = [
  {
    week: 1,
    tuesday: easyTimedRun({
      id: "tuesday-run",
      durationMin: 25,
      durationMaxMin: 30,
      runMin: 2,
      walkMin: 1,
      distanceKm: 3,
      goal: "Introduce running without beating up joints and calves.",
      feel: "Manageable. Breathing up a bit, but never strained.",
      cue: "Do not chase pace. Build tolerance.",
      notes: "This is not a pace test.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Easy run with short quicker pickups",
      distanceKm: 4,
      durationMin: 30,
      goal: "Introduce light pace changes without turning the whole run hard.",
      feel: "Mostly easy. The quicker bits should feel controlled and short.",
      cue: "The quicker pieces should wake you up, not wreck you.",
      steps: [
        "Warm up with 5 minutes brisk walking.",
        "Run easy using 2 minutes run / 1 minute walk if needed.",
        "Near the middle or end, do 4 rounds of 20 seconds a little quicker with full easy recovery after each one.",
        "Keep the overall session under control.",
        "Finish with easy walking.",
      ],
      notes: "If BJJ fatigue is high, keep the whole run easy.",
    }),
    friday: longRun({
      id: "friday-run",
      durationMin: 30,
      durationMaxMin: 35,
      runMin: 2,
      walkMin: 1,
      distanceKm: 5,
      goal: "Build time on feet and basic endurance.",
      feel: "Slow, patient, sustainable.",
      cue: "Finishing with something left is success.",
      notes: "Distance is secondary to control.",
    }),
  },
  {
    week: 2,
    tuesday: easyTimedRun({
      id: "tuesday-run",
      durationMin: 30,
      runMin: 3,
      walkMin: 1,
      distanceKm: 3.5,
      goal: "Slightly increase volume while keeping impact controlled.",
      feel: "Comfortable. No pressure to push pace.",
      cue: "If it feels hard, slow down and shorten the stride.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Easy run + strides",
      distanceKm: 4.5,
      durationMin: 30,
      goal: "Build easy volume and introduce relaxed leg speed.",
      feel: "Mostly easy. Strides should feel smooth, not hard.",
      cue: "Strides are controlled fast running, not sprinting.",
      steps: [
        "Warm up with 5 minutes brisk walking.",
        "Run easy using 3 minutes run / 1 minute walk if needed.",
        "Near the end, do 4 relaxed strides of 15 to 20 seconds.",
        "Walk or jog easily between strides.",
        "Finish the session easy.",
      ],
      notes: "Skip strides if legs are too cooked from BJJ.",
    }),
    friday: longRun({
      id: "friday-run",
      durationMin: 35,
      runMin: 3,
      walkMin: 1,
      distanceKm: 6,
      goal: "Increase endurance while staying within recovery limits.",
      feel: "Steady and under control.",
      cue: "The point is calm completion, not speed.",
    }),
  },
  {
    week: 3,
    tuesday: easyTimedRun({
      id: "tuesday-run",
      durationMin: 30,
      durationMaxMin: 35,
      runMin: 4,
      walkMin: 1,
      distanceKm: 4,
      goal: "Extend running time while keeping form under control.",
      feel: "Comfortable overall, with the walk resets keeping it sustainable.",
      cue: "Stay relaxed. You are building rhythm now.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Steady intervals",
      distanceKm: 5,
      durationMin: 35,
      goal: "Introduce controlled moderate work.",
      feel: "The steady parts should feel noticeable, but never desperate.",
      cue: "Controlled is the word. Do not race the intervals.",
      steps: [
        "Warm up with 5 minutes brisk walking.",
        "Jog easy to settle in.",
        "Do 3 rounds of 3 minutes steady, followed by 2 minutes easy jog or walk.",
        "Complete the rest of the session at easy effort.",
        "Cool down with walking.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      durationMin: 40,
      runMin: 4,
      walkMin: 1,
      distanceKm: 7,
      goal: "Build longer aerobic work without overreaching.",
      feel: "Easy and sustainable.",
      cue: "Long run means patient, not proud.",
    }),
  },
  {
    week: 4,
    tuesday: easyTimedRun({
      id: "tuesday-run",
      durationMin: 30,
      runMin: 4,
      walkMin: 1,
      distanceKm: 3.5,
      goal: "Absorb the first block and reduce stress.",
      feel: "Light and controlled.",
      cue: "Cutback week. Do less so the next weeks work.",
      notes: "This is a recovery-oriented week.",
    }),
    thursday: easyTimedRun({
      id: "thursday-run",
      durationMin: 30,
      runMin: 4,
      walkMin: 1,
      distanceKm: 4,
      goal: "Keep the habit while reducing fatigue.",
      feel: "Easy all the way through.",
      cue: "No sneaky hard effort this week.",
    }),
    friday: longRun({
      id: "friday-run",
      durationMin: 35,
      runMin: 4,
      walkMin: 1,
      distanceKm: 5.5,
      goal: "Maintain endurance while recovering.",
      feel: "Comfortable and under control.",
      cue: "This is a lighter week on purpose.",
    }),
  },
  {
    week: 5,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 4.5,
      goal: "Resume progression after cutback week.",
      feel: "Easy conversation pace.",
      cue: "Easy means easy even if ego complains.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Steady intervals",
      distanceKm: 5.5,
      durationMin: 35,
      goal: "Build controlled moderate running strength.",
      feel: "Steady efforts are focused, not frantic.",
      cue: "Keep the moderate parts repeatable.",
      steps: [
        "Warm up with 5 minutes brisk walking.",
        "Jog easy to settle.",
        "Do 4 rounds of 3 minutes steady with 2 minutes easy between.",
        "Complete the run easy.",
        "Walk to cool down.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 8,
      goal: "Build endurance and time on feet.",
      feel: "Slow and sustainable.",
      cue: "You should finish knowing you could do a bit more.",
    }),
  },
  {
    week: 6,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 5,
      goal: "Continue aerobic development.",
      feel: "Controlled and boring, which is exactly right.",
      cue: "Do not spice this up.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Steady run",
      distanceKm: 6,
      goal: "Learn to hold a continuous steady effort.",
      feel: "Controlled discomfort, not strain.",
      cue: "Stay smooth. You are not trying to impress anyone.",
      steps: [
        "Warm up with 5 minutes brisk walking.",
        "Run easy for the opening section.",
        "Hold 15 minutes at steady effort.",
        "Return to easy pace to finish.",
        "Cool down with walking.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 9,
      goal: "Increase long-run durability.",
      feel: "Slow, even, patient.",
      cue: "Don’t surge late. Keep the whole run honest.",
    }),
  },
  {
    week: 7,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 5,
      goal: "Build easy volume and maintain freshness.",
      feel: "Easy all the way.",
      cue: "Easy days create hard-day quality later.",
      notes: "Finish with 4 relaxed strides if legs feel good.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Brisk intervals",
      distanceKm: 6,
      goal: "Introduce slightly sharper work without sprinting.",
      feel: "Noticeably harder than easy, but controlled.",
      cue: "Brisk is not all-out.",
      steps: [
        "Warm up with 5 minutes brisk walking.",
        "Jog easily to settle in.",
        "Do 5 rounds of 2 minutes brisk and 2 minutes easy.",
        "Finish the rest of the session easy.",
        "Cool down with walking.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 10,
      goal: "Reach a double-digit long run with control.",
      feel: "Steady and sustainable.",
      cue: "No racing the first half.",
    }),
  },
  {
    week: 8,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 4,
      goal: "Recover while keeping rhythm.",
      feel: "Easy.",
      cue: "Cutback week again. Use it properly.",
    }),
    thursday: easyDistanceRun({
      id: "thursday-run",
      distanceKm: 5,
      title: "Easy run",
      goal: "Keep the habit and keep stress down.",
      feel: "Calm and relaxed.",
      cue: "No hidden moderate effort.",
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 7,
      goal: "Reduce fatigue before the next build block.",
      feel: "Easy and controlled.",
      cue: "Finish fresh.",
    }),
  },
  {
    week: 9,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 5.5,
      goal: "Return to progression after cutback.",
      feel: "Easy conversation pace.",
      cue: "Do not drift into moderate effort.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Steady intervals",
      distanceKm: 6.5,
      goal: "Develop controlled aerobic strength.",
      feel: "Steady segments should feel focused but not heavy.",
      cue: "Repeatable beats dramatic.",
      steps: [
        "Warm up well.",
        "Do 3 rounds of 5 minutes steady with easy jogging between.",
        "Run the rest easy.",
        "Cool down with walking.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 11,
      goal: "Extend long-run durability again.",
      feel: "Slow, even, sustainable.",
      cue: "Stay patient.",
    }),
  },
  {
    week: 10,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 6,
      goal: "Build easy aerobic volume.",
      feel: "Comfortable and controlled.",
      cue: "This is not a test.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Steady run",
      distanceKm: 7,
      goal: "Hold a longer continuous steady effort.",
      feel: "Moderate and controlled.",
      cue: "The steady block should never become a scramble.",
      steps: [
        "Warm up with 5 minutes brisk walking.",
        "Run easy first.",
        "Hold 20 minutes steady.",
        "Finish easy.",
        "Cool down with walking.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 12,
      goal: "Build endurance toward 15K readiness.",
      feel: "Calm and sustainable.",
      cue: "Run your own pace, not your hopes.",
    }),
  },
  {
    week: 11,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 6,
      goal: "Support volume while staying fresh enough for quality work.",
      feel: "Easy.",
      cue: "Finish with 4 relaxed strides only if legs feel good.",
      notes: "Optional relaxed strides at the end.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Tempo intervals",
      distanceKm: 7,
      goal: "Introduce controlled tempo running.",
      feel: "Firm effort, but sustainable for the reps.",
      cue: "Tempo is controlled hard, not a race effort.",
      steps: [
        "Warm up with 5 minutes brisk walking.",
        "Jog easy to settle.",
        "Do 4 rounds of 4 minutes tempo with 2 minutes easy between.",
        "Finish easy.",
        "Cool down with walking.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 13,
      goal: "Keep extending long-run comfort.",
      feel: "Easy and patient.",
      cue: "The long run is still not a performance session.",
    }),
  },
  {
    week: 12,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 5,
      goal: "Reduce accumulated fatigue.",
      feel: "Easy and relaxed.",
      cue: "Cutback means cut back.",
    }),
    thursday: easyDistanceRun({
      id: "thursday-run",
      distanceKm: 6,
      goal: "Keep the habit without stress.",
      feel: "Easy.",
      cue: "No pushing.",
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 9,
      goal: "Recover while maintaining long-run habit.",
      feel: "Comfortable.",
      cue: "This week is for absorbing work.",
    }),
  },
  {
    week: 13,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 6,
      goal: "Resume build after cutback.",
      feel: "Easy.",
      cue: "Stay smooth.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Tempo intervals",
      distanceKm: 7.5,
      goal: "Lift threshold gently.",
      feel: "Controlled, firm effort.",
      cue: "Never sprint the tempo parts.",
      steps: [
        "Warm up well.",
        "Do 2 rounds of 10 minutes tempo with 3 minutes easy between.",
        "Finish easy.",
        "Cool down.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 14,
      goal: "Prepare for the first 15K completion.",
      feel: "Steady and sustainable.",
      cue: "Keep it patient from start to finish.",
    }),
  },
  {
    week: 14,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 6,
      goal: "Support the big week without extra fatigue.",
      feel: "Easy.",
      cue: "This day is not where you prove anything.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Tempo run",
      distanceKm: 8,
      goal: "Hold a stronger continuous effort before the weekend.",
      feel: "Moderate to firm, but under control.",
      cue: "Stay smooth through the tempo block.",
      steps: [
        "Warm up well.",
        "Run easy first.",
        "Hold 25 minutes tempo.",
        "Finish easy.",
        "Cool down with walking.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 15,
      goal: "Complete the 15K distance in control.",
      feel: "Steady, patient, not race-like.",
      cue: "Complete the distance, do not try to impress yourself.",
    }),
  },
  {
    week: 15,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 5,
      goal: "Freshen up a little after the first full 15K.",
      feel: "Easy.",
      cue: "Take the pressure off.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Fartlek",
      distanceKm: 6,
      goal: "Introduce sharper changes in pace while keeping fun and control.",
      feel: "The fast parts are snappy, the easy parts are truly easy.",
      cue: "Fast is controlled, not chaotic.",
      steps: [
        "Warm up well.",
        "Do 8 rounds of 1 minute faster and 2 minutes easy.",
        "Stay relaxed during the faster minutes.",
        "Cool down.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 11,
      goal: "Back off slightly before the next push.",
      feel: "Easy and controlled.",
      cue: "A lighter week is smart, not weak.",
    }),
  },
  {
    week: 16,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 6,
      goal: "Support the final build week.",
      feel: "Easy.",
      cue: "Keep it calm.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Tempo intervals",
      distanceKm: 8,
      goal: "Sharpen controlled faster running.",
      feel: "Firm, controlled tempo effort.",
      cue: "Tempo should feel strong, not ragged.",
      steps: [
        "Warm up properly.",
        "Do 3 rounds of 8 minutes tempo with easy jogging between.",
        "Finish easy.",
        "Cool down.",
      ],
    }),
    friday: {
      id: "friday-run",
      sessionType: "run",
      title: "Controlled 15K",
      prescriptionMode: "distance",
      distanceKm: 15,
      targetEffort: "moderate",
      goal: "Run the full 15K with a little more control and confidence.",
      howItShouldFeel: "Comfortable early, controlled later, maybe slightly stronger in the final 3 km.",
      executionSteps: [
        "Start slower than you think you should.",
        "Settle into controlled rhythm.",
        "If you feel good, let the last 3 km be slightly quicker.",
        "Do not sprint the finish.",
      ],
      coachingCue: "Strong second half beats proud first half.",
      notes: "This is still not the 5:15 race effort target.",
    },
  },
  {
    week: 17,
    mondayOptionalRun: optionalRecoveryJog(3),
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 6,
      goal: "Keep aerobic volume steady.",
      feel: "Easy.",
      cue: "Protect quality day legs.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "1K intervals",
      distanceKm: 8,
      goal: "Start race-focused work.",
      feel: "Harder than tempo, but measured.",
      cue: "Each rep should look like the last one.",
      steps: [
        "Warm up thoroughly.",
        "Run 5 × 1 km at controlled hard effort.",
        "Take easy jogging recovery between reps.",
        "Cool down fully.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 12,
      goal: "Maintain endurance during the speed phase.",
      feel: "Easy.",
      cue: "Long run still stays easy.",
    }),
  },
  {
    week: 18,
    mondayOptionalRun: optionalRecoveryJog(3.5),
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 6,
      goal: "Support pace work without extra fatigue.",
      feel: "Easy.",
      cue: "Keep it smooth.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Tempo intervals",
      distanceKm: 10,
      goal: "Raise sustainable race-specific pace.",
      feel: "Firm and controlled.",
      cue: "The tempo should be honest, not heroic.",
      steps: [
        "Warm up well.",
        "Run 2 × 3 km at tempo effort with 4 minutes easy between.",
        "Cool down fully.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 14,
      goal: "Keep endurance high.",
      feel: "Easy and patient.",
      cue: "Resist the urge to turn this into a test.",
    }),
  },
  {
    week: 19,
    mondayOptionalRun: optionalRecoveryJog(4),
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 6,
      goal: "Maintain freshness and frequency.",
      feel: "Easy.",
      cue: "Finish with relaxed strides only if legs are good.",
      notes: "Optional relaxed strides at the end.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "800m intervals",
      distanceKm: 9,
      goal: "Sharpen pace and rhythm.",
      feel: "Hard but controlled.",
      cue: "Stay relaxed under speed.",
      steps: [
        "Warm up thoroughly.",
        "Run 6 × 800m a little quicker than tempo.",
        "Jog easily between reps.",
        "Cool down fully.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 15,
      goal: "Keep the long-run distance normal while speed work rises.",
      feel: "Easy.",
      cue: "Protect the hard day by keeping this truly easy.",
    }),
  },
  {
    week: 20,
    mondayOptionalRun: optionalRecoveryJog(4),
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 6,
      goal: "Maintain aerobic support.",
      feel: "Easy.",
      cue: "No pushing today.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Tempo run",
      distanceKm: 8,
      goal: "Hold stronger effort continuously.",
      feel: "Firm and steady.",
      cue: "Settle early, grind never.",
      steps: [
        "Warm up well.",
        "Run 25 minutes tempo continuous.",
        "Cool down properly.",
      ],
    }),
    friday: {
      id: "friday-run",
      sessionType: "run",
      title: "Progressive long run",
      prescriptionMode: "distance",
      distanceKm: 13,
      targetEffort: "moderate",
      goal: "Blend endurance with a controlled stronger finish.",
      howItShouldFeel: "Easy for most of the run, steady in the final 3 km.",
      executionSteps: [
        "Start relaxed.",
        "Run the first 10 km easy.",
        "Run the final 3 km at steady, controlled effort.",
        "Do not let steady become hard.",
      ],
      coachingCue: "Strong finish, not dramatic finish.",
    },
  },
  {
    week: 21,
    mondayOptionalRun: optionalRecoveryJog(4),
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 6,
      goal: "Maintain volume.",
      feel: "Easy.",
      cue: "Keep the legs fresh for intervals.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "1K intervals",
      distanceKm: 8.5,
      goal: "Further sharpen pace around 10K effort.",
      feel: "Hard but repeatable.",
      cue: "Consistency over one flashy rep.",
      steps: [
        "Warm up thoroughly.",
        "Run 5 × 1 km around 10K effort.",
        "Recover with easy jogging.",
        "Cool down.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 15,
      goal: "Maintain the full distance as normal.",
      feel: "Easy.",
      cue: "You already know this distance. Respect it.",
    }),
  },
  {
    week: 22,
    mondayOptionalRun: optionalRecoveryJog(4),
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 5,
      goal: "Slightly reduce volume to freshen up.",
      feel: "Easy.",
      cue: "Take the small step back to move better forward.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Tempo intervals",
      distanceKm: 9,
      goal: "Improve sustainable pace at a specific effort.",
      feel: "Firm and smooth.",
      cue: "Tempo is a squeeze, not a sprint.",
      steps: [
        "Warm up well.",
        "Run 3 × 2 km tempo with easy recovery between.",
        "Cool down.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 12,
      goal: "Maintain endurance with lower fatigue.",
      feel: "Easy.",
      cue: "Keep it controlled.",
    }),
  },
  {
    week: 23,
    mondayOptionalRun: optionalRecoveryJog(3),
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 5,
      goal: "Stay loose while tapering a little.",
      feel: "Easy.",
      cue: "A few relaxed strides only if you feel good.",
      notes: "Optional relaxed strides at the end.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Tempo run",
      distanceKm: 7,
      goal: "Keep some sharpness without overloading.",
      feel: "Firm, smooth, controlled.",
      cue: "Short and sharp, not hard and exhausting.",
      steps: [
        "Warm up well.",
        "Run 20 minutes tempo continuous.",
        "Cool down properly.",
      ],
    }),
    friday: longRun({
      id: "friday-run",
      distanceKm: 10,
      goal: "Reduce fatigue before the test week.",
      feel: "Comfortable.",
      cue: "This is not where you show race legs.",
    }),
  },
  {
    week: 24,
    tuesday: easyDistanceRun({
      id: "tuesday-run",
      distanceKm: 4,
      goal: "Stay loose and ready.",
      feel: "Very easy.",
      cue: "Do less, not more.",
    }),
    thursday: steadyHybridRun({
      id: "thursday-run",
      title: "Relaxed speed session",
      distanceKm: 5,
      goal: "Wake the legs up before the test.",
      feel: "Light and snappy, never draining.",
      cue: "You are tuning, not training.",
      steps: [
        "Warm up well.",
        "Run 4 × 400m relaxed fast with full easy recovery.",
        "Cool down properly.",
      ],
    }),
    friday: {
      id: "friday-run",
      sessionType: "run",
      title: "15K test",
      prescriptionMode: "distance",
      distanceKm: 15,
      targetEffort: "hard",
      goal: "Run your best controlled 15K and move toward the pace target.",
      howItShouldFeel: "Controlled for the first third, committed in the middle, hard but composed late.",
      executionSteps: [
        "First 5K: stay controlled.",
        "Middle 5K: lock into rhythm and hold form.",
        "Final 5K: squeeze pace only if you still have it.",
        "Do not blast the opening kilometers.",
      ],
      coachingCue: "Start disciplined or finish disappointed.",
      notes: "This is your first real shot at the stronger 15K pace.",
    },
  },
];