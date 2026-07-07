"use client";
import { useState, useEffect } from "react";
import ConversationSidebar from "./ConversationSidebar";
import ChatWindow from "./ChatWindow";

interface User {
  id:    string;
  name:  string;
  email: string;
  role:  string;
}

interface Conversation {
  id:        string;
  title:     string;
  preview:   string;
  updatedAt: Date;
}

interface Props {
  user: User;
}

export default function ResearchHub({ user }: Props) {
  const [conversations, setConversations]       = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId]         = useState<string | null>(null);
  const [loadingConvs, setLoadingConvs]         = useState(true);
  const [sidebarOpen, setSidebarOpen]           = useState(true);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res  = await fetch("/api/research/conversations");
      const data = await res.json();
      setConversations(data);
      // Auto-select first conversation
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    } finally {
      setLoadingConvs(false);
    }
  };

  const createConversation = async () => {
    try {
      const res  = await fetch("/api/research/conversations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title: "New Conversation" }),
      });
      const data = await res.json();
      setConversations((prev) => [data, ...prev]);
      setActiveConvId(data.id);
    } catch (e) {
      console.error("Failed to create conversation", e);
    }
  };

  const updateConversationTitle = (id: string, title: string, preview: string) => {
    setConversations((prev) =>
      prev.map((c) => c.id === id ? { ...c, title, preview } : c)
    );
  };

  const deleteConversation = async (id: string) => {
    try {
      await fetch(`/api/research/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setActiveConvId(remaining[0]?.id ?? null);
      }
    } catch (e) {
      console.error("Failed to delete conversation", e);
    }
  };

  return (
    <div
      className="flex bg-neutral-950"
      style={{ height: "100vh" }}
    >
      {/* Sidebar */}
      <ConversationSidebar
        user={user}
        conversations={conversations}
        activeConvId={activeConvId}
        loading={loadingConvs}
        sidebarOpen={sidebarOpen}
        onSelect={setActiveConvId}
        onCreate={createConversation}
        onDelete={deleteConversation}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConvId ? (
          <ChatWindow
            key={activeConvId}
            conversationId={activeConvId}
            userId={user.id}
            onTitleUpdate={(title, preview) =>
              updateConversationTitle(activeConvId, title, preview)
            }
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            <div className="text-5xl">🔬</div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                BRACUStream Research Hub
              </h2>
              <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
                Your AI-powered research assistant. Ask anything — get answers,
                find papers, discover videos, build your thesis.
              </p>
            </div>
            <button
              onClick={createConversation}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-black"
              style={{ background: "#d4a017" }}
            >
              ✦ Start New Conversation
            </button>
            <div className="grid grid-cols-2 gap-3 max-w-lg w-full mt-4">
              {[
                { icon: "📑", text: "Upload a PDF and ask questions about it" },
                { icon: "🔍", text: "Find academic papers on any topic" },
                { icon: "▶", text: "Get YouTube tutorial recommendations" },
                { icon: "🏗", text: "Build your thesis structure and outline" },
              ].map((s) => (
                <button
                  key={s.text}
                  onClick={createConversation}
                  className="flex items-start gap-3 p-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-600 rounded-xl text-left transition-all"
                >
                  <span className="text-xl flex-none">{s.icon}</span>
                  <span className="text-xs text-neutral-400 leading-relaxed">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}