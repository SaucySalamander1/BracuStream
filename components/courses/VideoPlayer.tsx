"use client";
import { useState, useEffect, useRef } from "react";
import { Course } from "@/types";
import { useRouter } from "next/navigation";

interface Video {
  id: string;
  youtubeId: string;
  title: string;
  duration: string;
  order: number;
  week: number;
  topic: string;
}

interface Faculty {
  id: string;
  name: string;
  section?: string;
  playlistUrl: string;
  videoCount: number;
}

interface Props {
  course: Course;
  faculty: Faculty;
  videos: Video[];
  startIndex: number;
  userId: string;
}

export default function VideoPlayer({
  course,
  faculty,
  videos,
  startIndex,
  userId,
}: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const playerRef = useRef<HTMLIFrameElement>(null);

  const currentVideo = videos[currentIndex];

  // Save progress to Firestore via API
  const markWatched = async (videoId: string) => {
    if (watched.has(videoId)) return;
    setWatched((prev) => new Set([...prev, videoId]));
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          facultyId: faculty.id,
          videoId,
        }),
      });
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  const goToVideo = (index: number) => {
    if (index < 0 || index >= videos.length) return;
    setCurrentIndex(index);
    markWatched(videos[index].id);
    router.replace(
      `/courses/${course.id}/watch/${faculty.id}?v=${videos[index].youtubeId}`,
      { scroll: false }
    );
  };

  // Mark first video as watched on load
  useEffect(() => {
    if (currentVideo) markWatched(currentVideo.id);
  }, []);

  const completedCount = watched.size;
  const progressPct = Math.round((completedCount / videos.length) * 100);

  return (
    <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 53px)" }}>

      {/* ── Main player area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* YouTube embed */}
        <div className="relative bg-black" style={{ paddingBottom: "56.25%" }}>
          <iframe
            ref={playerRef}
            key={currentVideo.youtubeId}
            src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
          {/* View only badge */}
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1 pointer-events-none z-10">
            🔒 View only
          </div>
        </div>

        {/* Video info */}
        <div className="flex-1 overflow-y-auto bg-neutral-950 p-4">
          {/* Back + toggle sidebar */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push(`/courses/${course.id}`)}
              className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
            >
              ← Back to course
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              {sidebarOpen ? "Hide playlist" : "Show playlist"}
            </button>
          </div>

          {/* Course + faculty badge */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded font-mono"
              style={{ background: course.accentColor, color: "#fff" }}
            >
              {course.code ?? course.title}
            </span>
            <span className="text-xs text-neutral-500">{faculty.name}</span>
            {faculty.section && (
              <span className="text-xs text-neutral-600">Section {faculty.section}</span>
            )}
          </div>

          {/* Video title */}
          <h1 className="text-base font-semibold text-white mb-1 leading-snug">
            {currentVideo.title}
          </h1>
          <p className="text-xs text-neutral-500 mb-4">
            Lecture {currentVideo.order} of {videos.length}
            {currentVideo.week && ` · Week ${currentVideo.week}`}
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>{completedCount} of {videos.length} watched</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: "#d4a017" }}
              />
            </div>
          </div>

          {/* Prev / Next buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => goToVideo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="flex-1 py-2 rounded-lg text-sm font-medium border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => goToVideo(currentIndex + 1)}
              disabled={currentIndex === videos.length - 1}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors text-black font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "#d4a017" }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ── Playlist sidebar ── */}
      {sidebarOpen && (
        <div
          className="flex-none flex flex-col border-l border-neutral-800 bg-neutral-900"
          style={{ width: 280 }}
        >
          {/* Sidebar header */}
          <div className="px-4 py-3 border-b border-neutral-800 flex-none">
            <div className="text-xs font-semibold text-neutral-300 mb-0.5">
              {faculty.name}'s Playlist
            </div>
            <div className="text-xs text-neutral-500">
              {videos.length} lectures
            </div>
          </div>

          {/* Video list */}
          <div className="flex-1 overflow-y-auto">
            {videos.map((video, index) => {
              const isActive  = index === currentIndex;
              const isWatched = watched.has(video.id);

              return (
                <button
                  key={video.id}
                  onClick={() => goToVideo(index)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left border-b border-neutral-800/50 transition-colors hover:bg-neutral-800/50"
                  style={{
                    background: isActive ? `${course.accentColor}22` : "transparent",
                    borderLeft: isActive ? `3px solid ${course.accentColor}` : "3px solid transparent",
                  }}
                >
                  {/* Number / watched indicator */}
                  <div className="flex-none w-6 h-6 rounded-full flex items-center justify-center text-xs mt-0.5"
                    style={{
                      background: isActive ? course.accentColor : isWatched ? "#22c55e22" : "#2a2a2a",
                      color: isActive ? "#000" : isWatched ? "#22c55e" : "#666",
                    }}
                  >
                    {isWatched && !isActive ? "✓" : video.order}
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug line-clamp-2 ${isActive ? "text-white font-medium" : "text-neutral-400"}`}>
                      {video.title}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">
                      {video.duration !== "0:00" ? video.duration : ""}
                      {video.week ? ` · Week ${video.week}` : ""}
                    </p>
                  </div>

                  {/* Playing indicator */}
                  {isActive && (
                    <div className="flex-none text-xs mt-1" style={{ color: course.accentColor }}>
                      ▶
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}