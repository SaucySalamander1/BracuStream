import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCourseById } from "@/lib/courses";
import { adminDb } from "@/lib/firebase-admin";
import Navbar from "@/components/layout/Navbar";
import MaterialsViewer from "@/components/courses/MaterialsViewer";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

async function getMaterials(courseId: string) {
  const snap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("materials")
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id:          doc.id,
      type:        data.type ?? "resource",
      name:        data.name ?? "",
      storageUrl:  data.storageUrl ?? "",
      sizeKb:      data.sizeKb ?? 0,
      week:        data.week ?? null,
      description: data.description ?? "",
      facultyId:   data.facultyId ?? null,
      examYear:    data.examYear ?? null,
      examType:    data.examType ?? null,
      labNo:       data.labNo ?? null,
      quizNo:      data.quizNo ?? null,
    };
  });
}

export default async function MaterialsPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { id } = await params;
  const { type } = await searchParams;

  const course = await getCourseById(id);
  if (!course) notFound();

  const materials = await getMaterials(id);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar user={session.user} />
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded font-mono"
              style={{ background: course.accentColor, color: "#fff" }}
            >
              {course.code ?? course.title}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Course Materials
          </h1>
          <p className="text-neutral-500 text-sm">{course.title}</p>
        </div>

        <MaterialsViewer
          materials={materials}
          activeType={type ?? "slide"}
          courseId={id}
          accentColor={course.accentColor}
        />
      </div>
    </div>
  );
}