"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Material {
  id: string;
  type: string;
  name: string;
  storageUrl: string;
  sizeKb: number;
  week?: number | null;
  description?: string;
  facultyId?: string | null;
  examYear?: string | null;
  examType?: string | null;
  labNo?: number | null;
  quizNo?: number | null;
}

interface Props {
  materials: Material[];
  activeType: string;
  courseId: string;
  accentColor: string;
}

const TABS = [
  { type: "slide",        label: "Slides",      icon: "📊" },
  { type: "note",         label: "Notes",       icon: "📝" },
  { type: "book",         label: "Books",       icon: "📚" },
  { type: "lab",          label: "Lab Sheets",  icon: "🧪" },
  { type: "quiz",         label: "Quizzes",     icon: "📋" },
  { type: "prevquestion", label: "Past Papers", icon: "📄" },
  { type: "resource",     label: "Resources",   icon: "🔗" },
];

function formatSize(kb: number): string {
  if (kb === 0) return "";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getMaterialLabel(m: Material): string {
  if (m.type === "prevquestion") {
    const parts = [];
    if (m.examYear) parts.push(m.examYear);
    if (m.examType) parts.push(m.examType.charAt(0).toUpperCase() + m.examType.slice(1));
    return parts.length > 0 ? parts.join(" — ") : m.name;
  }
  if (m.type === "lab" && m.labNo) return `Lab ${m.labNo}`;
  if (m.type === "quiz" && m.quizNo) return `Quiz ${m.quizNo}`;
  if (m.week) return `Week ${m.week}`;
  return "";
}

export default function MaterialsViewer({
  materials,
  activeType,
  courseId,
  accentColor,
}: Props) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(activeType);
  const [viewing, setViewing] = useState<Material | null>(null);

  const filtered = materials.filter((m) => m.type === selectedType);

  const handleTab = (type: string) => {
    setSelectedType(type);
    setViewing(null);
    router.replace(`/courses/${courseId}/materials?type=${type}`, {
      scroll: false,
    });
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {TABS.map((tab) => {
          const count = materials.filter((m) => m.type === tab.type).length;
          return (
            <button
              key={tab.type}
              onClick={() => handleTab(tab.type)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all"
              style={{
                background: selectedType === tab.type ? `${accentColor}22` : "#1a1a1a",
                borderColor: selectedType === tab.type ? accentColor : "#2a2a2a",
                color: selectedType === tab.type ? "#fff" : "#888",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: selectedType === tab.type ? accentColor : "#2a2a2a",
                    color: selectedType === tab.type ? "#000" : "#666",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-neutral-800 rounded-2xl bg-neutral-900/30">
          <div className="text-4xl mb-4">
            {TABS.find((t) => t.type === selectedType)?.icon}
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No {TABS.find((t) => t.type === selectedType)?.label} yet
          </h3>
          <p className="text-neutral-500 text-sm">
            Materials will be uploaded by the admin soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((material) => (
            <button
              key={material.id}
              onClick={() => setViewing(material)}
              className="flex items-start gap-4 p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl text-left transition-all group"
            >
              <div className="text-3xl flex-none">
                {TABS.find((t) => t.type === material.type)?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-1">
                  {material.name}
                </p>
                {getMaterialLabel(material) && (
                  <p className="text-xs text-neutral-500 mb-1">
                    {getMaterialLabel(material)}
                  </p>
                )}
                {material.description && (
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {material.description}
                  </p>
                )}
                {material.sizeKb > 0 && (
                  <p className="text-xs text-neutral-600 mt-1">
                    {formatSize(material.sizeKb)}
                  </p>
                )}
              </div>
              <div className="text-neutral-600 group-hover:text-neutral-400 transition-colors flex-none">
                👁
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Viewer modal */}
      {viewing && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewing(null);
          }}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950 flex-none">
            <div>
              <p className="text-sm font-medium text-white">{viewing.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                View only — downloading is disabled
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-neutral-800 text-neutral-400 text-xs px-3 py-1.5 rounded-lg">
                🔒 No download
              </div>
              <button
                onClick={() => setViewing(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* PDF viewer or placeholder */}
          <div className="flex-1 overflow-hidden">
            {viewing.storageUrl ? (
              <iframe
                src={`${viewing.storageUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full border-0"
                title={viewing.name}
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="text-6xl">
                  {TABS.find((t) => t.type === viewing.type)?.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {viewing.name}
                </h3>
                <p className="text-neutral-500 text-sm text-center max-w-sm">
                  This material hasn't been uploaded yet. Check back soon or ask your faculty.
                </p>
                <div className="bg-neutral-800 text-neutral-400 text-xs px-4 py-2 rounded-lg">
                  🔒 View only — no download available
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}