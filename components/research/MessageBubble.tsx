"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  toolsUsed: string[];
  createdAt: Date;
}

interface Props {
  message: Message;
}

const TOOL_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  search_youtube: { icon: "▶",  label: "Searched YouTube",        color: "#ef4444" },
  search_papers:  { icon: "📄", label: "Searched Academic Papers", color: "#3b82f6" },
  search_web:     { icon: "🌐", label: "Searched Web",             color: "#10b981" },
};

function extractYouTubeLinks(content: string) {
  const results: { title: string; channel: string; url: string }[] = [];
  const urlRegex = /https:\/\/www\.youtube\.com\/watch\?v=[\w-]+/g;
  const urls = content.match(urlRegex) ?? [];
  
  for (const url of urls) {
    const idx         = content.indexOf(url);
    const surrounding = content.slice(Math.max(0, idx - 200), idx + 100);
    const titleMatch  = surrounding.match(/\[([^\]]+)\]/) ?? surrounding.match(/"([^"]+)"/);
    const byMatch     = surrounding.match(/by\s+([^\n\r:,\]]+)/i);
    results.push({
      title:   titleMatch?.[1]?.trim() ?? "YouTube Video",
      channel: byMatch?.[1]?.trim() ?? "",
      url,
    });
  }
  return [...new Map(results.map((r) => [r.url, r])).values()];
}

function extractPaperInfo(content: string) {
  const results: { title: string; authors: string; year: string; citations: string; free: boolean; pdfUrl: string }[] = [];
  
  // Match numbered list items with bold titles
  const paperRegex = /\d+\.\s+[""]?([^"\n]{10,100})[""]?\s*(?:by\s+([^\n(]+))?\s*(?:\((\d{4})\))?/g;
  let match;
  
  while ((match = paperRegex.exec(content)) !== null) {
    const surrounding = content.slice(match.index, match.index + 500);
    const citeMatch   = surrounding.match(/Citations?:\s*(\d+)/i) ?? surrounding.match(/(\d{3,5})\s+citations?/i);
    const pdfMatch    = surrounding.match(/(?:Free PDF|pdf):\s*(https?:\/\/\S+)/i);
    const freeMatch   = surrounding.toLowerCase().includes("free pdf") || surrounding.toLowerCase().includes("open access");
    
    if (match[1] && match[1].length > 10) {
      results.push({
        title:     match[1].trim().replace(/\*\*/g, ""),
        authors:   match[2]?.trim() ?? "",
        year:      match[3] ?? "",
        citations: citeMatch?.[1] ?? "",
        free:      freeMatch,
        pdfUrl:    pdfMatch?.[1] ?? "",
      });
    }
  }
  return results.slice(0, 5);
}

export default function MessageBubble({ message }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-2xl px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-white leading-relaxed"
          style={{ background: "linear-gradient(135deg, #1a3d6b, #1a2d4d)" }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  const youtubeLinks = message.toolsUsed?.includes("search_youtube")
    ? extractYouTubeLinks(message.content)
    : [];
  const papers = message.toolsUsed?.includes("search_papers")
    ? extractPaperInfo(message.content)
    : [];

  return (
    <div className="flex items-start gap-3 group">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-none mt-0.5 font-bold"
        style={{ background: "linear-gradient(135deg, #d4a017, #f5c842)", color: "#000" }}
      >
        ✦
      </div>

      <div className="flex-1 min-w-0">
        {/* Tools used */}
        {message.toolsUsed && message.toolsUsed.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {[...new Set(message.toolsUsed)].map((tool) => {
              const config = TOOL_LABELS[tool];
              if (!config) return null;
              return (
                <span
                  key={tool}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium"
                  style={{
                    background:  `${config.color}11`,
                    borderColor: `${config.color}33`,
                    color:       config.color,
                  }}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Message bubble */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-sm px-5 py-4">
          <div className="prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
            prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
            prose-p:text-neutral-300 prose-p:leading-relaxed prose-p:my-2
            prose-strong:text-white prose-strong:font-semibold
            prose-em:text-neutral-400
            prose-code:text-amber-400 prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
            prose-pre:bg-neutral-800 prose-pre:border prose-pre:border-neutral-700 prose-pre:rounded-xl prose-pre:p-4
            prose-ul:text-neutral-300 prose-ul:my-2 prose-ul:space-y-1
            prose-ol:text-neutral-300 prose-ol:my-2
            prose-li:text-neutral-300 prose-li:leading-relaxed
            prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-amber-500 prose-blockquote:text-neutral-400 prose-blockquote:bg-neutral-800/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
            prose-hr:border-neutral-700 prose-hr:my-4
            prose-table:text-neutral-300 prose-th:text-white prose-th:bg-neutral-800
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* YouTube video cards */}
        {youtubeLinks.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest px-1">
              ▶ Videos Found
            </p>
            {youtubeLinks.slice(0, 5).map((video, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500/40 rounded-xl transition-all cursor-pointer group/card"
                onClick={() => window.open(video.url, "_blank")}
              >
                <div className="w-10 h-10 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center text-red-400 flex-none text-sm group-hover/card:bg-red-900/50 transition-colors">
                  ▶
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate group-hover/card:text-red-300 transition-colors">
                    {video.title}
                  </p>
                  {video.channel && (
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{video.channel}</p>
                  )}
                </div>
                <span className="text-xs text-neutral-600 flex-none">↗</span>
              </div>
            ))}
          </div>
        )}
        {/* Paper cards */}
        {papers.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest px-1">
              📄 Papers Found
            </p>
            {papers.slice(0, 5).map((paper, i) => (
              <div
                key={i}
                className="p-3 bg-neutral-900 border border-neutral-800 hover:border-blue-500/40 rounded-xl transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white leading-snug mb-1">
                      {paper.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {paper.authors && (
                        <span className="text-xs text-neutral-500 truncate max-w-xs">
                          {paper.authors}
                        </span>
                      )}
                      {paper.year && (
                        <span className="text-xs bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                          {paper.year}
                        </span>
                      )}
                      {paper.citations && (
                        <span className="text-xs text-neutral-500">
                          ⭐ {parseInt(paper.citations).toLocaleString()} citations
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-none">
                    {paper.free && paper.pdfUrl ? (
                      <button
                        onClick={() => window.open(paper.pdfUrl, "_blank")}
                        className="text-xs bg-green-950/50 text-green-400 border border-green-900/50 px-2 py-1 rounded-lg hover:bg-green-900/50 transition-colors whitespace-nowrap"
                      >
                        Free PDF ↗
                      </button>
                    ) : (
                      <span className="text-xs bg-neutral-800 text-neutral-600 px-2 py-1 rounded-lg whitespace-nowrap">
                        🔒 Paywall
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Actions */}
        <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <><span className="text-green-400">✓</span><span className="text-green-400">Copied</span></>
            ) : (
              <><span>⎘</span> Copy</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}