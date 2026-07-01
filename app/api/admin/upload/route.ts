import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { uploadFile } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData  = await req.formData();
    const file      = formData.get("file") as File;
    const courseId  = formData.get("courseId") as string;
    const moduleId  = formData.get("moduleId") as string;
    const itemType  = formData.get("type") as string;
    const title     = formData.get("title") as string;

    if (!file || !courseId || !moduleId || !itemType || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Use PDF, PPTX, DOCX, or images." },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const folder   = `bracustream/${courseId}/${moduleId}/${itemType}s`;
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    console.log("Cloudinary config:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY?.slice(0,5));

    const uploaded = await uploadFile(buffer, {
      folder,
      filename,
      type: itemType,
    });

    // Save item to Firestore
    const existing = await adminDb
      .collection("courses").doc(courseId)
      .collection("modules").doc(moduleId)
      .collection("items").get();

    const order  = existing.size + 1;
    const itemId = `item-${itemType}-${Date.now()}`;

    await adminDb
      .collection("courses").doc(courseId)
      .collection("modules").doc(moduleId)
      .collection("items").doc(itemId)
      .set({
        type:        itemType,
        title,
        storageUrl:  uploaded.url,
        publicId:    uploaded.publicId,
        sizeKb:      Math.round(uploaded.bytes / 1024),
        order,
        createdAt:   new Date(),
      });

    return NextResponse.json({
      id:         itemId,
      type:       itemType,
      title,
      storageUrl: uploaded.url,
      sizeKb:     Math.round(uploaded.bytes / 1024),
      order,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}