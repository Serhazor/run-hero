export function formatSupabaseError(error: any) {
  if (!error) {
    return { message: "Unknown Supabase error." };
  }

  return {
    message: error.message ?? "Supabase error",
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
    raw: error,
  };
}
