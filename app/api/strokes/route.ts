import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedJson } from "@/lib/auth";
import { buildStrokePrompt, getFallbackStrokes, parseStrokeText, type StrokeContext } from "@/lib/strokes";

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  const body = (await request.json()) as StrokeContext;

  if (!body.trainingType || !body.title) {
    return NextResponse.json({ error: "Missing stroke context." }, { status: 400 });
  }

  let strokes = getFallbackStrokes(body);

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = buildStrokePrompt(body);

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (typeof text === "string" && text.trim()) {
          const parsed = parseStrokeText(text);

          if (parsed.length === 2) {
            strokes = parsed;
          }
        }
      }
    } catch {
      // Fallback remains in place. Civilization survives.
    }
  }

  return NextResponse.json({ strokes });
}