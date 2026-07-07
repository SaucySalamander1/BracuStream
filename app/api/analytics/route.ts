import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    // ── Fetch user data ───────────────────────────────────────
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data() ?? {};
    const progress = userData.progress ?? {};

    // ── Parse progress ────────────────────────────────────────
    // Progress keys: "courseId__facultyId__videoId"
    const progressKeys = Object.keys(progress).filter((k) => progress[k]);
    const courseProgress: Record<string, number> = {};

    for (const key of progressKeys) {
      const [courseId] = key.split("__");
      courseProgress[courseId] = (courseProgress[courseId] ?? 0) + 1;
    }

    // ── Fetch courses for context ─────────────────────────────
    const courseIds = Object.keys(courseProgress);
    const courseData: Record<string, any> = {};

    for (const cid of courseIds.slice(0, 10)) {
      const doc = await adminDb.collection("courses").doc(cid).get();
      if (doc.exists) {
        courseData[cid] = {
          title:       doc.data()?.title,
          code:        doc.data()?.code,
          accentColor: doc.data()?.accentColor,
        };
      }
    }

    // ── Conversations stats ───────────────────────────────────
    const convsSnap = await adminDb
      .collection("users").doc(userId)
      .collection("conversations")
      .orderBy("updatedAt", "desc")
      .limit(20)
      .get();

    const conversations = convsSnap.docs.map((doc) => ({
      id:        doc.id,
      title:     doc.data().title,
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    // ── Build stats ───────────────────────────────────────────
    const totalVideosWatched  = progressKeys.length;
    const totalCoursesTouched = courseIds.length;
    const totalResearchChats  = conversations.length;

    // Videos watched per course
    const coursesInProgress = Object.entries(courseProgress)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([courseId, count]) => ({
        courseId,
        videosWatched: count,
        title:         courseData[courseId]?.title ?? courseId,
        code:          courseData[courseId]?.code ?? "",
        accentColor:   courseData[courseId]?.accentColor ?? "#1a3d6b",
      }));

    return NextResponse.json({
      totalVideosWatched,
      totalCoursesTouched,
      totalResearchChats,
      coursesInProgress,
      recentConversations: conversations.slice(0, 5),
      joinedAt: userData.createdAt?.toDate(),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
