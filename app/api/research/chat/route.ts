import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const SYSTEM_PROMPT = `You are BRACUStream AI — a smart, helpful assistant for BRACU (BRAC University) students. You can help with absolutely anything: research, thesis, assignments, programming, math, science, writing, life advice, and more.

You have access to these tools:
- search_youtube: Find YouTube tutorial/lecture videos on any topic
- search_papers: Search academic papers on Semantic Scholar and arXiv
- search_web: Search the web for latest information

Use tools automatically when:
- Student asks about a concept → search YouTube for tutorials
- Student asks about research topics → search papers
- Student asks about recent events or latest info → search web
- Student asks to "find videos/papers/resources" → use appropriate tool

Always be helpful, accurate, encouraging and clear. When you don't know something, say so honestly. Format responses with markdown — use headers, bullet points, code blocks where appropriate.

You know the student is from BRACU, Dhaka, Bangladesh. Be culturally aware and relevant.`;

// ── Tool definitions ──────────────────────────────────────────
const TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_youtube",
      description: "Search YouTube for tutorial, lecture or explainer videos on any topic. Use when student wants to learn something visually or asks for video resources.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for YouTube",
          },
          max_results: {
            type: "number",
            description: "Number of results to return (default 5)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_papers",
      description: "Search academic research papers on Semantic Scholar and arXiv. Use when student asks about research topics, wants paper references, or needs academic sources.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Research topic or paper search query",
          },
          max_results: {
            type: "number",
            description: "Number of papers to return (default 5)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Search the web for latest information, news, tutorials or any topic. Use when student needs current information or when other tools aren't suitable.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Web search query",
          },
        },
        required: ["query"],
      },
    },
  },
];

// ── Tool execution functions ──────────────────────────────────
async function searchYouTube(query: string, maxResults: number = 5) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY!;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}`;
    const res  = await fetch(url);
    const data = await res.json();

    if (!data.items) return { error: "No results found" };

    return {
      videos: data.items.map((item: any) => ({
        title:       item.snippet.title,
        channel:     item.snippet.channelTitle,
        description: item.snippet.description?.slice(0, 150),
        videoId:     item.id.videoId,
        url:         `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail:   item.snippet.thumbnails?.medium?.url,
      })),
    };
  } catch (e) {
    return { error: "YouTube search failed" };
  }
}

async function searchPapers(query: string, maxResults: number = 5) {
  try {
    // Search Semantic Scholar
    const ssUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${maxResults}&fields=title,authors,year,abstract,citationCount,openAccessPdf,url`;
    const ssRes  = await fetch(ssUrl);
    const ssData = await ssRes.json();

    const papers = ssData.data?.map((p: any) => ({
      title:        p.title,
      authors:      p.authors?.map((a: any) => a.name).join(", "),
      year:         p.year,
      citations:    p.citationCount,
      abstract:     p.abstract?.slice(0, 200),
      url:          p.url,
      openAccess:   !!p.openAccessPdf,
      pdfUrl:       p.openAccessPdf?.url,
    })) ?? [];

    return { papers };
  } catch (e) {
    return { error: "Paper search failed" };
  }
}

async function searchWeb(query: string) {
  try {
    // Use DuckDuckGo instant answer API (free, no key)
    const url  = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res  = await fetch(url);
    const data = await res.json();

    return {
      answer:          data.Answer || data.AbstractText || "",
      source:          data.AbstractSource || "",
      sourceUrl:       data.AbstractURL || "",
      relatedTopics:   data.RelatedTopics?.slice(0, 5).map((t: any) => ({
        text: t.Text,
        url:  t.FirstURL,
      })) ?? [],
    };
  } catch (e) {
    return { error: "Web search failed" };
  }
}

// ── Execute tool call ─────────────────────────────────────────
async function executeTool(name: string, args: any) {
  switch (name) {
    case "search_youtube":
      return await searchYouTube(args.query, args.max_results);
    case "search_papers":
      return await searchPapers(args.query, args.max_results);
    case "search_web":
      return await searchWeb(args.query);
    default:
      return { error: "Unknown tool" };
  }
}

// ── Main route ────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, pdfContent } = await req.json();

    // Build message array
    const systemMessage = pdfContent
      ? `${SYSTEM_PROMPT}\n\n--- UPLOADED PDF CONTENT ---\n${pdfContent.slice(0, 8000)}\n--- END PDF ---`
      : SYSTEM_PROMPT;

    let chatMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      ...messages,
    ];

    // First call — may include tool calls
    let response = await groq.chat.completions.create({
      model:      "llama-3.3-70b-versatile",
      max_tokens: 2048,
      messages:   chatMessages,
      tools:      TOOLS,
      tool_choice: "auto",
    });

    let message = response.choices[0].message;

    // Handle tool calls
    while (message.tool_calls && message.tool_calls.length > 0) {
      // Add assistant message with tool calls
      chatMessages.push(message as any);

      // Execute all tool calls
      for (const toolCall of message.tool_calls) {
        const args   = JSON.parse(toolCall.function.arguments);
        const result = await executeTool(toolCall.function.name, args);

        chatMessages.push({
          role:         "tool",
          tool_call_id: toolCall.id,
          content:      JSON.stringify(result),
        } as any);
      }

      // Get next response
      response = await groq.chat.completions.create({
        model:      "llama-3.3-70b-versatile",
        max_tokens: 2048,
        messages:   chatMessages,
        tools:      TOOLS,
        tool_choice: "auto",
      });

      message = response.choices[0].message;
    }

    return NextResponse.json({
      content:    message.content,
      toolsCalled: response.choices[0].message.tool_calls?.map(t => t.function.name) ?? [],
    });
  } catch (error: any) {
    console.error("Research chat error:", error);
    return NextResponse.json(
      { error: error.message ?? "Something went wrong" },
      { status: 500 }
    );
  }
}