"use client";
import { useState } from "react";
import AddFacultyForm from "./AddFacultyForm";
import Link from "next/link";

interface Faculty {
  id: string;
  name: string;
  section?: string;
  designation?: string;
  playlistUrl: string;
  videoCount: number;
}

interface Module {
  id: string;
  title: string;
  week: number;
  published: boolean;
  order: number;
}

interface Course {
  id: string;
  code: string;
  title: string;
  type: string;
  accentColor: string;
  published: boolean;
}

interface Props {
  course: Course;
  faculties: Faculty[];
  modules: Module[];
}

const TABS = ["Modules", "Faculties & Playlists", "Settings"];

export default function AdminCourseManager({ course, faculties: initialFaculties, modules: initialModules }: Props) {
  const [tab, setTab]             = useState(0);
  const [faculties, setFaculties] = useState(initialFaculties);
  const [modules, setModules]     = useState(initialModules);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFacultyAdded = (newFaculty: Faculty) => {
    setFaculties((prev) => [...prev, newFaculty]);
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    if (!confirm("Delete this faculty and all their videos?")) return;
    setDeletingId(facultyId);
    try {
      await fetch(`/api/admin/courses/${course.id}/faculties/${facultyId}`, {
        method: "DELETE",
      });
      setFaculties((prev) => prev.filter((f) => f.id !== facultyId));
    } catch (e) {
      alert("Failed to delete faculty");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Delete this module and all its content?")) return;
    setDeletingId(moduleId);
    try {
      await fetch(`/api/admin/courses/${course.id}/modules/${moduleId}`, {
        method: "DELETE",
      });
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
    } catch (e) {
      alert("Failed to delete module");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-neutral-800">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
            style={{
              borderColor: tab === i ? "#d4a017" : "transparent",
              color:       tab === i ? "#d4a017" : "#888",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0 — Modules */}
      {tab === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-neutral-500">
              {modules.length} module{modules.length !== 1 ? "s" : ""}
            </p>
            <Link
              href={`/admin/courses/${course.id}/modules/new`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black"
              style={{ background: "#d4a017" }}
            >
              + Add Module
            </Link>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-16 border border-neutral-800 border-dashed rounded-xl">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-neutral-400 text-sm font-medium mb-1">No modules yet</p>
              <p className="text-neutral-600 text-xs mb-4">
                Create week-by-week modules with videos, slides, assignments and more
              </p>
              <Link
                href={`/admin/courses/${course.id}/modules/new`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black"
                style={{ background: "#d4a017" }}
              >
                + Create First Module
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all"
                >
                  {/* Week badge */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-none"
                    style={{ background: `${course.accentColor}33`, color: course.accentColor }}
                  >
                    W{module.week}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white mb-0.5">
                      {module.title}
                    </p>
                    <p className="text-xs text-neutral-500">Week {module.week}</p>
                  </div>

                  {/* Published badge */}
                  <span className={`text-xs px-2 py-1 rounded font-medium flex-none ${
                    module.published
                      ? "bg-green-900/50 text-green-400"
                      : "bg-neutral-800 text-neutral-500"
                  }`}>
                    {module.published ? "Published" : "Draft"}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2 flex-none">
                    <Link
                      href={`/admin/courses/${course.id}/modules/${module.id}`}
                      className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
                    >
                      Manage →
                    </Link>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      disabled={deletingId === module.id}
                      className="text-xs px-3 py-1.5 bg-red-950/50 text-red-400 hover:bg-red-950 border border-red-900 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === module.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 1 — Faculties */}
      {tab === 1 && (
        <div className="space-y-6">
          {faculties.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest mb-4">
                Faculties ({faculties.length})
              </h2>
              <div className="space-y-3">
                {faculties.map((faculty) => (
                  <div
                    key={faculty.id}
                    className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-none"
                      style={{ background: course.accentColor, color: "#000" }}
                    >
                      {faculty.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white mb-0.5">{faculty.name}</p>
                      <p className="text-xs text-neutral-500">
                        {faculty.videoCount} videos
                        {faculty.section && ` · Section ${faculty.section}`}
                      </p>
                      <a
                        href={faculty.playlistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-400 hover:text-amber-300 truncate block max-w-xs mt-1"
                      >
                        {faculty.playlistUrl}
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeleteFaculty(faculty.id)}
                      disabled={deletingId === faculty.id}
                      className="text-xs px-3 py-1.5 bg-red-950/50 text-red-400 hover:bg-red-950 border border-red-900 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === faculty.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest mb-4">
              Add Faculty & Playlist
            </h2>
            <AddFacultyForm courseId={course.id} onAdded={handleFacultyAdded} />
          </div>
        </div>
      )}

      {/* Tab 2 — Settings */}
      {tab === 2 && (
        <div className="text-center py-20 border border-neutral-800 rounded-2xl bg-neutral-900/30">
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-lg font-semibold text-white mb-2">Course Settings</h3>
          <p className="text-neutral-500 text-sm">Edit course details — coming soon.</p>
        </div>
      )}
    </div>
  );
}