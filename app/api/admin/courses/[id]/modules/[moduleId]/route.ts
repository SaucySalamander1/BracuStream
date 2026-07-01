import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function PATCH(
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

    await adminDb
      .collection("courses").doc(courseId)
      .collection("modules").doc(moduleId)
      .update({ ...body, updatedAt: new Date() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update module error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, moduleId } = await params;

    // Delete all items first
    const itemsSnap = await adminDb
      .collection("courses").doc(courseId)
      .collection("modules").doc(moduleId)
      .collection("items").get();

    const batch = adminDb.batch();
    itemsSnap.docs.forEach((doc) => batch.delete(doc.ref));

    // Delete module
    const moduleRef = adminDb
      .collection("courses").doc(courseId)
      .collection("modules").doc(moduleId);
    batch.delete(moduleRef);

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete module error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}