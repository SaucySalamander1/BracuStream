import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCourseById, getFaculties, getVideos } from "@/lib/courses";
import Navbar from "@/components/layout/Navbar";
import VideoPlayer from "@/components/courses/VideoPlayer";

interface Props {
  params: Promise<{ id: string; facultyId: string }>;
  searchParams: Promise<{ v?: string }>;
}

export default async function WatchPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const { id, facultyId } = await params;
  const { v } = await searchParams;

  const course = await getCourseById(id);
  if (!course) notFound();

  const faculties = await getFaculties(id);
  const faculty = faculties.find((f) => f.id === facultyId);
  if (!faculty) notFound();

  const videos = await getVideos(id, facultyId);
  if (videos.length === 0) notFound();

  // Start from video in URL or first video
  const startIndex = v
    ? Math.max(0, videos.findIndex((vid) => vid.youtubeId === v))
    : 0;

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Navbar user={session.user} />
      <VideoPlayer
        course={course}
        faculty={faculty}
        videos={videos}
        startIndex={startIndex}
        userId={session.user.id}
      />
    </div>
  );
}