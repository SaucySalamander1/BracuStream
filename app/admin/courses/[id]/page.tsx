import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { getFaculties, getModules } from "@/lib/courses";
import AdminCourseManager from "@/components/admin/AdminCourseManager";

interface Props {
  params: Promise<{ id: string }>;
}

async function getCourse(id: string) {
  const doc = await adminDb.collection("courses").doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id:          doc.id,
    code:        data.code ?? "",
    title:       data.title ?? "",
    type:        data.type ?? "bracu",
    department:  data.department ?? "",
    description: data.description ?? "",
    accentColor: data.accentColor ?? "#1a3d6b",
    published:   data.published ?? false,
    credits:     data.credits ?? 0,
    semester:    data.semester ?? "",
    labCourse:   data.labCourse ?? false,
    prerequisites: data.prerequisites ?? [],
    tags:        data.tags ?? [],
    category:    data.category ?? "",
    provider:    data.provider ?? "",
    level:       data.level ?? "",
  };
}

export default async function AdminCourseDetailPage({ params }: Props) {
  const { id } = await params;
  const [course, faculties, modules] = await Promise.all([
    getCourse(id),
    getFaculties(id),
    getModules(id),
  ]);

  if (!course) notFound();

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {course.type === "bracu" ? (
            <span className="text-xs bg-amber-500 text-black font-bold px-2 py-1 rounded font-mono">
              {course.code}
            </span>
          ) : (
            <span className="text-xs bg-blue-600 text-white font-bold px-2 py-1 rounded">
              External
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            course.published
              ? "bg-green-900/50 text-green-400"
              : "bg-neutral-800 text-neutral-500"
          }`}>
            {course.published ? "Published" : "Draft"}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">{course.title}</h1>
        <p className="text-neutral-500 text-sm mt-1">{course.description}</p>
      </div>

      <AdminCourseManager
        course={course}
        faculties={faculties}
        modules={modules}
      />
    </div>
  );
}