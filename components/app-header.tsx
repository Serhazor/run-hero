"use client";

import { useState } from "react";
import Link from "next/link";
import SignOutButton from "@/components/sign-out-button";

const nav = [
  { href: "/", label: "Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/plan", label: "Plan" },
  { href: "/stats", label: "Stats" },
  { href: "/progress", label: "Progress" },
];

export default function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="card-shell mb-4 rounded-[24px] px-4 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.28)] md:sticky md:top-4 md:z-30 md:mb-6 md:rounded-[28px] md:px-5 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-sky-300/80 md:text-xs">
              Training build
            </p>
            <h1 className="truncate text-xl font-bold tracking-tight text-white [font-family:var(--font-display)] md:text-2xl">
              BJJ + Couch to 15K
            </h1>
            <p className="mt-1 hidden text-sm text-slate-400 md:block">
              Private tracker. Actual progress. Less nonsense.
            </p>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <nav className="flex flex-wrap gap-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <SignOutButton />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        {open ? (
          <div
            id="mobile-nav-panel"
            className="mt-4 border-t border-white/10 pt-4 md:hidden"
          >
            <nav className="grid grid-cols-2 gap-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-slate-200 transition hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-3">
              <SignOutButton className="w-full justify-center" />
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}