import { auth } from "@/lib/auth";
import { getSignedUrl } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Must be signed in to view any file
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("id");

    if (!publicId) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    // Generate signed URL that expires in 1 hour
    const url = getSignedUrl(publicId);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Signed URL error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 