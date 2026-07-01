"use client";
import { useState } from "react";
import AddModuleItemForm from "./AddModuleItemForm";
import FileUpload from "./FileUpload";

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

interface Faculty {
  id: string;
  name: string;
  section?: string;
  videoCount: number;
}

interface Module {
  id: string;
  title: string;
  week: number;
  published: boolean;
}

interface Props {
  courseId: string;
  moduleId: string;
  module: Module;
  items: ModuleItem[];
  faculties: Faculty[];
  accentColor: string;
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

const TABS = ["Module Content", "Upload File", "Settings"];

export default function ModuleManager({
  courseId, moduleId, module, items: initialItems, faculties, accentColor,
}: Props) {
  const [tab, setTab]                 = useState(0);
  const [items, setItems]             = useState(initialItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [publishing, setPublishing]   = useState(false);
  const [isPublished, setIsPublished] = useState(module.published);

  const handleItemAdded = (item: ModuleItem) => {
    setItems((prev) => [...prev, item]);
    setShowAddForm(false);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Remove this item from the module?")) return;
    setDeletingId(itemId);
    try {
      await fetch(
        `/api/admin/courses/${courseId}/modules/${moduleId}/items/${itemId}`,
        { method: "DELETE" }
      );
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      alert("Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublish = async () => {
    setPublishing(true);
    try {
      await fetch(`/api/admin/courses/${courseId}/modules/${moduleId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ published: !isPublished }),
      });
      setIsPublished(!isPublished);
    } catch (e) {
      alert("Failed to update publish status");
    } finally {
      setPublishing(false);
    }
  };

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, ModuleItem[]>);

  return (
    <div className="space-y-6">

      {/* Publish toggle */}
      <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
        <div>
          <p className="text-sm font-medium text-white mb-0.5">Module visibility</p>
          <p className="text-xs text-neutral-500">
            {isPublished
              ? "Students can see this module and all its content"
              : "This module is hidden from students"}
          </p>
        </div>
        <button
          onClick={togglePublish}
          disabled={publishing}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            background: isPublished ? "#22c55e22" : "#d4a01722",
            color:      isPublished ? "#22c55e"   : "#d4a017",
            border:     `1px solid ${isPublished ? "#22c55e44" : "#d4a01744"}`,
          }}
        >
          {publishing ? "Updating..." : isPublished ? "✓ Published" : "Publish"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-800">
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

      {/* Tab 0 — Module Content */}
      {tab === 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest">
              Module Content ({items.length} items)
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black transition-colors"
              style={{ background: "#d4a017" }}
            >
              {showAddForm ? "✕ Cancel" : "+ Add Item"}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6">
              <AddModuleItemForm
                courseId={courseId}
                moduleId={moduleId}
                faculties={faculties}
                onAdded={handleItemAdded}
              />
            </div>
          )}

          {items.length === 0 && !showAddForm && (
            <div className="text-center py-16 border border-neutral-800 border-dashed rounded-xl">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-neutral-400 text-sm font-medium mb-1">No content yet</p>
              <p className="text-neutral-600 text-xs">Add videos, slides, notes, assignments and more</p>
            </div>
          )}

          {Object.entries(grouped).map(([type, typeItems]) => {
            const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.resource;
            return (
              <div key={type} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{config.icon}</span>
                  <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
                    {config.label}s ({typeItems.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {typeItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-none"
                        style={{ background: `${config.color}22`, color: config.color }}
                      >
                        {item.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white mb-0.5 truncate">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-neutral-500 truncate">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {item.youtubeId && (
                            <span className="text-xs text-blue-400 font-mono">
                              yt:{item.youtubeId.slice(0, 8)}...
                            </span>
                          )}
                          {item.duration && (
                            <span className="text-xs text-neutral-600">{item.duration}</span>
                          )}
                          {item.storageUrl && (
                            <span className="text-xs text-green-400">☁ Uploaded</span>
                          )}
                          {item.sizeKb && (
                            <span className="text-xs text-neutral-600">
                              {item.sizeKb < 1024
                                ? `${item.sizeKb} KB`
                                : `${(item.sizeKb / 1024).toFixed(1)} MB`}
                            </span>
                          )}
                          {item.externalUrl && (
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-amber-400 hover:text-amber-300"
                            >
                              Open link ↗
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="text-xs px-3 py-1.5 bg-red-950/50 text-red-400 hover:bg-red-950 border border-red-900 rounded-lg transition-colors disabled:opacity-50 flex-none"
                      >
                        {deletingId === item.id ? "..." : "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 1 — Upload File */}
      {tab === 1 && (
        <FileUpload
          courseId={courseId}
          moduleId={moduleId}
          onUploaded={(item) => {
            setItems((prev) => [...prev, item]);
            setTab(0);
          }}
        />
      )}

      {/* Tab 2 — Settings */}
      {tab === 2 && (
        <div className="text-center py-20 border border-neutral-800 rounded-2xl bg-neutral-900/30">
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-lg font-semibold text-white mb-2">Module Settings</h3>
          <p className="text-neutral-500 text-sm">Edit module details — coming soon.</p>
        </div>
      )}
    </div>
  );
}