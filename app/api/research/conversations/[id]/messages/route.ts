import { auth } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const SYSTEM_PROMPT = `You are BRACUStream AI — a smart, helpful assistant for BRACU (BRAC University) students in Dhaka, Bangladesh.

You help with everything: research, thesis, assignments, programming, math, science, writing, general knowledge, and more.

When you receive search results in the context, incorporate them naturally into your response. Reference specific papers, videos or sources you were given.

Format responses with markdown — headers, bullet points, code blocks where appropriate.
Be helpful, accurate, encouraging. Knowledge cutoff: early 2024.`;

// ── Tool functions ────────────────────────────────────────────
async function searchYouTube(query: string, maxResults = 5) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY!;
    const url    = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}`;
    const res    = await fetch(url);
    const data   = await res.json();
    if (!data.items?.length) return [];
    return data.items.map((item: any) => ({
      title:   item.snippet.title,
      channel: item.snippet.channelTitle,
      videoId: item.id.videoId,
      url:     `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch { return []; }
}

async function searchPapers(query: string, maxResults = 5) {
  try {
    const url  = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${maxResults}&fields=title,authors,year,abstract,citationCount,openAccessPdf`;
    const res  = await fetch(url, { headers: { "User-Agent": "BRACUStream/1.0" } });
    const data = await res.json();
    if (!data.data?.length) return [];
    return data.data.map((p: any) => ({
      title:      p.title,
      authors:    p.authors?.slice(0, 3).map((a: any) => a.name).join(", "),
      year:       p.year,
      citations:  p.citationCount,
      abstract:   p.abstract?.slice(0, 200) ?? "",
      openAccess: !!p.openAccessPdf,
      pdfUrl:     p.openAccessPdf?.url ?? null,
    }));
  } catch { return []; }
}

async function searchWeb(query: string) {
  try {
    const url  = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res  = await fetch(url);
    const data = await res.json();
    return {
      answer:   data.Answer || data.AbstractText || "",
      source:   data.AbstractSource || "",
      sourceUrl: data.AbstractURL || "",
    };
  } catch { return { answer: "" }; }
}

// ── Detect what tools to run based on message ────────────────
function detectTools(message: string): string[] {
  const msg   = message.toLowerCase();
  const tools: string[] = [];

  const paperKeywords = ["paper", "research", "study", "journal", "article", "literature", "published", "citation", "reference", "find paper", "similar paper", "related work", "survey"];
  const videoKeywords = ["video", "tutorial", "youtube", "lecture", "watch", "learn", "explain", "how to", "course", "teach"];
  const webKeywords   = ["latest", "recent", "news", "current", "today", "update", "trend", "2024", "2025"];

  if (paperKeywords.some((k) => msg.includes(k))) tools.push("papers");
  if (videoKeywords.some((k) => msg.includes(k))) tools.push("youtube");
  if (webKeywords.some((k) => msg.includes(k)))   tools.push("web");

  // Auto-search for topic questions
  if (tools.length === 0 && (msg.includes("what is") || msg.includes("explain") || msg.includes("tell me about") || msg.includes("how does"))) {
    tools.push("youtube");
    tools.push("papers");
  }

  return tools;
}

// ── Extract search query from message ────────────────────────
function extractQuery(message: string): string {
  return message
    .replace(/^(find|search|look up|get|show me|give me|i want to|tell me about|explain|what is|how does|can you find)/gi, "")
    .replace(/(papers?|videos?|tutorials?|resources?|articles?|research|on|about|for|related to)/gi, "")
    .trim()
    .slice(0, 100) || message.slice(0, 100);
}

async function generateTitle(firstMessage: string): Promise<string> {
  try {
    const res = await groq.chat.completions.create({
      model:      "llama-3.3-70b-versatile",
      max_tokens: 15,
      messages: [
        { role: "system", content: "Generate a short title (max 5 words) for this conversation. Return only the title, no quotes." },
        { role: "user",   content: firstMessage },
      ],
    });
    return res.choices[0].message.content?.trim() ?? "New Conversation";
  } catch { return "New Conversation"; }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const snap = await adminDb
      .collection("users").doc(session.user.id)
      .collection("conversations").doc(id)
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = snap.docs.map((doc) => ({
      id:        doc.id,
      role:      doc.data().role,
      content:   doc.data().content,
      toolsUsed: doc.data().toolsUsed ?? [],
      createdAt: doc.data().createdAt?.toDate(),
    }));

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: conversationId } = await params;
    const { message, pdfContent, history } = await req.json();

    // Save user message
    await adminDb
      .collection("users").doc(session.user.id)
      .collection("conversations").doc(conversationId)
      .collection("messages")
      .add({ role: "user", content: message, createdAt: new Date() });

    // Detect and run tools
    const toolsToRun  = detectTools(message);
    const searchQuery = extractQuery(message);
    const toolsUsed:  string[] = [];
    let   toolContext = "";

    if (toolsToRun.includes("papers")) {
      const papers = await searchPapers(searchQuery);
      if (papers.length > 0) {
        toolsUsed.push("search_papers");
        toolContext += `\n\n## Academic Papers Found:\n${papers.map((p: any, i: number) =>
          `${i + 1}. **${p.title}** (${p.year})\n   Authors: ${p.authors}\n   Citations: ${p.citations}\n   ${p.abstract}\n   ${p.openAccess ? `📄 Free PDF: ${p.pdfUrl}` : "🔒 Behind paywall"}`
        ).join("\n\n")}`;
      }
    }

    if (toolsToRun.includes("youtube")) {
      const videos = await searchYouTube(searchQuery);
      if (videos.length > 0) {
        toolsUsed.push("search_youtube");
        toolContext += `\n\n## YouTube Videos Found:\n${videos.map((v: any, i: number) =>
          `${i + 1}. [${v.title}](${v.url}) by ${v.channel}`
        ).join("\n")}`;
      }
    }

    if (toolsToRun.includes("web")) {
      const web = await searchWeb(searchQuery);
      if (web.answer) {
        toolsUsed.push("search_web");
        toolContext += `\n\n## Web Search Result:\n${web.answer}${web.source ? `\nSource: ${web.source}` : ""}`;
      }
    }

    // Build messages
    const systemContent = pdfContent
      ? `${SYSTEM_PROMPT}\n\n--- UPLOADED PDF CONTENT ---\n${pdfContent.slice(0, 8000)}\n--- END PDF ---`
      : SYSTEM_PROMPT;

    const historyMessages = (history ?? [])
      .slice(-8)
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const userContent = toolContext
      ? `${message}\n\n[Search results retrieved for context:${toolContext}]`
      : message;

    const chatMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system",    content: systemContent },
      ...historyMessages,
      { role: "user",      content: userContent },
    ];

    // Call Groq — no tools, just completion
    const response = await groq.chat.completions.create({
      model:      "llama-3.3-70b-versatile",
      max_tokens: 2048,
      messages:   chatMessages,
    });

    const finalContent = response.choices[0].message.content
      ?? "I couldn't generate a response. Please try again.";

    // Save assistant message
    await adminDb
      .collection("users").doc(session.user.id)
      .collection("conversations").doc(conversationId)
      .collection("messages")
      .add({
        role:      "assistant",
        content:   finalContent,
        toolsUsed: [...new Set(toolsUsed)],
        createdAt: new Date(),
      });

    // Update conversation
    const convRef  = adminDb
      .collection("users").doc(session.user.id)
      .collection("conversations").doc(conversationId);
    const convSnap = await convRef.get();
    const isFirst  = !convSnap.data()?.preview;

    const updateData: any = { updatedAt: new Date(), preview: message.slice(0, 80) };
    if (isFirst) updateData.title = await generateTitle(message);
    await convRef.update(updateData);

    return NextResponse.json({
      content:   finalContent,
      toolsUsed: [...new Set(toolsUsed)],
    });
  } catch (error: any) {
    console.error("Send message error:", error.message);
    return NextResponse.json(
      { error: error.message ?? "Something went wrong" },
      { status: 500 }
    );
  }
}