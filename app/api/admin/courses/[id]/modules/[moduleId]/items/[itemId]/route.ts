import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; moduleId: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, moduleId, itemId } = await params;

    await adminDb
      .collection("courses").doc(courseId)
      .collection("modules").doc(moduleId)
      .collection("items").doc(itemId)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}