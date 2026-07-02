"use client";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Course } from "@/types";
import { useState, useEffect } from "react";
import CampusCarousel from "./CampusCarousel";

interface Props {
  courses: Course[];
}

const FEATURES = [
  {
    icon: "▶",
    title: "Real Lecture Videos",
    desc: "Watch actual BRACU faculty lectures embedded directly — no redirects to YouTube.",
    color: "#3b82f6",
  },
  {
    icon: "📚",
    title: "Week-by-Week Modules",
    desc: "Every course is structured by week — videos, slides, notes, assignments all in one place.",
    color: "#d4a017",
  },
  {
    icon: "📄",
    title: "All Course Materials",
    desc: "Slides, notes, lab sheets, past papers — view everything securely in-browser.",
    color: "#10b981",
  },
  {
    icon: "🔬",
    title: "Research Hub",
    desc: "AI-powered research assistant, PDF chat, citation generator and more. Coming soon.",
    color: "#8b5cf6",
  },
  {
    icon: "🎓",
    title: "26 CSE Courses",
    desc: "Every BRACU CSE course in one place with multiple faculty playlists per course.",
    color: "#ef4444",
  },
  {
    icon: "🔒",
    title: "BRACU Only Access",
    desc: "Sign in with your @g.bracu.ac.bd Google account. Your academic platform, secured.",
    color: "#06b6d4",
  },
];

const STATS = [
  { value: "26+", label: "CSE Courses" },
  { value: "443+", label: "Lecture Videos" },
  { value: "7", label: "Material Types" },
  { value: "100%", label: "Free for BRACU" },
];

export default function LandingPage({ courses }: Props) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(10,10,10,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-mono font-bold text-xl tracking-widest">
            <span style={{ color: "#d4a017" }}>BRACU</span>
            <span className="text-white">STREAM</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/courses")}
              className="text-sm text-neutral-400 hover:text-white transition-colors hidden sm:block"
            >
              Browse Courses
            </button>
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="text-sm font-semibold px-5 py-2 rounded-xl transition-all"
              style={{ background: "#d4a017", color: "#000" }}
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient orbs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,160,23,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 20% 60%, rgba(139,92,246,0.08) 0%, transparent 50%)",
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-full px-4 py-2 text-xs text-neutral-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Exclusively for BRACU Students
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Your BRACU</span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #d4a017 0%, #f5c842 50%, #d4a017 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Learning Hub
            </span>
          </h1>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            All your BRACU course lectures, slides, notes, assignments and past papers —
            organized week by week, in one beautiful platform.
          </p>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base text-black transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #d4a017, #f5c842)",
                boxShadow: "0 0 30px rgba(212,160,23,0.3)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Get Started with BRACU
            </button>
            <button
              onClick={() => router.push("/courses")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base text-white border border-neutral-700 hover:border-neutral-500 transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              Browse Courses →
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: "#d4a017" }}
                >
                  {s.value}
                </div>
                <div className="text-xs text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-600 animate-bounce">
          <span className="text-xs">Scroll</span>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Campus Carousel ── */}
      <section className="py-16 relative">
        <CampusCarousel />
      </section>

      {/* ── Course Preview ── */}
      <section className="py-24 px-6 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(212,160,23,0.04) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3 font-mono">
              Course Library
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Every BRACU CSE Course
            </h2>
            <p className="text-neutral-400 text-base max-w-xl mx-auto">
              Browse all 26 courses with real faculty playlists, weekly modules and materials.
            </p>
          </div>

          {/* Course grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
            {courses.map((course) => (
              <div
                key={course.id}
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                onClick={() => router.push(`/courses/${course.id}`)}
                className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                style={{
                  transform: hoveredCourse === course.id ? "scale(1.03)" : "scale(1)",
                  boxShadow: hoveredCourse === course.id
                    ? `0 20px 40px ${course.accentColor}33`
                    : "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                {/* Card thumbnail */}
                <div
                  className="h-28 flex flex-col justify-end p-3"
                  style={{
                    background: `linear-gradient(135deg, ${course.accentColor}dd 0%, ${course.accentColor}44 100%)`,
                  }}
                >
                  <div className="absolute top-3 right-3">
                    <span className="text-xs font-bold font-mono bg-black/40 text-white px-2 py-0.5 rounded">
                      {course.code}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-mono">{course.department}</p>
                  <p className="text-sm font-semibold text-white leading-tight line-clamp-2">
                    {course.title}
                  </p>
                </div>
                {/* Card footer */}
                <div className="bg-neutral-900 border border-neutral-800 border-t-0 rounded-b-2xl px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">{course.credits} credits</span>
                    {course.labCourse && (
                      <span className="text-xs bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">Lab</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push("/courses")}
              className="px-8 py-3 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 text-sm font-medium transition-all"
            >
              View all 26 courses →
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3 font-mono">
              Why BRACUStream
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything in one place
            </h2>
            <p className="text-neutral-400 text-base max-w-xl mx-auto">
              No more hunting through WhatsApp groups and Google Drive links.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="relative p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-all group"
                style={{ backdropFilter: "blur(10px)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
                  style={{ background: `${f.color}22`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${f.color}08 0%, transparent 60%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Research Hub teaser ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-purple-950/50 border border-purple-800/50 rounded-full px-4 py-2 text-xs text-purple-400 mb-8">
            <span>🔬</span> Coming Soon
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Research Hub
          </h2>
          <p className="text-neutral-400 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            AI-powered research assistant, PDF chat, citation generator, literature review tools — all built for BRACU students doing thesis and academic research.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: "🤖", label: "AI Research Assistant" },
              { icon: "📑", label: "PDF Chat" },
              { icon: "📖", label: "Citation Generator" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm text-neutral-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(212,160,23,0.12) 0%, transparent 60%)",
          }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to learn smarter?
          </h2>
          <p className="text-neutral-400 text-base mb-10">
            Sign in with your BRACU Google account and get instant access to everything.
          </p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-black transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #d4a017, #f5c842)",
              boxShadow: "0 0 40px rgba(212,160,23,0.4)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Get Started Free
          </button>
          <p className="text-neutral-600 text-xs mt-6">
            Only @g.bracu.ac.bd accounts · 100% free · No credit card
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-900 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="font-mono font-bold text-sm tracking-widest">
            <span style={{ color: "#d4a017" }}>BRACU</span>
            <span className="text-neutral-600">STREAM</span>
          </div>
          <p className="text-xs text-neutral-700">
            © {new Date().getFullYear()} BRACUStream — Made for BRACU students
          </p>
        </div>
      </footer>
    </div>
  );
}