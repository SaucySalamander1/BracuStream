import { getAllCourses } from "@/lib/courses";
import { auth } from "@/lib/auth";
import PublicCourseBrowse from "@/components/landing/temp";

export default async function CoursesPage() {
  const [session, courses] = await Promise.all([
    auth(),
    getAllCourses(),
  ]);

  return (
    <PublicCourseBrowse
      courses={courses}
      isLoggedIn={!!session}
    />
  );
}