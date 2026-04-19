import { RUN_WEEKS } from "@/data/training-plan";

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <section className="card-shell rounded-[30px] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-300/80">Plan</p>
        <h2 className="mt-2 text-3xl font-bold [font-family:var(--font-display)]">
          24-week build
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Early weeks are time-based where needed, because “easy 3.5K” means very little when you are still building tolerance.
        </p>
      </section>

      <div className="grid gap-4">
        {RUN_WEEKS.map((week) => (
          <section key={week.week} className="card-shell rounded-[28px] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Week {week.week}</p>
                <h3 className="text-xl font-semibold text-white">Running block</h3>
              </div>
              {week.mondayOptionalRun ? (
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                  Optional Monday jog included
                </span>
              ) : null}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {[week.tuesday, week.thursday, week.friday].map((session) => (
                <article key={session.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{session.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-300">
                    {session.durationMin ? (
                      <span className="rounded-full bg-white/5 px-2 py-1">
                        {session.durationMaxMin
                          ? `${session.durationMin}-${session.durationMaxMin} min`
                          : `${session.durationMin} min`}
                      </span>
                    ) : null}
                    {session.distanceKm ? (
                      <span className="rounded-full bg-white/5 px-2 py-1">
                        {session.distanceKm} km
                      </span>
                    ) : null}
                    {session.interval ? (
                      <span className="rounded-full bg-white/5 px-2 py-1">
                        {session.interval.runMin}:{session.interval.walkMin} run/walk
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    <span className="font-medium text-white">Should feel:</span>{" "}
                    {session.howItShouldFeel}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{session.goal}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}