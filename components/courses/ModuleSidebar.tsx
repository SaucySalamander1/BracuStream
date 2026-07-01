"use client";
import { useRouter } from "next/navigation";
import { Course } from "@/types";

interface Module {
  id: string;
  title: string;
  week: number;
  published: boolean;
  order: number;
}

interface Props {
  courseId: string;
  course: Course;
  modules: Module[];
  activeModuleId: string;
}

export default function ModuleSidebar({ courseId, course, modules, activeModuleId }: Props) {
  const router = useRouter();

  return (
    <aside
      className="flex-none flex flex-col border-r border-neutral-800 bg-neutral-900"
      style={{ width: 260 }}
    >
      {/* Course header */}
      <div
        className="px-4 py-4 border-b border-neutral-800 cursor-pointer"
        onClick={() => router.push(`/courses/${courseId}`)}
      >
        <div className="flex items-center gap-2 mb-1">
          {course.type === "bracu" ? (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded font-mono"
              style={{ background: course.accentColor, color: "#fff" }}
            >
              {course.code}
            </span>
          ) : (
            <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded">
              External
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-white leading-tight line-clamp-2">
          {course.title}
        </p>
        <p className="text-xs text-neutral-500 mt-1">← Back to course</p>
      </div>

      {/* Modules list */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-4 py-2">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">
            {modules.length} Modules
          </p>
        </div>
        {modules.map((module) => {
          const isActive = module.id === activeModuleId;
          return (
            <button
              key={module.id}
              onClick={() =>
                router.push(`/courses/${courseId}/learn/${module.id}`)
              }
              className="w-full flex items-start gap-3 px-4 py-3 text-left border-l-2 transition-all hover:bg-neutral-800/50"
              style={{
                borderLeftColor: isActive ? course.accentColor : "transparent",
                background:      isActive ? `${course.accentColor}11` : "transparent",
              }}
            >
              {/* Week badge */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-none mt-0.5"
                style={{
                  background: isActive ? course.accentColor : "#2a2a2a",
                  color:      isActive ? "#000" : "#666",
                }}
              >
                {module.week}
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium leading-snug line-clamp-2 ${
                    isActive ? "text-white" : "text-neutral-400"
                  }`}
                >
                  {module.title}
                </p>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Week {module.week}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}