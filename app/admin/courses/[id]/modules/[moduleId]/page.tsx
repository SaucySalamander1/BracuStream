import { adminDb } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { getCourseById, getFaculties } from "@/lib/courses";
import ModuleManager from "@/components/admin/ModuleManager";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string; moduleId: string }>;
}

async function getModule(courseId: string, moduleId: string) {
  const doc = await adminDb
    .collection("courses").doc(courseId)
    .collection("modules").doc(moduleId)
    .get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id:          doc.id,
    title:       data.title ?? "",
    week:        data.week ?? 0,
    description: data.description ?? "",
    published:   data.published ?? false,
    order:       data.order ?? 0,
  };
}

async function getModuleItems(courseId: string, moduleId: string) {
  const snap = await adminDb
    .collection("courses").doc(courseId)
    .collection("modules").doc(moduleId)
    .collection("items")
    .orderBy("order")
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id:          doc.id,
      type:        data.type ?? "resource",
      title:       data.title ?? "",
      description: data.description ?? "",
      youtubeId:   data.youtubeId ?? null,
      facultyId:   data.facultyId ?? null,
      duration:    data.duration ?? null,
      storageUrl:  data.storageUrl ?? null,
      sizeKb:      data.sizeKb ?? null,
      externalUrl: data.externalUrl ?? null,
      order:       data.order ?? 0,
    };
  });
}

export default async function ModuleDetailPage({ params }: Props) {
  const { id: courseId, moduleId } = await params;

  const [course, module, items, faculties] = await Promise.all([
    getCourseById(courseId),
    getModule(courseId, moduleId),
    getModuleItems(courseId, moduleId),
    getFaculties(courseId),
  ]);

  if (!course || !module) notFound();

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
        <Link href="/admin/courses" className="hover:text-white transition-colors">
          Courses
        </Link>
        <span>›</span>
        <Link href={`/admin/courses/${courseId}`} className="hover:text-white transition-colors">
          {course.code ?? course.title}
        </Link>
        <span>›</span>
        <span className="text-neutral-300">Week {module.week} — {module.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono bg-neutral-800 text-neutral-400 px-2 py-1 rounded">
              Week {module.week}
            </span>
            <span className={`text-xs px-2 py-1 rounded font-medium ${
              module.published
                ? "bg-green-900/50 text-green-400"
                : "bg-neutral-800 text-neutral-500"
            }`}>
              {module.published ? "Published" : "Draft"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{module.title}</h1>
          {module.description && (
            <p className="text-neutral-500 text-sm mt-1">{module.description}</p>
          )}
        </div>
      </div>

      <ModuleManager
        courseId={courseId}
        moduleId={moduleId}
        module={module}
        items={items}
        faculties={faculties}
        accentColor={course.accentColor}
      />
    </div>
  );
}