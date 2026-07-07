"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Conversation {
  id:        string;
  title:     string;
  preview:   string;
  updatedAt: Date;
}

interface User {
  id:    string;
  name:  string;
  email: string;
  role:  string;
}

interface Props {
  user:          User;
  conversations: Conversation[];
  activeConvId:  string | null;
  loading:       boolean;
  sidebarOpen:   boolean;
  onSelect:      (id: string) => void;
  onCreate:      () => void;
  onDelete:      (id: string) => void;
  onToggle:      () => void;
}

export default function ConversationSidebar({
  user, conversations, activeConvId, loading,
  sidebarOpen, onSelect, onCreate, onDelete, onToggle,
}: Props) {
  const router = useRouter();

  if (!sidebarOpen) {
    return (
      <div className="flex flex-col items-center py-4 px-2 border-r border-neutral-800 bg-neutral-900 gap-3">
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center text-sm transition-colors"
        >
          ›
        </button>
        <button
          onClick={onCreate}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors"
          style={{ background: "#d4a017", color: "#000" }}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col border-r border-neutral-800 bg-neutral-900 flex-none"
      style={{ width: 260 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <div
          className="font-mono font-bold text-sm tracking-widest cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          <span style={{ color: "#d4a017" }}>BRACU</span>
          <span className="text-white">STREAM</span>
        </div>
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 flex items-center justify-center text-sm transition-colors"
        >
          ‹
        </button>
      </div>

      {/* New conversation button */}
      <div className="px-3 py-3 border-b border-neutral-800">
        <button
          onClick={onCreate}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-black transition-colors"
          style={{ background: "#d4a017" }}
        >
          <span>✦</span>
          <span>New Conversation</span>
        </button>
      </div>

      {/* Nav links */}
      <div className="px-3 py-2 border-b border-neutral-800">
      {[
          { icon: "🏠", label: "Dashboard",    href: "/dashboard",  key: "home" },
          { icon: "📚", label: "Courses",       href: "/dashboard",  key: "courses" },
          { icon: "🔬", label: "Research Hub",  href: "/research",   key: "research", active: true },
        ].map((link) => (
          <button
            key={link.key}
            onClick={() => router.push(link.href)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left mb-0.5"
            style={{
              background: link.active ? "#d4a01722" : "transparent",
              color:      link.active ? "#d4a017"   : "#888",
            }}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </button>
        ))}
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-4 py-1.5">
          <p className="text-xs font-medium text-neutral-600 uppercase tracking-widest">
            Recent
          </p>
        </div>

        {loading ? (
          <div className="space-y-2 px-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-neutral-600">No conversations yet</p>
            <p className="text-xs text-neutral-700 mt-1">Start one above</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className="group relative mx-2 mb-0.5"
            >
              <button
                onClick={() => onSelect(conv.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg transition-all"
                style={{
                  background: activeConvId === conv.id ? "#d4a01722" : "transparent",
                  borderLeft: activeConvId === conv.id ? "2px solid #d4a017" : "2px solid transparent",
                }}
              >
                <p className={`text-xs font-medium truncate mb-0.5 ${
                  activeConvId === conv.id ? "text-white" : "text-neutral-300"
                }`}>
                  {conv.title}
                </p>
                {conv.preview && (
                  <p className="text-xs text-neutral-600 truncate">{conv.preview}</p>
                )}
              </button>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this conversation?")) onDelete(conv.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-neutral-800 text-neutral-500 hover:text-red-400 hover:bg-red-950/50 items-center justify-center text-xs transition-all hidden group-hover:flex"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-t border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white flex-none">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-neutral-500 truncate font-mono">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}