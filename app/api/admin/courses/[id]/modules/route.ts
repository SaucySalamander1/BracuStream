import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const { title, week, description, published } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get current module count for ordering
    const existing = await adminDb
      .collection("courses").doc(courseId)
      .collection("modules").get();

    const order = existing.size + 1;
    const moduleId = `module-week-${week}-${Date.now()}`;

    await adminDb
      .collection("courses").doc(courseId)
      .collection("modules").doc(moduleId)
      .set({
        title,
        week:        week ?? order,
        description: description ?? "",
        published:   published ?? false,
        order,
        createdAt:   new Date(),
        updatedAt:   new Date(),
      });

    return NextResponse.json({
      id:          moduleId,
      title,
      week:        week ?? order,
      description: description ?? "",
      published:   published ?? false,
      order,
    });
  } catch (error) {
    console.error("Create module error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    const snap = await adminDb
      .collection("courses").doc(courseId)
      .collection("modules")
      .orderBy("order")
      .get();

    const modules = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Get modules error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}