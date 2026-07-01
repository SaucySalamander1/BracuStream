import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";

async function getStats() {
  const [coursesSnap, usersSnap] = await Promise.all([
    adminDb.collection("courses").get(),
    adminDb.collection("users").get(),
  ]);

  const totalCourses  = coursesSnap.size;
  const totalStudents = usersSnap.docs.filter(
    (d) => d.data().role === "student"
  ).length;
  const published = coursesSnap.docs.filter(
    (d) => d.data().published
  ).length;

  return { totalCourses, totalStudents, published };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-neutral-500 text-sm">
          Manage courses, playlists and materials
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Courses",    value: stats.totalCourses,  icon: "📚" },
          { label: "Published",        value: stats.published,     icon: "✅" },
          { label: "Students",         value: stats.totalStudents, icon: "👥" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5"
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-sm text-neutral-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-widest mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              href:  "/admin/courses/new",
              icon:  "➕",
              title: "Add New Course",
              desc:  "Create a BRACU or external course",
            },
            {
              href:  "/admin/courses",
              icon:  "📚",
              title: "Manage Courses",
              desc:  "Edit courses, add playlists and faculties",
            },
            {
              href:  "/admin/students",
              icon:  "👥",
              title: "View Students",
              desc:  "See all registered students",
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-start gap-4 p-5 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-2xl transition-all group"
            >
              <span className="text-2xl">{action.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors mb-1">
                  {action.title}
                </p>
                <p className="text-xs text-neutral-500">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}