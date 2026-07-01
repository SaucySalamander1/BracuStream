"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  courseId: string;
}

export default function NewModuleForm({ courseId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title:       "",
    week:        "1",
    description: "",
    published:   false,
  });

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.title) { setError("Module title is required"); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...form,
          week: parseInt(form.week) || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create module"); return; }

      router.push(`/admin/courses/${courseId}/modules/${data.id}`);
    } catch (e) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">

      {/* Title */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          Module Title *
        </label>
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Introduction to Python, Week 1"
          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Week number */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          Week Number
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={form.week}
          onChange={(e) => update("week", e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
        />
        <p className="text-xs text-neutral-600 mt-1">
          Used to group and order modules on the course page
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="What will students learn in this module?"
          rows={3}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
        />
      </div>

      {/* Published toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => update("published", !form.published)}
          className="w-10 h-6 rounded-full transition-colors relative flex-none"
          style={{ background: form.published ? "#22c55e" : "#2a2a2a" }}
        >
          <div
            className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
            style={{ left: form.published ? "22px" : "4px" }}
          />
        </div>
        <div>
          <p className="text-sm text-neutral-300 font-medium">
            {form.published ? "Published" : "Draft"}
          </p>
          <p className="text-xs text-neutral-600">
            {form.published
              ? "Students can see this module"
              : "Only visible to admins"}
          </p>
        </div>
      </label>

      {/* Error */}
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Buttons */}
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
          {loading ? "Creating..." : "Create Module →"}
        </button>
      </div>
    </div>
  );
}