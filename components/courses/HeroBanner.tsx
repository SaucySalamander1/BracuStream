"use client";
import { Course } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  course: Course;
}

export default function HeroBanner({ course }: Props) {
  const router = useRouter();

  return (
    <div
      className="relative w-full px-6 py-16 mb-6 flex flex-col justify-end"
      style={{
        background: `linear-gradient(135deg, ${course.accentColor}88 0%, #0f0f0f 70%)`,
        minHeight: 280,
      }}
    >
      {/* Fade bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 40%, #0f0f0f 100%)",
        }}
      />

      <div className="relative z-10 max-w-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-amber-400 font-mono tracking-widest uppercase">
            ✦ Featured Course
          </span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
          {course.title}
        </h1>

        <p className="text-sm text-neutral-400 mb-2">
          {course.type === "bracu"
            ? `${course.code} · ${course.credits} credits · ${course.semester}`
            : `${course.provider} · ${course.level}`}
        </p>

        <p className="text-sm text-neutral-500 mb-6 line-clamp-2">
          {course.description}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/courses/${course.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-colors"
            style={{ background: "#d4a017" }}
          >
            ▶ Start Learning
          </button>
          <button
            onClick={() => router.push(`/courses/${course.id}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors"
          >
            ℹ More Info
          </button>
        </div>
      </div>
    </div>
  );
}