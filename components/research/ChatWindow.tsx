"use client";
import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  toolsUsed: string[];
  createdAt: Date;
}

interface Props {
  conversationId: string;
  userId:         string;
  onTitleUpdate:  (title: string, preview: string) => void;
}

const SUGGESTIONS = [
  { icon: "🔬", text: "Explain transformer architecture" },
  { icon: "📄", text: "Find papers on deep learning" },
  { icon: "🏗",  text: "Build thesis outline on NLP" },
  { icon: "▶",  text: "Find YouTube tutorials on CNNs" },
  { icon: "📝", text: "What are good CSE thesis topics?" },
  { icon: "💡", text: "Explain attention mechanism simply" },
];

export default function ChatWindow({ conversationId, userId, onTitleUpdate }: Props) {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [pdfContent, setPdfContent]   = useState<string | null>(null);
  const [pdfName, setPdfName]         = useState<string | null>(null);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [thinkingText, setThinkingText] = useState("Thinking");
  const bottomRef                     = useRef<HTMLDivElement>(null);
  const inputRef                      = useRef<HTMLTextAreaElement>(null);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => { loadMessages(); }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Animate thinking text
  useEffect(() => {
    if (!loading) return;
    const texts = ["Thinking", "Searching", "Analyzing", "Generating"];
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % texts.length;
      setThinkingText(texts[i]);
    }, 1500);
    return () => clearInterval(timer);
  }, [loading]);

  const loadMessages = async () => {
    setLoadingMsgs(true);
    try {
      const res  = await fetch(`/api/research/conversations/${conversationId}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error("Failed to load messages", e);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const handleSend = async (text?: string) => {
    const userMessage = (text ?? input).trim();
    if (!userMessage || loading) return;
    setInput("");

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: tempId, role: "user", content: userMessage,
      toolsUsed: [], createdAt: new Date(),
    }]);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/research/conversations/${conversationId}/messages`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            message:    userMessage,
            pdfContent: pdfContent,
            history:    messages.slice(-10).map((m) => ({
              role: m.role, content: m.content,
            })),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, {
        id:        `assistant-${Date.now()}`,
        role:      "assistant",
        content:   data.content,
        toolsUsed: data.toolsUsed ?? [],
        createdAt: new Date(),
      }]);

      onTitleUpdate("", userMessage.slice(0, 80));
    } catch (e: any) {
      setMessages((prev) => [...prev, {
        id:        `error-${Date.now()}`,
        role:      "assistant",
        content:   `Sorry, something went wrong: ${e.message}. Please try again.`,
        toolsUsed: [],
        createdAt: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }
    setPdfLoading(true);
    setPdfName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib    = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      const pdf      = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let   fullText = "";
      for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) {
        const page    = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text    = content.items.map((item: any) => item.str).join(" ");
        fullText += `\n[Page ${i}]\n${text}`;
      }
      setPdfContent(fullText);
      setMessages((prev) => [...prev, {
        id:        `pdf-${Date.now()}`,
        role:      "assistant",
        content:   `📑 **PDF loaded: ${file.name}** (${pdf.numPages} pages)\n\nI've read your PDF. Ask me anything about it — summary, key findings, methodology, specific sections, or how it relates to your research.`,
        toolsUsed: [],
        createdAt: new Date(),
      }]);
    } catch {
      alert("Failed to read PDF. Make sure it's a text-based PDF.");
      setPdfName(null);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-sm flex-none">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #d4a017, #f5c842)", color: "#000" }}
          >
            ✦
          </div>
          <div>
            <p className="text-sm font-semibold text-white">BRACUStream AI</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-neutral-500">
                Llama 3.3 70B · YouTube · Semantic Scholar · Web
              </p>
            </div>
          </div>
        </div>

        {/* PDF indicator */}
        {pdfName && (
          <div className="flex items-center gap-2 bg-amber-950/50 border border-amber-800/50 rounded-lg px-3 py-1.5">
            <span className="text-xs text-amber-400 font-medium">📑 {pdfName}</span>
            <button
              onClick={() => { setPdfContent(null); setPdfName(null); }}
              className="text-amber-600 hover:text-red-400 text-xs transition-colors ml-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {loadingMsgs ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "items-start gap-3"}`}>
                {i % 2 !== 0 && <div className="w-8 h-8 rounded-xl bg-neutral-800 animate-pulse flex-none" />}
                <div className="h-20 w-72 bg-neutral-800 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-8 py-12">
            {/* Welcome */}
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #d4a017, #f5c842)", color: "#000" }}
              >
                ✦
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-neutral-500 text-sm max-w-sm">
                Ask me anything — research, thesis, code, math, or upload a PDF to analyze it
              </p>
            </div>

            {/* Suggestion grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => handleSend(s.text)}
                  className="flex items-center gap-3 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 rounded-xl text-left transition-all group"
                >
                  <span className="text-lg flex-none">{s.icon}</span>
                  <span className="text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors leading-relaxed">
                    {s.text}
                  </span>
                </button>
              ))}
            </div>

            {/* Capabilities */}
            <div className="flex gap-3 flex-wrap justify-center">
              {[
                { icon: "📄", label: "Find Papers" },
                { icon: "▶",  label: "Find Videos" },
                { icon: "📑", label: "Read PDFs" },
                { icon: "🏗",  label: "Build Thesis" },
                { icon: "💬", label: "Chat Freely" },
              ].map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 text-xs bg-neutral-900 border border-neutral-800 text-neutral-500 px-3 py-1.5 rounded-full"
                >
                  {c.icon} {c.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-none"
              style={{ background: "linear-gradient(135deg, #d4a017, #f5c842)", color: "#000" }}
            >
              ✦
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-400">{thinkingText}...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-none px-6 py-4 border-t border-neutral-800/80 bg-neutral-950">
        {pdfLoading && (
          <div className="mb-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2">
            <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin flex-none" />
            Reading PDF — please wait...
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* PDF button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-none w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-amber-500/50 text-neutral-400 hover:text-amber-400 flex items-center justify-center transition-all text-base"
            title="Upload PDF"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
          />

          {/* Input box */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything — research, thesis, code, concepts, or upload a PDF..."
              rows={1}
              className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500/70 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors resize-none leading-relaxed"
              style={{ maxHeight: "140px" }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 140) + "px";
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex-none w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all disabled:opacity-30 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #d4a017, #f5c842)", color: "#000" }}
          >
            ↑
          </button>
        </div>

        <p className="text-xs text-neutral-700 mt-2.5 text-center">
          Enter to send · Shift+Enter for new line · 📎 upload PDF for analysis
        </p>
      </div>
    </div>
  );
}