"use client";
import { useState } from "react";

interface Faculty {
  id: string;
  name: string;
  section?: string;
  videoCount: number;
}

interface Props {
  courseId: string;
  moduleId: string;
  faculties: Faculty[];
  onAdded: (item: any) => void;
}

const ITEM_TYPES = [
  { type: "video",      icon: "▶",  label: "Video" },
  { type: "slide",      icon: "📊", label: "Slide" },
  { type: "note",       icon: "📝", label: "Note" },
  { type: "assignment", icon: "📋", label: "Assignment" },
  { type: "lab",        icon: "🧪", label: "Lab" },
  { type: "quiz",       icon: "❓", label: "Quiz" },
  { type: "resource",   icon: "🔗", label: "Resource" },
];

export default function AddModuleItemForm({ courseId, moduleId, faculties, onAdded }: Props) {
  const [selectedType, setSelectedType] = useState("video");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [form, setForm] = useState({
    title:       "",
    description: "",
    youtubeId:   "",
    facultyId:   faculties[0]?.id ?? "",
    duration:    "",
    externalUrl: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.title) { setError("Title is required"); return; }
    if (selectedType === "video" && !form.youtubeId) {
      setError("YouTube video ID is required for videos");
      return;
    }

    setLoading(true);
    try {
      const body: any = {
        type:        selectedType,
        title:       form.title,
        description: form.description,
      };

      if (selectedType === "video") {
        body.youtubeId = form.youtubeId;
        body.facultyId = form.facultyId;
        body.duration  = form.duration;
      } else if (selectedType === "resource") {
        body.externalUrl = form.externalUrl;
      }

      const res = await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/items`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to add item"); return; }

      onAdded(data);
      setForm({ title: "", description: "", youtubeId: "", facultyId: faculties[0]?.id ?? "", duration: "", externalUrl: "" });
    } catch (e) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 space-y-5">
      <h3 className="text-sm font-semibold text-white">Add Content Item</h3>

      {/* Type selector */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-3">
          Content Type
        </label>
        <div className="flex gap-2 flex-wrap">
          {ITEM_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => setSelectedType(t.type)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all"
              style={{
                background:  selectedType === t.type ? "#d4a01722" : "#1a1a1a",
                borderColor: selectedType === t.type ? "#d4a017"   : "#2a2a2a",
                color:       selectedType === t.type ? "#d4a017"   : "#888",
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          Title *
        </label>
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Introduction to Variables"
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          Description
        </label>
        <input
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Short description (optional)"
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Video-specific fields */}
      {selectedType === "video" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
                YouTube Video ID *
              </label>
              <input
                value={form.youtubeId}
                onChange={(e) => update("youtubeId", e.target.value)}
                placeholder="e.g. dQw4w9WgXcQ"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
              <p className="text-xs text-neutral-600 mt-1">
                The part after ?v= in the YouTube URL
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
                Duration
              </label>
              <input
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                placeholder="e.g. 45:12"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {faculties.length > 0 && (
            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
                Faculty
              </label>
              <select
                value={form.facultyId}
                onChange={(e) => update("facultyId", e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.section ? `(Section ${f.section})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Resource-specific fields */}
      {selectedType === "resource" && (
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
            External URL
          </label>
          <input
            value={form.externalUrl}
            onChange={(e) => update("externalUrl", e.target.value)}
            placeholder="https://..."
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      )}

      {/* File upload note for non-video, non-resource types */}
      {!["video", "resource"].includes(selectedType) && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3">
          <p className="text-xs text-neutral-400">
            📁 File upload for {selectedType}s is coming in Module 09.
            For now, add a title and description to reserve the slot.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm text-black transition-colors disabled:opacity-50"
        style={{ background: "#d4a017" }}
      >
        {loading ? "Adding..." : `Add ${ITEM_TYPES.find(t => t.type === selectedType)?.label}`}
      </button>
    </div>
  );
}