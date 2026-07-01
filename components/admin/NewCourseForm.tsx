"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DEPARTMENTS = ["CSE", "EEE", "BBA", "PHY", "MAT", "ECO", "ENH", "Other"];
const ACCENT_COLORS = [
  "#1a6b3c","#1a3d6b","#6b1a3d","#6b3d1a","#1a6b5a",
  "#3d6b1a","#6b1a6b","#1a1a6b","#6b6b1a","#6b1a1a",
];

export default function NewCourseForm() {
  const router = useRouter();
  const [type, setType] = useState<"bracu" | "external">("bracu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);

  const [form, setForm] = useState({
    title:       "",
    department:  "CSE",
    description: "",
    code:        "",
    credits:     "3",
    semester:    "Spring 2025",
    labCourse:   false,
    prerequisites: "",
    tags:        "",
    category:    "",
    provider:    "",
    level:       "Beginner",
    published:   true,
  });

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.title) { setError("Title is required"); return; }
    if (type === "bracu" && !form.code) { setError("Course code is required for BRACU courses"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type,
          accentColor,
          credits:      parseInt(form.credits) || 3,
          prerequisites: form.prerequisites.split(",").map((s) => s.trim()).filter(Boolean),
          tags:          form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create course");
        return;
      }

      const data = await res.json();
      router.push(`/admin/courses/${data.id}`);
    } catch (e) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">

      {/* Type selector */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-3">
          Course Type
        </label>
        <div className="flex gap-3">
          {(["bracu", "external"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all"
              style={{
                background:  type === t ? "#d4a01722" : "#1a1a1a",
                borderColor: type === t ? "#d4a017"   : "#2a2a2a",
                color:       type === t ? "#d4a017"   : "#888",
              }}
            >
              {t === "bracu" ? "🎓 BRACU Course" : "🌐 External Course"}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          Course Title *
        </label>
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Programming Language I"
          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* BRACU specific fields */}
      {type === "bracu" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
              Course Code *
            </label>
            <input
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
              placeholder="e.g. CSE110"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
              Credits
            </label>
            <input
              type="number"
              value={form.credits}
              onChange={(e) => update("credits", e.target.value)}
              min="1"
              max="6"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
              Semester
            </label>
            <input
              value={form.semester}
              onChange={(e) => update("semester", e.target.value)}
              placeholder="e.g. Spring 2025"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
              Department
            </label>
            <select
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* External specific fields */}
      {type === "external" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
              Category
            </label>
            <input
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="e.g. Bootcamp, Certification"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
              Provider
            </label>
            <input
              value={form.provider}
              onChange={(e) => update("provider", e.target.value)}
              placeholder="e.g. freeCodeCamp"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
              Level
            </label>
            <select
              value={form.level}
              onChange={(e) => update("level", e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              {["Beginner","Intermediate","Advanced"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
              Department / Topic
            </label>
            <input
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              placeholder="e.g. Programming"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="What is this course about?"
          rows={3}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
        />
      </div>

      {/* Prerequisites + Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
            Prerequisites
          </label>
          <input
            value={form.prerequisites}
            onChange={(e) => update("prerequisites", e.target.value)}
            placeholder="CSE110, CSE111"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <p className="text-xs text-neutral-600 mt-1">Comma separated</p>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
            Tags
          </label>
          <input
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            placeholder="python, beginner, oop"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <p className="text-xs text-neutral-600 mt-1">Comma separated</p>
        </div>
      </div>

      {/* Accent color */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-3">
          Card Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className="w-8 h-8 rounded-lg border-2 transition-all"
              style={{
                background:   color,
                borderColor:  accentColor === color ? "#fff" : "transparent",
                transform:    accentColor === color ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>
        {/* Preview */}
        <div
          className="mt-3 h-16 rounded-xl flex items-end p-3"
          style={{ background: `linear-gradient(135deg, ${accentColor}cc, #111)` }}
        >
          <div>
            <p className="text-xs text-white/50 font-mono">{form.code || "CODE"}</p>
            <p className="text-sm font-semibold text-white">{form.title || "Course Title"}</p>
          </div>
        </div>
      </div>

      {/* Lab course + Published toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => update("labCourse", !form.labCourse)}
            className="w-10 h-6 rounded-full transition-colors relative"
            style={{ background: form.labCourse ? "#d4a017" : "#2a2a2a" }}
          >
            <div
              className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
              style={{ left: form.labCourse ? "22px" : "4px" }}
            />
          </div>
          <span className="text-sm text-neutral-300">Lab Course</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => update("published", !form.published)}
            className="w-10 h-6 rounded-full transition-colors relative"
            style={{ background: form.published ? "#22c55e" : "#2a2a2a" }}
          >
            <div
              className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
              style={{ left: form.published ? "22px" : "4px" }}
            />
          </div>
          <span className="text-sm text-neutral-300">Published</span>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-3 rounded-xl font-semibold text-sm text-black transition-colors disabled:opacity-50"
          style={{ background: "#d4a017" }}
        >
          {loading ? "Creating..." : "Create Course →"}
        </button>
      </div>
    </div>
  );
}