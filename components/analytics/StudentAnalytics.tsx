"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CourseProgress {
  courseId:      string;
  videosWatched: number;
  title:         string;
  code:          string;
  accentColor:   string;
}

interface Conversation {
  id:        string;
  title:     string;
  updatedAt: Date;
}

interface Analytics {
  totalVideosWatched:  number;
  totalCoursesTouched: number;
  totalResearchChats:  number;
  coursesInProgress:   CourseProgress[];
  recentConversations: Conversation[];
  joinedAt:            Date;
}

interface Props {
  userId:   string;
  userName: string;
}

export default function StudentAnalytics({ userId, userName }: Props) {
  const router                    = useRouter();
  const [data, setData]           = useState<Analytics | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-neutral-900 border border-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-neutral-900 border border-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const STATS = [
    {
      label:  "Videos Watched",
      value:  data.totalVideosWatched,
      icon:   "▶",
      color:  "#3b82f6",
      desc:   "Total lectures completed",
    },
    {
      label:  "Courses Explored",
      value:  data.totalCoursesTouched,
      icon:   "📚",
      color:  "#d4a017",
      desc:   "Courses you've started",
    },
    {
      label:  "AI Conversations",
      value:  data.totalResearchChats,
      icon:   "🔬",
      color:  "#8b5cf6",
      desc:   "Research hub sessions",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-2">
          Your Learning Dashboard
        </p>
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome back, {userName.split(" ")[0]} 👋
        </h1>
        <p className="text-neutral-500 text-sm">
          Here's your learning progress on BRACUStream
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: `${stat.color}22`, color: stat.color }}
              >
                {stat.icon}
              </div>
            </div>
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="text-sm font-medium text-white mb-0.5">{stat.label}</div>
            <div className="text-xs text-neutral-500">{stat.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Courses in progress */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span>📚</span> Courses In Progress
          </h2>
          {data.coursesInProgress.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🎓</div>
              <p className="text-neutral-500 text-sm">No courses started yet</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Browse courses →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.coursesInProgress.map((course) => (
                <div
                  key={course.courseId}
                  onClick={() => router.push(`/courses/${course.courseId}`)}
                  className="flex items-center gap-3 p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl cursor-pointer transition-all group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-none"
                    style={{ background: `${course.accentColor}33`, color: course.accentColor }}
                  >
                    {course.code?.slice(0, 3) ?? "📚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                      {course.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {course.videosWatched} lecture{course.videosWatched !== 1 ? "s" : ""} watched
                    </p>
                  </div>
                  <span className="text-neutral-600 text-xs">→</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent research */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span>🔬</span> Recent Research Sessions
          </h2>
          {data.recentConversations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">✦</div>
              <p className="text-neutral-500 text-sm">No research sessions yet</p>
              <button
                onClick={() => router.push("/research")}
                className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Start researching →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => router.push("/research")}
                  className="flex items-center gap-3 p-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-950/50 border border-purple-900/30 flex items-center justify-center text-purple-400 flex-none text-sm">
                    ✦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                      {conv.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {conv.updatedAt
                        ? new Date(conv.updatedAt).toLocaleDateString("en-BD", {
                            month: "short", day: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                  <span className="text-neutral-600 text-xs">→</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "📚", label: "Browse Courses",    href: "/dashboard" },
              { icon: "🔬", label: "Research Hub",      href: "/research" },
              { icon: "📊", label: "My Materials",      href: "/dashboard" },
              { icon: "👤", label: "My Profile",        href: "/dashboard" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center gap-2 p-4 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-all group"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs text-neutral-400 group-hover:text-white transition-colors font-medium text-center">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}