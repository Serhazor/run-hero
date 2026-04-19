"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card-shell mx-auto max-w-md rounded-[30px] p-6"
    >
      <p className="text-xs uppercase tracking-[0.25em] text-sky-300/80">Private access</p>
      <h1 className="mt-2 text-3xl font-bold text-white [font-family:var(--font-display)]">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        It is your tracker. Let’s not turn it into a public bathroom wall.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm text-slate-300">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      {message ? <p className="mt-4 text-sm text-orange-300">{message}</p> : null}
    </form>
  );
}