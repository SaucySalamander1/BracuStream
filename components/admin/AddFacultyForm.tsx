"use client";
import { useState } from "react";

interface Faculty {
  id: string;
  name: string;
  section?: string;
  designation?: string;
  playlistUrl: string;
  videoCount: number;
}

interface Props {
  courseId: string;
  onAdded: (faculty: Faculty) => void;
}

export default function AddFacultyForm({ courseId, onAdded }: Props) {
  const [form, setForm] = useState({
    name:        "",
    section:     "",
    designation: "",
    playlistUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.name)        { setError("Faculty name is required"); return; }
    if (!form.playlistUrl) { setError("YouTube playlist URL is required"); return; }
    if (!form.playlistUrl.includes("youtube.com") && !form.playlistUrl.includes("youtu.be")) {
      setError("Please enter a valid YouTube playlist URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/faculties`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to add faculty");
        return;
      }

      setSuccess(`✅ ${form.name} added — ${data.videoCount} videos fetched!`);
      onAdded(data);
      setForm({ name: "", section: "", designation: "", playlistUrl: "" });
    } catch (e) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">

      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
            Faculty Name *
          </label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Dr. Nabil"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Section */}
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
            Section
          </label>
          <input
            value={form.section}
            onChange={(e) => update("section", e.target.value)}
            placeholder="e.g. 01"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Designation */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          Designation
        </label>
        <input
          value={form.designation}
          onChange={(e) => update("designation", e.target.value)}
          placeholder="e.g. Associate Professor"
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Playlist URL */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          YouTube Playlist URL *
        </label>
        <input
          value={form.playlistUrl}
          onChange={(e) => update("playlistUrl", e.target.value)}
          placeholder="https://www.youtube.com/playlist?list=..."
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-mono text-xs"
        />
        <p className="text-xs text-neutral-600 mt-1">
          Videos will be automatically fetched from YouTube
        </p>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-950 border border-green-800 rounded-xl px-4 py-3">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm text-black transition-colors disabled:opacity-50"
        style={{ background: "#d4a017" }}
      >
        {loading ? "Fetching videos from YouTube..." : "Add Faculty & Import Playlist"}
      </button>
    </div>
  );
}