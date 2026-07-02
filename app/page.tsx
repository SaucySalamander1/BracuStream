import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllCourses } from "@/lib/courses";
import LandingPage from "@/components/landing/LandingPage";

export default async function RootPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  const courses = await getAllCourses();
  const preview = courses.slice(0, 8);

  return <LandingPage courses={preview} />;
}