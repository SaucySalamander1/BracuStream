"use client";
import { useState } from "react";
import { Course } from "@/types";
import { useRouter } from "next/navigation";

interface Faculty {
  id: string;
  name: string;
  section?: string;
  designation?: string;
  bio?: string;
  playlistUrl: string;
  videoCount: number;
}

interface Props {
  courseId: string;
  faculties: Faculty[];
  course: Course;
}

export default function FacultySelector({ courseId, faculties, course }: Props) {
  const [selected, setSelected] = useState(faculties[0]?.id ?? null);
  const router = useRouter();
  const activeFaculty = faculties.find((f) => f.id === selected);

  if (faculties.length === 0) {
    return (
      <div className="text-center py-20 border border-neutral-800 rounded-2xl bg-neutral-900/50">
        <div className="text-4xl mb-4">⏳</div>
        <h3 className="text-lg font-semibold text-white mb-2">No playlists added yet</h3>
        <p className="text-neutral-500 text-sm">An admin will link YouTube playlists to this course soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest mb-4">
          Select Faculty
        </h2>
        <div className="flex gap-3 flex-wrap">
          {faculties.map((faculty) => (
            <button
              key={faculty.id}
              onClick={() => setSelected(faculty.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150"
              style={{
                background:  selected === faculty.id ? `${course.accentColor}33` : "#1a1a1a",
                borderColor: selected === faculty.id ? course.accentColor : "#2a2a2a",
                color:       selected === faculty.id ? "#fff" : "#888",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-none"
                style={{
                  background: selected === faculty.id ? course.accentColor : "#2a2a2a",
                  color:      selected === faculty.id ? "#000" : "#666",
                }}
              >
                {faculty.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{faculty.name}</div>
                <div className="text-xs text-neutral-500">
                  {faculty.videoCount} lectures
                  {faculty.section && ` · Section ${faculty.section}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeFaculty && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4"
                style={{ background: course.accentColor }}
              >
                {activeFaculty.name.charAt(0)}
              </div>
              <h3 className="text-white font-semibold mb-1">{activeFaculty.name}</h3>
              {activeFaculty.designation && (
                <p className="text-neutral-500 text-xs mb-3">{activeFaculty.designation}</p>
              )}
              {activeFaculty.bio && (
                <p className="text-neutral-400 text-xs leading-relaxed mb-4">{activeFaculty.bio}</p>
              )}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Total lectures</span>
                  <span className="text-white">{activeFaculty.videoCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Section</span>
                  <span className="text-white">{activeFaculty.section ?? "—"}</span>
                </div>
              </div>

              {/* Start Watching */}
              <button
                onClick={() => router.push(`/courses/${courseId}/watch/${activeFaculty.id}`)}
                className="w-full py-3 rounded-xl font-semibold text-sm text-black transition-colors"
                style={{ background: "#d4a017" }}
              >
                ▶ Start Watching
              </button>

              {/* Course Modules */}
              <button
                onClick={() => router.push(`/courses/${courseId}/learn`)}
                className="w-full mt-2 py-2.5 rounded-xl font-medium text-sm text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors"
              >
                📚 Course Modules
              </button>

              
               <a href={activeFaculty.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 py-2.5 rounded-xl font-medium text-xs text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 transition-colors flex items-center justify-center gap-2"
              >
                View on YouTube ↗
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-4">
                Course Materials
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { type: "slide",        label: "Slides",      icon: "📊" },
                  { type: "note",         label: "Notes",       icon: "📝" },
                  { type: "book",         label: "Books",       icon: "📚" },
                  { type: "lab",          label: "Lab Sheets",  icon: "🧪" },
                  { type: "quiz",         label: "Quizzes",     icon: "📋" },
                  { type: "prevquestion", label: "Past Papers", icon: "📄" },
                ].map((m) => (
                  <button
                    key={m.type}
                    onClick={() => router.push(`/courses/${courseId}/materials?type=${m.type}`)}
                    className="flex flex-col items-center gap-2 p-4 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-all text-center"
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-xs text-neutral-300 font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}