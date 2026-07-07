"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Course } from "@/types";

interface Props {
  courses: Course[];
  isLoggedIn: boolean;
}

const DEPT_FILTERS = ["All", "CSE", "EEE", "BBA", "External"];

export default function PublicCourseBrowse({ courses, isLoggedIn }: Props) {
  const router = useRouter();
  const [search, setSearch]   = useState("");
  const [dept, setDept]       = useState("All");
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = courses.filter((c) => {
    const matchDept =
      dept === "All" ||
      (dept === "External" ? c.type === "external" : c.department === dept);
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  const handleCourseClick = (course: Course) => {
    router.push(`/courses/${course.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div
            className="font-mono font-bold text-lg tracking-widest cursor-pointer flex-none"
            onClick={() => router.push("/")}
          >
            <span style={{ color: "#d4a017" }}>BRACU</span>
            <span className="text-white">STREAM</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {isLoggedIn ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm font-semibold px-5 py-2 rounded-xl text-black flex-none"
              style={{ background: "#d4a017" }}
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="text-sm font-semibold px-5 py-2 rounded-xl text-black flex-none"
              style={{ background: "#d4a017" }}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Course Library</h1>
          <p className="text-neutral-400 text-sm">
            {courses.length} courses available · Sign in with your BRACU account to access content
          </p>
        </div>

        {/* Dept filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {DEPT_FILTERS.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
              style={{
                background:  dept === d ? "#d4a01722" : "#1a1a1a",
                borderColor: dept === d ? "#d4a017"   : "#2a2a2a",
                color:       dept === d ? "#d4a017"   : "#888",
              }}
            >
              {d}
            </button>
          ))}
          <span className="ml-auto text-xs text-neutral-600 self-center">
            {filtered.length} courses
          </span>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              onMouseEnter={() => setHovered(course.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleCourseClick(course)}
              className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group"
              style={{
                transform:  hovered === course.id ? "scale(1.04)" : "scale(1)",
                boxShadow:  hovered === course.id
                  ? `0 16px 32px ${course.accentColor}33`
                  : "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {/* Thumbnail */}
              <div
                className="h-28 flex flex-col justify-end p-3 relative"
                style={{
                  background: `linear-gradient(135deg, ${course.accentColor}dd 0%, ${course.accentColor}55 100%)`,
                }}
              >
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-xs font-bold font-mono bg-black/40 text-white px-2 py-0.5 rounded">
                    {course.code ?? course.category}
                  </span>
                </div>
                {course.labCourse && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-xs bg-green-900/80 text-green-300 px-1.5 py-0.5 rounded">Lab</span>
                  </div>
                )}
                <p className="text-xs text-white/50 font-mono mb-0.5">{course.department}</p>
                <p className="text-sm font-semibold text-white leading-tight line-clamp-2">{course.title}</p>
              </div>

              {/* Footer */}
              <div className="bg-neutral-900 border border-neutral-800 border-t-0 px-3 py-2.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-500">
                    {course.type === "bracu"
                      ? `${course.credits} credits`
                      : course.level}
                  </span>
                </div>

                {/* Lock overlay on hover */}
                {!isLoggedIn && (
                  <div
                    className="text-xs text-center py-1 rounded-lg transition-all"
                    style={{
                      background: hovered === course.id ? "#d4a01722" : "transparent",
                      color:      hovered === course.id ? "#d4a017"   : "transparent",
                    }}
                  >
                    Sign in to access →
                  </div>
                )}
              </div>

              {/* Lock icon on hover for non-logged in */}
              {!isLoggedIn && hovered === course.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2"
                    style={{ marginTop: "-20px" }}
                  >
                    <span className="text-sm">🔒</span>
                    <span className="text-xs text-white font-medium">Login required</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-neutral-400 text-sm">No courses found</p>
          </div>
        )}

        {/* Bottom CTA for non-logged in */}
        {!isLoggedIn && (
          <div
            className="mt-16 rounded-2xl p-8 text-center border border-neutral-800"
            style={{
              background: "radial-gradient(ellipse at center, rgba(212,160,23,0.06) 0%, transparent 70%)",
            }}
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Ready to start learning?
            </h3>
            <p className="text-neutral-400 text-sm mb-6">
              Sign in with your @g.bracu.ac.bd account to access all course content.
            </p>
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="inline-flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #d4a017, #f5c842)" }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Sign in with BRACU Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}