import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; facultyId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, facultyId } = await params;

    // Delete all videos first
    const videosSnap = await adminDb
      .collection("courses").doc(courseId)
      .collection("faculties").doc(facultyId)
      .collection("videos")
      .get();

    const batch = adminDb.batch();
    videosSnap.docs.forEach((doc) => batch.delete(doc.ref));

    // Delete faculty
    const facultyRef = adminDb
      .collection("courses").doc(courseId)
      .collection("faculties").doc(facultyId);
    batch.delete(facultyRef);

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete faculty error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}