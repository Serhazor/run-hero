"use client";

import { useEffect, useMemo, useState } from "react";

type PhotoLog = {
  id: string;
  public_url: string;
};

type PhotoDayGroup = {
  date: string;
  weightKg: number | null;
  photos: PhotoLog[];
};

export default function PhotoComparisonClient() {
  const [groups, setGroups] = useState<PhotoDayGroup[]>([]);
  const [leftDate, setLeftDate] = useState("");
  const [rightDate, setRightDate] = useState("");

  useEffect(() => {
    fetch("/api/photos")
      .then((res) => res.json())
      .then((data) => {
        const nextGroups = data.groups ?? [];
        setGroups(nextGroups);

        if (nextGroups.length >= 2) {
          setLeftDate(nextGroups[nextGroups.length - 1].date);
          setRightDate(nextGroups[0].date);
        } else if (nextGroups.length === 1) {
          setLeftDate(nextGroups[0].date);
          setRightDate(nextGroups[0].date);
        }
      });
  }, []);

  const left = useMemo(() => groups.find((g) => g.date === leftDate), [groups, leftDate]);
  const right = useMemo(() => groups.find((g) => g.date === rightDate), [groups, rightDate]);

  return (
    <div className="space-y-6">
      <section className="card-shell rounded-[30px] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-300/80">Progress</p>
        <h2 className="mt-2 text-3xl font-bold [font-family:var(--font-display)]">
          Photo comparison
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Compare two dates side by side without pretending memory is objective.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="card-shell rounded-[24px] p-4 text-sm text-slate-300">
          Left date
          <select
            value={leftDate}
            onChange={(e) => setLeftDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            {groups.map((group) => (
              <option key={group.date} value={group.date}>
                {group.date}
              </option>
            ))}
          </select>
        </label>

        <label className="card-shell rounded-[24px] p-4 text-sm text-slate-300">
          Right date
          <select
            value={rightDate}
            onChange={(e) => setRightDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            {groups.map((group) => (
              <option key={group.date} value={group.date}>
                {group.date}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[left, right].map((group, index) => (
          <section key={index} className="card-shell rounded-[28px] p-5">
            {group ? (
              <>
                <h3 className="text-xl font-semibold text-white">{group.date}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Weight: {group.weightKg ?? "—"} kg
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {group.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.public_url}
                      alt="Progress comparison"
                      className="h-48 w-full rounded-[18px] object-cover"
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">No photos for this side.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}