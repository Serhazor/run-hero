import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import AppHeader from "@/components/app-header";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
          <AppHeader />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}