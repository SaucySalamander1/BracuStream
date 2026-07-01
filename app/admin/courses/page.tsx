import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";

async function getAllCourses() {
  const snap = await adminDb.collection("courses").orderBy("code").get();
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id:        doc.id,
      code:      data.code ?? "",
      title:     data.title ?? "",
      type:      data.type ?? "bracu",
      department:data.department ?? "",
      published: data.published ?? false,
      credits:   data.credits ?? 0,
      accentColor: data.accentColor ?? "#1a3d6b",
    };
  });
}

export default async function AdminCoursesPage() {
  const courses = await getAllCourses();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Courses</h1>
          <p className="text-neutral-500 text-sm">
            {courses.length} courses total
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black transition-colors"
          style={{ background: "#d4a017" }}
        >
          ➕ Add Course
        </Link>
      </div>

      {/* Course list */}
      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all"
          >
            {/* Color dot */}
            <div
              className="w-10 h-10 rounded-lg flex-none flex items-center justify-center text-xs font-bold text-white"
              style={{ background: course.accentColor }}
            >
              {course.code?.slice(0, 3) ?? "EXT"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white">
                  {course.title}
                </span>
                {course.type === "bracu" && (
                  <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {course.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                {course.department}
                {course.credits > 0 && ` · ${course.credits} credits`}
              </p>
            </div>

            {/* Published badge */}
            <div>
              <span
                className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  course.published
                    ? "bg-green-900/50 text-green-400 border border-green-800"
                    : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                }`}
              >
                {course.published ? "Published" : "Draft"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-none">
              <Link
                href={`/admin/courses/${course.id}`}
                className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
              >
                Manage →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}