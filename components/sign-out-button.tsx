"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function SignOutButton({
  className = "",
}: {
  className?: string;
}) {
  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className={`inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 ${className}`}
    >
      Logout
    </button>
  );
}