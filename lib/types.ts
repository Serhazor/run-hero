export type Effort = "easy" | "moderate" | "hard";

export type SessionType =
  | "run"
  | "bjj"
  | "strength"
  | "recovery"
  | "sauna";

export type PrescriptionMode = "time" | "distance" | "hybrid";

export interface RunInterval {
  runMin: number;
  walkMin: number;
  repeats?: number;
}

export interface PlannedExercise {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: number;
  repRange?: string;
  defaultWeightKg?: number;
  targetEffort?: Effort;
  howItShouldFeel?: string;
  notes?: string;
}

export interface PlannedSession {
  id: string;
  sessionType: SessionType;
  title: string;
  timeLabel?: string;
  optional?: boolean;

  prescriptionMode?: PrescriptionMode;
  distanceKm?: number;
  durationMin?: number;
  durationMaxMin?: number;
  interval?: RunInterval;

  targetEffort?: Effort;
  howItShouldFeel?: string;
  goal?: string;
  executionSteps?: string[];
  coachingCue?: string;
  notes?: string;

  exercises?: PlannedExercise[];
}

export interface WeekRunPlan {
  week: number;
  mondayOptionalRun?: PlannedSession;
  tuesday: PlannedSession;
  thursday: PlannedSession;
  friday: PlannedSession;
}

export interface ActualExerciseEntry {
  name: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
  notes?: string;
}

export interface SessionLog {
  id?: string;
  log_date: string;
  session_key: string;
  session_type: SessionType;
  title: string;
  completed: boolean;
  actual_effort: Effort | null;
  actual_distance_km: number | null;
  actual_duration_min: number | null;
  actual_notes: string | null;
  actual_exercises: ActualExerciseEntry[];
}

export interface PhotoLog {
  id: string;
  log_date: string;
  session_key: string;
  storage_path: string;
  public_url: string;
  created_at: string;
}

export interface DayApiResponse {
  logs: SessionLog[];
  summary: string | null;
  photos: PhotoLog[];
}

export interface StatsApiResponse {
  totalCompletedSessions: number;
  completedRuns: number;
  totalRunKm30d: number;
  longestRunKm: number;
  averageRunPaceMinPerKm: number | null;
  hardSessions30d: number;
  completionRate30d: number;
  pullupReps30d: number;
  dailyRunDistance14d: Array<{ date: string; km: number }>;
  effortCounts30d: {
    easy: number;
    moderate: number;
    hard: number;
  };
}