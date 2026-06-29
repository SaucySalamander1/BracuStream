import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllCourses } from "@/lib/courses";
import Navbar from "@/components/layout/Navbar";
import HeroBanner from "@/components/courses/HeroBanner";
import CourseRow from "@/components/courses/CourseRow";
import CourseCard from "@/components/courses/CourseCard";

interface Props {
  searchParams: Promise<{ q?: string; dept?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  if (session.user.role === "admin") redirect("/admin");

  const { q, dept } = await searchParams;
  const allCourses = await getAllCourses();

  // ── Filter ────────────────────────────────────────────────
  const filtered = allCourses.filter((c) => {
    const matchDept =
      !dept ||
      dept === "All" ||
      (dept === "External" ? c.type === "external" : c.department === dept);
    const matchSearch =
      !q ||
      c.title.toLowerCase().includes(q.toLowerCase()) ||
      c.code?.toLowerCase().includes(q.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(q.toLowerCase()));
    return matchDept && matchSearch;
  });

  // ── Rows ──────────────────────────────────────────────────
  const featured  = allCourses.find((c) => c.code === "CSE470") ?? allCourses[0];
  const topRated  = [...allCourses].sort((a, b) => b.rating - a.rating).slice(0, 10);
  const cse       = filtered.filter((c) => c.department === "CSE");
  const external  = filtered.filter((c) => c.type === "external");
  const lab       = filtered.filter((c) => c.labCourse);

  const isSearching = !!q || (!!dept && dept !== "All");

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar user={session.user} />

      {/* Hero — only on default view */}
      {!isSearching && featured && <HeroBanner course={featured} />}

      <div className="pb-16">
        {isSearching ? (
          /* Search / filter results */
          <div className="px-6 pt-6">
            <p className="text-sm text-neutral-500 mb-6">
              {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
              {q && (
                <span>
                  {" "}for{" "}
                  <span className="text-amber-400">"{q}"</span>
                </span>
              )}
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-neutral-400 text-sm">No courses found</p>
                <p className="text-neutral-600 text-xs mt-2">
                  Try a different keyword or department
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {filtered.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default browse view */
          <>
            <CourseRow title="⭐ Top Rated" courses={topRated} />
            <CourseRow title="CSE Department" courses={cse} />
            {lab.length > 0 && (
              <CourseRow title="🧪 Lab Courses" courses={lab} />
            )}
            {external.length > 0 && (
              <CourseRow title="🌐 External Courses" courses={external} />
            )}
          </>
        )}
      </div>
    </div>
  );
}