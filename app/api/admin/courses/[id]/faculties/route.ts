import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import https from "https";

function fetchPlaylist(playlistId: string, apiKey: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.error) { reject(new Error(json.error.message)); return; }
          resolve(json.items || []);
        } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

function getPlaylistId(url: string): string {
  const match = url.match(/[?&]list=([^&]+)/);
  return match ? match[1] : "";
}

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
    const { name, section, designation, playlistUrl } = await req.json();

    if (!name || !playlistUrl) {
      return NextResponse.json({ error: "Name and playlist URL required" }, { status: 400 });
    }

    const apiKey     = process.env.YOUTUBE_API_KEY!;
    const playlistId = getPlaylistId(playlistUrl);

    if (!playlistId) {
      return NextResponse.json({ error: "Invalid YouTube playlist URL" }, { status: 400 });
    }

    // Fetch videos from YouTube
    let videos: any[] = [];
    try {
      const items = await fetchPlaylist(playlistId, apiKey);
      videos = items
        .filter((item: any) => item.snippet?.resourceId?.videoId)
        .map((item: any, idx: number) => ({
          youtubeId: item.snippet.resourceId.videoId,
          title:     item.snippet.title,
          duration:  "0:00",
          order:     idx + 1,
          week:      Math.ceil((idx + 1) / 2),
          topic:     "",
          addedAt:   new Date(),
        }));
    } catch (e: any) {
      return NextResponse.json(
        { error: `YouTube API error: ${e.message}` },
        { status: 400 }
      );
    }

    // Generate faculty ID
    const facultyId = `faculty-${Date.now()}`;

    // Save faculty
    await adminDb
      .collection("courses").doc(courseId)
      .collection("faculties").doc(facultyId)
      .set({
        name,
        section:     section ?? "",
        designation: designation ?? "",
        playlistUrl,
        videoCount:  videos.length,
        addedAt:     new Date(),
      });

    // Save videos
    for (const video of videos) {
      await adminDb
        .collection("courses").doc(courseId)
        .collection("faculties").doc(facultyId)
        .collection("videos").doc(`video-${video.order}`)
        .set(video);
    }

    return NextResponse.json({
      id:          facultyId,
      name,
      section:     section ?? "",
      designation: designation ?? "",
      playlistUrl,
      videoCount:  videos.length,
    });
  } catch (error) {
    console.error("Add faculty error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}