import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Delete all messages first
    const messagesSnap = await adminDb
      .collection("users").doc(session.user.id)
      .collection("conversations").doc(id)
      .collection("messages")
      .get();

    const batch = adminDb.batch();
    messagesSnap.docs.forEach((doc) => batch.delete(doc.ref));

    // Delete conversation
    const convRef = adminDb
      .collection("users").doc(session.user.id)
      .collection("conversations").doc(id);
    batch.delete(convRef);

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}