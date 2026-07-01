import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCourseById, getModules } from "@/lib/courses";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LearnRedirectPage({ params }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { id } = await params;
  const course = await getCourseById(id);
  if (!course) notFound();

  const modules = await getModules(id);
  const published = modules.filter((m) => m.published);

  if (published.length === 0) redirect(`/courses/${id}`);

  redirect(`/courses/${id}/learn/${published[0].id}`);
}