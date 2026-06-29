"use client";
import { Course } from "@/types";
import CourseCard from "./CourseCard";
import { useRef } from "react";

interface Props {
  title: string;
  courses: Course[];
  icon?: string;
}

export default function CourseRow({ title, courses, icon }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (rowRef.current) {
      rowRef.current.scrollBy({
        left: dir === "right" ? 600 : -600,
        behavior: "smooth",
      });
    }
  };

  if (courses.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between px-6 mb-3">
        <h2 className="text-base font-semibold text-neutral-200">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-sm flex items-center justify-center transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-sm flex items-center justify-center transition-colors"
          >
            ›
          </button>
        </div>
      </div>
      <div
        ref={rowRef}
        className="flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}