import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      type, title, department, description,
      accentColor, published, labCourse,
      prerequisites, tags,
      // BRACU fields
      code, credits, semester,
      // External fields
      category, provider, level,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (type === "bracu" && !code) {
      return NextResponse.json({ error: "Course code is required" }, { status: 400 });
    }

    // Generate ID from code or title
    const id = type === "bracu"
      ? code.toLowerCase().replace(/\s+/g, "")
      : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);

    // Check if course already exists
    const existing = await adminDb.collection("courses").doc(id).get();
    if (existing.exists) {
      return NextResponse.json(
        { error: `A course with ID "${id}" already exists` },
        { status: 409 }
      );
    }

    const courseData: any = {
      type,
      title,
      department:  department ?? "CSE",
      description: description ?? "",
      accentColor: accentColor ?? "#1a3d6b",
      published:   published ?? true,
      labCourse:   labCourse ?? false,
      prerequisites: prerequisites ?? [],
      tags:          tags ?? [],
      rating:      0,
      ratingCount: 0,
      createdAt:   new Date(),
      updatedAt:   new Date(),
    };

    if (type === "bracu") {
      courseData.code     = code;
      courseData.credits  = credits ?? 3;
      courseData.semester = semester ?? "";
    } else {
      courseData.category = category ?? "";
      courseData.provider = provider ?? "";
      courseData.level    = level ?? "Beginner";
    }

    await adminDb.collection("courses").doc(id).set(courseData);

    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}