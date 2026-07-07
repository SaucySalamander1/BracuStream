import { adminDb } from "@/lib/firebase-admin";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getAdminStats() {
  const [coursesSnap, usersSnap] = await Promise.all([
    adminDb.collection("courses").get(),
    adminDb.collection("users").get(),
  ]);

  const users    = usersSnap.docs.map((d) => d.data());
  const students = users.filter((u) => u.role === "student");
  const admins   = users.filter((u) => u.role === "admin");

  // Total videos watched across all students
  let totalVideosWatched = 0;
  let totalResearchChats = 0;
  const courseWatchCount: Record<string, number> = {};

  for (const user of students) {
    const progress = user.progress ?? {};
    const keys     = Object.keys(progress).filter((k) => progress[k]);
    totalVideosWatched += keys.length;

    for (const key of keys) {
      const [courseId] = key.split("__");
      courseWatchCount[courseId] = (courseWatchCount[courseId] ?? 0) + 1;
    }
  }

  // Get research chat counts
  for (const doc of usersSnap.docs) {
    const convsSnap = await adminDb
      .collection("users").doc(doc.id)
      .collection("conversations")
      .count()
      .get();
    totalResearchChats += convsSnap.data().count;
  }

  // Top courses by watch count
  const courses      = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  const topCourses   = courses
    .map((c) => ({
      id:          c.id,
      title:       c.title,
      code:        c.code,
      accentColor: c.accentColor,
      watchCount:  courseWatchCount[c.id] ?? 0,
    }))
    .sort((a, b) => b.watchCount - a.watchCount)
    .slice(0, 5);

  // Recent students
  const recentStudents = students
    .sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() ?? 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 5)
    .map((s) => ({
      name:      s.name,
      email:     s.email,
      createdAt: s.createdAt?.toDate?.(),
    }));

  return {
    totalStudents:     students.length,
    totalAdmins:       admins.length,
    totalCourses:      coursesSnap.size,
    totalVideosWatched,
    totalResearchChats,
    topCourses,
    recentStudents,
  };
}

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/dashboard");

  const stats = await getAdminStats();

  const STATS = [
    { label: "Total Students",   value: stats.totalStudents,     icon: "👥", color: "#3b82f6" },
    { label: "Total Courses",    value: stats.totalCourses,      icon: "📚", color: "#d4a017" },
    { label: "Videos Watched",   value: stats.totalVideosWatched,icon: "▶",  color: "#10b981" },
    { label: "Research Sessions",value: stats.totalResearchChats,icon: "🔬", color: "#8b5cf6" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-neutral-500 text-sm">Platform usage overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
              style={{ background: `${stat.color}22`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs text-neutral-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top courses */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            🔥 Most Watched Courses
          </h2>
          {stats.topCourses.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-8">No watch data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topCourses.map((course, i) => (
                <div key={course.id} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-600 font-mono w-4">{i + 1}</span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-none"
                    style={{ background: `${course.accentColor}33`, color: course.accentColor }}
                  >
                    {course.code?.slice(0, 3) ?? "📚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{course.title}</p>
                    <p className="text-xs text-neutral-500">{course.watchCount} videos watched</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent students */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            👥 Recent Students
          </h2>
          {stats.recentStudents.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-8">No students yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentStudents.map((student, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white flex-none">
                    {student.name?.[0]?.toUpperCase() ?? "S"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{student.name}</p>
                    <p className="text-xs text-neutral-500 truncate font-mono">{student.email}</p>
                  </div>
                  <span className="text-xs text-neutral-600 flex-none">
                    {student.createdAt
                      ? new Date(student.createdAt).toLocaleDateString("en-BD", {
                          month: "short", day: "numeric",
                        })
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}