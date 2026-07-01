import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCourseById, getModules, getModuleItems } from "@/lib/courses";
import { adminDb } from "@/lib/firebase-admin";
import Navbar from "@/components/layout/Navbar";
import ModuleLearner from "@/components/courses/ModuleLearner";
import ModuleSidebar from "@/components/courses/ModuleSidebar";

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

export default async function LearnPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { id: courseId, moduleId } = await params;

  const [course, module, allModules, items] = await Promise.all([
    getCourseById(courseId),
    getModule(courseId, moduleId),
    getModules(courseId),
    getModuleItems(courseId, moduleId),
  ]);

  if (!course) notFound();
  if (!module || !module.published) notFound();

  const publishedModules = allModules.filter((m) => m.published);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Navbar user={session.user} />
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 53px)" }}>
        {/* Sidebar */}
        <ModuleSidebar
          courseId={courseId}
          course={course}
          modules={publishedModules}
          activeModuleId={moduleId}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <ModuleLearner
            course={course}
            module={module}
            items={items}
            userId={session.user.id}
            courseId={courseId}
            moduleId={moduleId}
          />
        </main>
      </div>
    </div>
  );
}