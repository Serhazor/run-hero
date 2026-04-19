"use client";

import { useRef, useState } from "react";
import type { PhotoLog } from "@/lib/types";

export default function PhotoUploader({
  dateIso,
  sessionKey,
  photos,
  onUploaded,
}: {
  dateIso: string;
  sessionKey: string;
  photos: PhotoLog[];
  onUploaded: (photo: PhotoLog) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadPhoto() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("date", dateIso);
      formData.append("sessionKey", sessionKey);

      const response = await fetch("/api/photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Photo upload failed.");
      }

      const data = await response.json();
      onUploaded(data.photo);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
      <p className="text-sm font-medium text-white">Post-training photo</p>

      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200"
        />
        <button
          type="button"
          onClick={uploadPhoto}
          disabled={loading}
          className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15 disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error ? <p className="mt-2 text-sm text-orange-300">{error}</p> : null}

      {photos.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-[18px] border border-white/10 bg-black/30">
              <img
                src={photo.public_url}
                alt="Training session"
                className="h-40 w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400">No photo uploaded for this session yet.</p>
      )}
    </div>
  );
}