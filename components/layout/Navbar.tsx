"use client";
import { useState, Suspense, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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

const DEPARTMENTS = [
  { label: "All Courses",  value: "All",      icon: "📚" },
  { label: "CSE",          value: "CSE",       icon: "💻" },
  { label: "EEE",          value: "EEE",       icon: "⚡" },
  { label: "BBA",          value: "BBA",       icon: "📊" },
  { label: "Mathematics",  value: "MAT",       icon: "📐" },
  { label: "Physics",      value: "PHY",       icon: "🔭" },
  { label: "External",     value: "External",  icon: "🌐" },
];

const NAV_LINKS = [
  { label: "Browse",    href: "/dashboard" },
  { label: "Research",  href: "/research"  },
];

export default function Navbar({ user }: Props) {
  const router                  = useRouter();
  const [deptOpen, setDeptOpen] = useState(false);
  const [activeDept, setActiveDept] = useState("All");
  const dropdownRef             = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDeptOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDept = (value: string) => {
    setActiveDept(value);
    setDeptOpen(false);
    const params = new URLSearchParams();
    if (value !== "All") params.set("dept", value);
    router.replace(`/dashboard?${params.toString()}`);
  };

  const activeDeptLabel = DEPARTMENTS.find((d) => d.value === activeDept)?.label ?? "Departments";

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md">
      <div className="flex items-center gap-3 px-6 py-3">

        {/* Logo */}
        <div
          className="font-mono font-bold text-lg tracking-widest cursor-pointer flex-none"
          onClick={() => router.push("/dashboard")}
        >
          <span style={{ color: "#d4a017" }}>BRACU</span>
          <span className="text-white">STREAM</span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-neutral-800 flex-none" />

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-none">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-all"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Departments dropdown */}
        <div className="relative flex-none" ref={dropdownRef}>
          <button
            onClick={() => setDeptOpen(!deptOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border"
            style={{
              background:  deptOpen ? "#d4a01722" : "transparent",
              borderColor: deptOpen ? "#d4a01744" : "transparent",
              color:       activeDept !== "All" ? "#d4a017" : "#aaa",
            }}
          >
            <span>{activeDept !== "All" ? DEPARTMENTS.find(d => d.value === activeDept)?.icon : "🏛"}</span>
            <span>{activeDeptLabel}</span>
            <svg
              className="w-3.5 h-3.5 transition-transform"
              style={{ transform: deptOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {deptOpen && (
            <div className="absolute top-full left-0 mt-2 w-52 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-1.5">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.value}
                    onClick={() => handleDept(dept.value)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
                    style={{
                      background: activeDept === dept.value ? "#d4a01722" : "transparent",
                      color:      activeDept === dept.value ? "#d4a017"   : "#aaa",
                    }}
                  >
                    <span className="text-base">{dept.icon}</span>
                    <span className="font-medium">{dept.label}</span>
                    {activeDept === dept.value && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-3 flex-none">
          <Suspense fallback={<div className="w-40 h-8 bg-neutral-800 rounded-lg animate-pulse" />}>
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