import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCourseById, getFaculties } from "@/lib/courses";
import Navbar from "@/components/layout/Navbar";
import CourseHero from "@/components/courses/CourseHero";
import FacultySelector from "@/components/courses/FacultySelector";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CoursePage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) notFound();

  const faculties = await getFaculties(id);
  const totalVideos = faculties.reduce((sum, f) => sum + (f.videoCount ?? 0), 0);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar user={session.user} />
      <CourseHero
        course={course}
        totalVideos={totalVideos}
        totalFaculties={faculties.length}
      />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <FacultySelector
          courseId={id}
          faculties={faculties}
          course={course}
        />
      </div>
    </div>
  );
}