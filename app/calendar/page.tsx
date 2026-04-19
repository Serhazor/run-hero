import Link from "next/link";
import { addDays, formatLongDate, getTodayIsoInTimezone, getWeekNumber } from "@/lib/plan";

export default function CalendarPage() {
  const todayIso = getTodayIsoInTimezone();
  const dates = Array.from({ length: 21 }, (_, index) => addDays(todayIso, index - 10));

  return (
    <div className="space-y-6">
      <section className="card-shell rounded-[30px] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-300/80">Calendar</p>
        <h2 className="mt-2 text-3xl font-bold [font-family:var(--font-display)]">
          Pick a day
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          This lets you go back and mark sessions you forgot, because apparently human memory is still on beta.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dates.map((iso) => (
          <Link
            key={iso}
            href={`/day/${iso}`}
            className="card-shell rounded-[26px] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Week {getWeekNumber(iso)}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">{formatLongDate(iso)}</h3>
            <p className="mt-2 text-sm text-slate-400">Open and edit this day.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}