import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, facultyId, videoId } = await req.json();

    if (!courseId || !facultyId || !videoId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const key = `${courseId}__${facultyId}__${videoId}`;

    await adminDb.collection("users").doc(session.user.id).update({
      [`progress.${key}`]: true,
      lastSeen: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}