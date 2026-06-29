"use client";
import { Course } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  course: Course;
}

export default function CourseCard({ course }: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => router.push(`/courses/${course.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-none w-48 rounded-xl overflow-hidden cursor-pointer border border-neutral-800 bg-neutral-900 transition-all duration-200"
      style={{
        transform: hovered ? "scale(1.05)" : "scale(1)",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.6)" : "none",
        borderColor: hovered ? "#333" : "",
      }}
    >
      {/* Thumbnail */}
      <div
        className="h-24 flex flex-col justify-end p-3 relative"
        style={{
          background: `linear-gradient(135deg, ${course.accentColor}cc, #111)`,
        }}
      >
        {/* Badge */}
        <div className="absolute top-2 right-2">
          {course.type === "bracu" ? (
            <span className="text-xs bg-amber-500 text-black font-bold px-2 py-0.5 rounded font-mono">
              {course.code}
            </span>
          ) : (
            <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded">
              {course.category}
            </span>
          )}
        </div>
        <div className="text-xs text-white/50 font-mono">{course.department}</div>
        <div className="text-sm font-semibold text-white leading-tight line-clamp-2">
          {course.title}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-neutral-900">
        <div className="text-xs text-neutral-500 mb-2">
          {course.type === "bracu"
            ? `${course.credits} credits · ${course.semester}`
            : `${course.provider} · ${course.level}`}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-xs text-neutral-400">
              {course.rating > 0 ? course.rating.toFixed(1) : "New"}
            </span>
          </div>
          {course.labCourse && (
            <span className="text-xs bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
              Lab
            </span>
          )}
        </div>
      </div>
    </div>
  );
}