import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

// ── GET — fetch all conversations for user ────────────────────
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const snap = await adminDb
      .collection("users").doc(session.user.id)
      .collection("conversations")
      .orderBy("updatedAt", "desc")
      .limit(50)
      .get();

    const conversations = snap.docs.map((doc) => ({
      id:        doc.id,
      title:     doc.data().title ?? "New Conversation",
      updatedAt: doc.data().updatedAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      preview:   doc.data().preview ?? "",
    }));

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── POST — create new conversation ────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title } = await req.json();

    const ref = await adminDb
      .collection("users").doc(session.user.id)
      .collection("conversations")
      .add({
        title:     title ?? "New Conversation",
        preview:   "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    return NextResponse.json({ id: ref.id, title: title ?? "New Conversation" });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}