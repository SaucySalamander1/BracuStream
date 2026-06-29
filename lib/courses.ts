import { adminDb } from "@/lib/firebase-admin";
import { Course } from "@/types";

export async function getAllCourses(): Promise<Course[]> {
  const snap = await adminDb
    .collection("courses")
    .where("published", "==", true)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
    };
  }) as Course[];
}

export async function getCourseById(id: string): Promise<Course | null> {
  const doc = await adminDb.collection("courses").doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  } as Course;
}

export async function getFaculties(courseId: string) {
  const snap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("faculties")
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id:          doc.id,
      name:        data.name ?? "",
      section:     data.section ?? "",
      designation: data.designation ?? "",
      bio:         data.bio ?? "",
      playlistUrl: data.playlistUrl ?? "",
      videoCount:  data.videoCount ?? 0,
    };
  });
}

export async function getVideos(courseId: string, facultyId: string) {
  const snap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("faculties")
    .doc(facultyId)
    .collection("videos")
    .orderBy("order")
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id:        doc.id,
      youtubeId: data.youtubeId ?? "",
      title:     data.title ?? "",
      duration:  data.duration ?? "0:00",
      order:     data.order ?? 0,
      week:      data.week ?? 1,
      topic:     data.topic ?? "",
    };
  });
}