"use client";
import { useState, useRef } from "react";

interface Props {
  courseId: string;
  moduleId: string;
  onUploaded: (item: any) => void;
}

const ACCEPTED_TYPES = [
  { type: "slide",      icon: "📊", label: "Slide",      ext: ".pdf,.pptx,.ppt" },
  { type: "note",       icon: "📝", label: "Note",       ext: ".pdf,.docx,.doc" },
  { type: "assignment", icon: "📋", label: "Assignment", ext: ".pdf,.docx,.doc" },
  { type: "lab",        icon: "🧪", label: "Lab Sheet",  ext: ".pdf,.docx,.doc" },
  { type: "quiz",       icon: "❓", label: "Quiz",       ext: ".pdf,.docx,.doc" },
  { type: "resource",   icon: "🔗", label: "Resource",   ext: ".pdf,.pptx,.docx,.png,.jpg" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function FileUpload({ courseId, moduleId, onUploaded }: Props) {
  const [selectedType, setSelectedType] = useState("slide");
  const [title, setTitle]               = useState("");
  const [file, setFile]                 = useState<File | null>(null);
  const [dragging, setDragging]         = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setError("");
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    if (!file)  { setError("Please select a file"); return; }
    if (!title) { setError("Please enter a title"); return; }

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file",     file);
      formData.append("courseId", courseId);
      formData.append("moduleId", moduleId);
      formData.append("type",     selectedType);
      formData.append("title",    title);

      setProgress(40);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body:   formData,
      });

      setProgress(90);

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed"); return; }

      setProgress(100);
      setSuccess(`✅ "${title}" uploaded successfully!`);
      onUploaded(data);

      // Reset form
      setFile(null);
      setTitle("");
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      setError("Upload failed — please try again");
    } finally {
      setUploading(false);
    }
  };

  const currentType = ACCEPTED_TYPES.find((t) => t.type === selectedType)!;

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 space-y-5">
      <h3 className="text-sm font-semibold text-white">Upload File</h3>

      {/* Type selector */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-3">
          File Type
        </label>
        <div className="flex gap-2 flex-wrap">
          {ACCEPTED_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => setSelectedType(t.type)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all"
              style={{
                background:  selectedType === t.type ? "#d4a01722" : "#1a1a1a",
                borderColor: selectedType === t.type ? "#d4a017"   : "#2a2a2a",
                color:       selectedType === t.type ? "#d4a017"   : "#888",
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          Title *
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Week 1 Lecture Slides"
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Drop zone */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest block mb-2">
          File *
        </label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
          style={{
            borderColor: dragging ? "#d4a017" : file ? "#22c55e" : "#2a2a2a",
            background:  dragging ? "#d4a01711" : file ? "#22c55e11" : "transparent",
          }}
        >
          {file ? (
            <div>
              <div className="text-3xl mb-2">{currentType.icon}</div>
              <p className="text-sm font-medium text-white mb-1">{file.name}</p>
              <p className="text-xs text-neutral-500">{formatSize(file.size)}</p>
              <p className="text-xs text-green-400 mt-2">✓ Ready to upload</p>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2">☁️</div>
              <p className="text-sm font-medium text-neutral-300 mb-1">
                Drop file here or click to browse
              </p>
              <p className="text-xs text-neutral-600">
                PDF, PPTX, DOCX, images — max 50MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={currentType.ext}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>

      {/* Progress bar */}
      {uploading && (
        <div>
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: "#d4a017" }}
            />
          </div>
        </div>
      )}

      {/* Error / Success */}
      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-950 border border-green-800 rounded-xl px-4 py-3">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="w-full py-3 rounded-xl font-semibold text-sm text-black transition-colors disabled:opacity-50"
        style={{ background: "#d4a017" }}
      >
        {uploading ? `Uploading... ${progress}%` : `Upload ${currentType.label}`}
      </button>
    </div>
  );
}