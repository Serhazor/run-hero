import { NextRequest, NextResponse } from "next/server";
import { requireUser, unauthorizedJson } from "@/lib/auth";

function pcmToWavBuffer(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16,
) {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM header size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcmBuffer.copy(buffer, 44);

  return buffer;
}

export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if (!auth) return unauthorizedJson();

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY." },
      { status: 500 },
    );
  }

  const body = await request.json();
  const strokes = Array.isArray(body?.strokes) ? body.strokes.filter(Boolean) : [];

  if (strokes.length !== 2) {
    return NextResponse.json(
      { error: "Expected exactly 2 strokes." },
      { status: 400 },
    );
  }

  const transcript = `[warm, steady, encouraging] ${strokes[0]}\n${strokes[1]}`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: transcript,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Kore",
              },
            },
          },
        },
        model: "gemini-3.1-flash-tts-preview",
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: `Gemini TTS failed: ${response.status} ${errorText}` },
      { status: 500 },
    );
  }

  const data = await response.json();
  const base64Audio =
    data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio || typeof base64Audio !== "string") {
    return NextResponse.json(
      { error: "Gemini TTS returned no audio data." },
      { status: 500 },
    );
  }

  const pcmBuffer = Buffer.from(base64Audio, "base64");
  const wavBuffer = pcmToWavBuffer(pcmBuffer, 24000, 1, 16);

  return new NextResponse(new Uint8Array(wavBuffer), {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Content-Disposition": 'inline; filename="strokes.wav"',
      "Cache-Control": "no-store",
    },
  });
}