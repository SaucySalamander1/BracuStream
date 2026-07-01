"use client";
import { useState } from "react";
import { Course } from "@/types";
import { useRouter } from "next/navigation";

interface ModuleItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  youtubeId?: string | null;
  facultyId?: string | null;
  duration?: string | null;
  storageUrl?: string | null;
  sizeKb?: number | null;
  externalUrl?: string | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  week: number;
  description: string;
}

interface Props {
  course: Course;
  module: Module;
  items: ModuleItem[];
  userId: string;
  courseId: string;
  moduleId: string;
}

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  video:      { icon: "▶",  label: "Video",      color: "#3b82f6" },
  slide:      { icon: "📊", label: "Slide",      color: "#8b5cf6" },
  note:       { icon: "📝", label: "Note",       color: "#10b981" },
  assignment: { icon: "📋", label: "Assignment", color: "#f59e0b" },
  lab:        { icon: "🧪", label: "Lab",        color: "#06b6d4" },
  quiz:       { icon: "❓", label: "Quiz",       color: "#ef4444" },
  resource:   { icon: "🔗", label: "Resource",   color: "#6b7280" },
};

function formatSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function ModuleLearner({
  course, module, items, userId, courseId, moduleId,
}: Props) {
  const router = useRouter();
  const [viewingItem, setViewingItem] = useState<ModuleItem | null>(null);
  const [activeVideo, setActiveVideo] = useState<ModuleItem | null>(
    items.find((i) => i.type === "video") ?? null
  );

  // Group items by type
  const videos      = items.filter((i) => i.type === "video");
  const slides      = items.filter((i) => i.type === "slide");
  const notes       = items.filter((i) => i.type === "note");
  const assignments = items.filter((i) => i.type === "assignment");
  const labs        = items.filter((i) => i.type === "lab");
  const quizzes     = items.filter((i) => i.type === "quiz");
  const resources   = items.filter((i) => i.type === "resource");

  const handleViewFile = async (item: ModuleItem) => {
    if (!item.storageUrl) return;
    setViewingItem(item);
  };

  const sections = [
    { key: "slide",      items: slides,      label: "Lecture Slides",   icon: "📊" },
    { key: "note",       items: notes,        label: "Notes",            icon: "📝" },
    { key: "assignment", items: assignments,  label: "Assignments",      icon: "📋" },
    { key: "lab",        items: labs,         label: "Lab Sheets",       icon: "🧪" },
    { key: "quiz",       items: quizzes,      label: "Quizzes",          icon: "❓" },
    { key: "resource",   items: resources,    label: "Resources",        icon: "🔗" },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">

      {/* Module header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-mono px-2 py-1 rounded"
            style={{ background: `${course.accentColor}22`, color: course.accentColor }}
          >
            Week {module.week}
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded font-mono"
            style={{ background: course.accentColor, color: "#fff" }}
          >
            {course.code ?? course.title}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{module.title}</h1>
        {module.description && (
          <p className="text-neutral-400 text-sm leading-relaxed">{module.description}</p>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-20 border border-neutral-800 border-dashed rounded-2xl">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-neutral-400 text-sm font-medium mb-1">No content yet</p>
          <p className="text-neutral-600 text-xs">Check back soon — materials will be added here.</p>
        </div>
      )}

      {/* Videos section */}
      {videos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-4">
            ▶ Lecture Videos ({videos.length})
          </h2>

          {/* Active video player */}
          {activeVideo && (
            <div className="mb-4 rounded-xl overflow-hidden bg-black">
              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  key={activeVideo.youtubeId!}
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
                  🔒 View only
                </div>
              </div>
              <div className="p-4 bg-neutral-900">
                <p className="text-sm font-medium text-white mb-1">{activeVideo.title}</p>
                {activeVideo.duration && (
                  <p className="text-xs text-neutral-500">{activeVideo.duration}</p>
                )}
              </div>
            </div>
          )}

          {/* Video list */}
          {videos.length > 1 && (
            <div className="space-y-2">
              {videos.map((video, idx) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                  style={{
                    background:  activeVideo?.id === video.id ? `${course.accentColor}22` : "#1a1a1a",
                    borderColor: activeVideo?.id === video.id ? course.accentColor : "#2a2a2a",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-none"
                    style={{
                      background: activeVideo?.id === video.id ? course.accentColor : "#2a2a2a",
                      color:      activeVideo?.id === video.id ? "#000" : "#666",
                    }}
                  >
                    {activeVideo?.id === video.id ? "▶" : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${
                      activeVideo?.id === video.id ? "text-white" : "text-neutral-400"
                    }`}>
                      {video.title}
                    </p>
                    {video.duration && (
                      <p className="text-xs text-neutral-600 mt-0.5">{video.duration}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other content sections */}
      {sections.map((section) => (
        <div key={section.key} className="mb-8">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-4">
            {section.icon} {section.label} ({section.items.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.storageUrl) handleViewFile(item);
                  else if (item.externalUrl) window.open(item.externalUrl, "_blank");
                }}
                className="flex items-start gap-4 p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl text-left transition-all group"
              >
                <div className="text-2xl flex-none">{section.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-1">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-neutral-500 line-clamp-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {item.sizeKb && (
                      <span className="text-xs text-neutral-600">{formatSize(item.sizeKb)}</span>
                    )}
                    {item.storageUrl && (
                      <span className="text-xs text-green-400">👁 View</span>
                    )}
                    {item.externalUrl && (
                      <span className="text-xs text-amber-400">↗ Open</span>
                    )}
                    {!item.storageUrl && !item.externalUrl && (
                      <span className="text-xs text-neutral-600">Coming soon</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* File viewer modal */}
      {viewingItem && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingItem(null);
          }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950 flex-none">
            <div>
              <p className="text-sm font-medium text-white">{viewingItem.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                🔒 View only — downloading is disabled
              </p>
            </div>
            <button
              onClick={() => setViewingItem(null)}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={`${viewingItem.storageUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0"
              title={viewingItem.title}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      )}
    </div>
  );
}