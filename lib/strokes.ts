import type { Effort, SessionType } from "@/lib/types";

export type StrokeContext = {
  trainingType: SessionType;
  title: string;
  intensity: Effort | null;
  duration: number | null;
  distanceOrVolume: string;
  notes: string;
  plannedStatus: "planned" | "optional" | "extra";
  goal: string;
  consistencyContext: string;
};

const fallbackLibrary = {
  general: [
    "You showed up and did the work.",
    "That session counts. Nice consistency.",
    "Good job keeping the promise to yourself.",
    "Another step forward. Keep stacking them.",
    "You got it done, and that matters.",
    "Solid work today. That builds momentum.",
  ],
  strength: [
    "Good session. Strength grows from work like this.",
    "You moved with purpose today. That matters.",
    "That was useful work, not just effort.",
    "Strong session. The foundation is improving.",
    "You trained with intent today. Keep that.",
    "Good work reinforcing strength without chasing fatigue.",
  ],
  run: [
    "That was steady work. Your engine is improving.",
    "Good aerobic session. Base fitness is built like this.",
    "Calm, consistent effort. Exactly what was needed.",
    "You stayed patient and did real endurance work.",
    "That session will pay off over time.",
    "Good job building capacity without forcing it.",
  ],
  bjj: [
    "Good work on the mats today.",
    "That session added experience, not just sweat.",
    "You kept showing up to the craft.",
    "Technique grows through sessions like this.",
    "You put honest time into your game today.",
    "Another mat session banked. Keep building.",
  ],
  recovery: [
    "Recovery work counts too. Good call.",
    "Smart session. You trained without digging a hole.",
    "You respected recovery and still moved forward.",
    "Good discipline today. Not every win is hard.",
    "That was measured, sensible work.",
    "You did what was needed today.",
  ],
  hard: [
    "That was a tough session, and you stayed with it.",
    "You handled hard work well today.",
    "Strong effort. You did not drift or quit.",
    "You stayed engaged when it got difficult.",
    "That was demanding work. You answered it well.",
    "Good grit today. Controlled and useful.",
  ],
  easy: [
    "You kept the routine alive today.",
    "Easy work done properly still moves you forward.",
    "That was the right amount of work today.",
    "You stayed disciplined without forcing the pace.",
    "Good job keeping the session honest.",
    "That was calm, useful work.",
  ],
};

function pickTwoDistinct(items: string[]) {
  const copy = [...items];
  const firstIndex = Math.floor(Math.random() * copy.length);
  const first = copy.splice(firstIndex, 1)[0];
  const secondIndex = Math.floor(Math.random() * copy.length);
  const second = copy[secondIndex];
  return [first, second];
}

export function buildStrokePrompt(context: StrokeContext) {
  return `
You are writing two short positive strokes for a training tracking app.
These lines will be spoken aloud using browser voice after the user saves a completed session.

Write exactly 2 lines.

Rules:
- Each line must be between 6 and 12 words
- Keep the language simple and natural for speech
- The first line should acknowledge effort or completion
- The second line should reflect something specific about the session
- Focus on consistency, discipline, technique, endurance, recovery, or strength
- Match the session type and difficulty
- Sound supportive, calm, and credible
- Avoid clichés like beast mode, crushed it, no excuses, warrior
- Avoid overpraise for light or recovery sessions
- Avoid repeating the same structure too often
- Avoid emojis, hashtags, bullet points, quotation marks, sarcasm
- Do not mention AI, app, database, logging, or saving
- Do not sound like a therapist or drill sergeant

Session:
Type: ${context.trainingType}
Title: ${context.title}
Duration: ${context.duration ?? "unknown"}
Intensity: ${context.intensity ?? "unknown"}
Details: ${context.distanceOrVolume}
Notes: ${context.notes || "none"}
Goal: ${context.goal || "none"}
Planned status: ${context.plannedStatus}
Consistency context: ${context.consistencyContext}
`.trim();
}

export function parseStrokeText(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-•\d.\s]+/, "").trim())
    .filter(Boolean);

  return lines.slice(0, 2);
}

export function getFallbackStrokes(context: StrokeContext) {
  const primaryPool =
    context.trainingType === "run"
      ? fallbackLibrary.run
      : context.trainingType === "strength"
        ? fallbackLibrary.strength
        : context.trainingType === "bjj"
          ? fallbackLibrary.bjj
          : fallbackLibrary.recovery;

  const effortPool =
    context.intensity === "hard"
      ? fallbackLibrary.hard
      : fallbackLibrary.easy;

  const [one] = pickTwoDistinct(primaryPool);
  const [two] = pickTwoDistinct(effortPool);

  return [one, two];
}