import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, moduleId } = await params;
    const body = await req.json();
    const { type, title, description, youtubeId, facultyId, duration, externalUrl } = body;

    if (!title || !type) {
      return NextResponse.json({ error: "Title and type are required" }, { status: 400 });
    }

    // Get current item count for ordering
    const existing = await adminDb
      .collection("courses").doc(courseId)
      .collection("modules").doc(moduleId)
      .collection("items").get();

    const order = existing.size + 1;
    const itemId = `item-${type}-${Date.now()}`;

    const itemData: any = {
      type,
      title,
      description: description ?? "",
      order,
      createdAt:   new Date(),
    };

    if (youtubeId)   itemData.youtubeId   = youtubeId;
    if (facultyId)   itemData.facultyId   = facultyId;
    if (duration)    itemData.duration    = duration;
    if (externalUrl) itemData.externalUrl = externalUrl;

    await adminDb
      .collection("courses").doc(courseId)
      .collection("modules").doc(moduleId)
      .collection("items").doc(itemId)
      .set(itemData);

    return NextResponse.json({ id: itemId, ...itemData });
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, moduleId } = await params;

    const snap = await adminDb
      .collection("courses").doc(courseId)
      .collection("modules").doc(moduleId)
      .collection("items")
      .orderBy("order")
      .get();

    const items = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Get items error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}