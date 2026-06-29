"use client";
import { useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import UserMenu from "@/components/auth/UserMenu";
import SearchBar from "@/components/courses/SearchBar";

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

const DEPT_TABS = ["All", "CSE", "EEE", "BBA", "External"];

export default function Navbar({ user }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeDept, setActiveDept] = useState("All");

  const handleDept = (dept: string) => {
    setActiveDept(dept);
    const params = new URLSearchParams();
    if (dept !== "All") params.set("dept", dept);
    router.replace(`/dashboard?${params.toString()}`);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Logo */}
        <div
          className="font-mono font-bold text-lg tracking-widest cursor-pointer flex-none"
          onClick={() => router.push("/dashboard")}
        >
          <span style={{ color: "#d4a017" }}>BRACU</span>
          <span className="text-white">STREAM</span>
        </div>

        {/* Dept tabs */}
        <div className="flex gap-1 flex-1 overflow-x-auto scrollbar-hide">
          {DEPT_TABS.map((dept) => (
            <button
              key={dept}
              onClick={() => handleDept(dept)}
              className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: activeDept === dept ? "#d4a017" : "transparent",
                color: activeDept === dept ? "#000" : "#888",
              }}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search + User */}
        <div className="flex items-center gap-3 flex-none">
          <Suspense fallback={<div className="w-48 h-8 bg-neutral-800 rounded-lg" />}>
            <SearchBar />
          </Suspense>
          {user.role === "admin" && (
            <button
              onClick={() => router.push("/admin")}
              className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg font-mono hover:bg-amber-500/30 transition-colors"
            >
              Admin
            </button>
          )}
          <UserMenu user={user} />
        </div>
      </div>
    </nav>
  );
}