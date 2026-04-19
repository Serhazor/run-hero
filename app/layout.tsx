import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "BJJ Run Tracker",
  description: "Training tracker for running, BJJ, strength, recovery, stats, and photos.",
};

const nav = [
  { href: "/", label: "Today" },
  { href: "/calendar", label: "Calendar" },
  { href: "/plan", label: "Plan" },
  { href: "/stats", label: "Stats" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <header className="card-shell sticky top-4 z-30 mb-6 rounded-[28px] px-5 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-sky-300/80">
                  Training build
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white [font-family:var(--font-display)]">
                  BJJ + Couch to 15K
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Plan first. Data second. Injuries never, ideally.
                </p>
              </div>

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
            </div>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}