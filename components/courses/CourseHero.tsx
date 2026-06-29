"use client";
import { Course } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  course: Course;
  totalVideos?: number;
  totalFaculties?: number;
}

const WHAT_YOU_LEARN: Record<string, string[]> = {
  CSE110: ["Write programs in Python from scratch", "Understand variables, loops, and functions", "Work with lists, tuples and dictionaries", "Apply object-oriented programming basics"],
  CSE111: ["Master OOP concepts in Python", "Handle files and exceptions", "Build simple GUI applications", "Apply inheritance and polymorphism"],
  CSE220: ["Implement arrays, linked lists, stacks and queues", "Build and traverse trees and graphs", "Apply sorting and searching algorithms", "Analyze time and space complexity"],
  CSE221: ["Design algorithms using divide and conquer", "Apply greedy and dynamic programming", "Solve graph problems efficiently", "Analyze algorithm complexity"],
  CSE230: ["Understand logic and proofs", "Work with sets, relations and functions", "Apply graph theory concepts", "Solve combinatorics problems"],
  CSE250: ["Analyze DC and AC circuits", "Apply Ohm's law and Kirchhoff's laws", "Understand diodes and transistors", "Design basic electronic circuits"],
  CSE260: ["Design combinational and sequential circuits", "Apply Boolean algebra", "Build flip-flops and counters", "Understand digital system design"],
  CSE320: ["Understand data transmission techniques", "Apply error detection and correction", "Work with network protocols", "Analyze communication media"],
  CSE321: ["Understand process and thread management", "Apply CPU scheduling algorithms", "Manage memory and file systems", "Understand OS security concepts"],
  CSE330: ["Solve equations numerically", "Apply interpolation techniques", "Perform numerical integration", "Solve ODEs computationally"],
  CSE331: ["Design finite automata", "Write regular expressions", "Build context-free grammars", "Understand Turing machines"],
  CSE340: ["Understand CPU architecture and design", "Apply pipelining concepts", "Analyze memory hierarchy", "Design instruction sets"],
  CSE341: ["Program in assembly language", "Interface memory and I/O devices", "Handle interrupts", "Understand microprocessor architecture"],
  CSE350: ["Design digital circuits", "Generate and shape waveforms", "Convert between analog and digital", "Apply pulse techniques"],
  CSE360: ["Interface microprocessors with peripherals", "Apply serial and parallel communication", "Work with sensors and actuators", "Design embedded systems"],
  CSE370: ["Design relational databases", "Write complex SQL queries", "Apply normalization techniques", "Understand transactions and indexing"],
  CSE400: ["Design a complete software or hardware system", "Apply engineering project management", "Present technical work professionally", "Work in a team on a real project"],
  CSE420: ["Build a lexical analyzer", "Implement parsers", "Generate intermediate code", "Apply code optimization techniques"],
  CSE421: ["Understand TCP/IP networking", "Configure routing and switching", "Apply network security concepts", "Work with wireless networks"],
  CSE422: ["Implement search algorithms", "Apply machine learning basics", "Build simple neural networks", "Understand knowledge representation"],
  CSE423: ["Apply 2D and 3D transformations", "Implement rendering techniques", "Work with texture mapping", "Create basic animations"],
  CSE460: ["Design CMOS circuits", "Simulate digital logic", "Create VLSI layouts", "Verify and test chip designs"],
  CSE461: ["Understand robot kinematics", "Work with sensors and actuators", "Apply path planning algorithms", "Program autonomous robots"],
  CSE470: ["Apply software development lifecycle", "Use design patterns", "Manage software projects with Agile", "Write requirements and test plans"],
  CSE471: ["Analyze system requirements", "Create UML diagrams", "Apply system design methodologies", "Document software systems"],
};

export default function CourseHero({ course, totalVideos = 0, totalFaculties = 0 }: Props) {
  const router = useRouter();
  const whatYouLearn = course.code ? WHAT_YOU_LEARN[course.code] ?? [] : [];

  return (
    <div>
      {/* Hero banner */}
      <div
        className="relative w-full px-6 py-12"
        style={{
          background: `linear-gradient(135deg, ${course.accentColor}99 0%, #0f0f0f 80%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 50%, #0f0f0f 100%)" }}
        />
        <div className="relative z-10 max-w-4xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm mb-6 transition-colors"
          >
            ← Back to browse
          </button>

          <div className="flex items-center gap-2 mb-3">
            {course.type === "bracu" ? (
              <span className="text-xs bg-amber-500 text-black font-bold px-2 py-1 rounded font-mono">
                {course.code}
              </span>
            ) : (
              <span className="text-xs bg-blue-600 text-white font-bold px-2 py-1 rounded">
                {course.category}
              </span>
            )}
            {course.labCourse && (
              <span className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded">
                🧪 Lab Course
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">{course.title}</h1>

          <div className="flex items-center gap-3 text-sm text-neutral-400 mb-4 flex-wrap">
            {course.type === "bracu" ? (
              <>
                <span>{course.credits} credits</span>
                <span>·</span>
                <span>{course.semester}</span>
                <span>·</span>
                <span>{course.department}</span>
              </>
            ) : (
              <>
                <span>{course.provider}</span>
                <span>·</span>
                <span>{course.level}</span>
              </>
            )}
            {totalFaculties > 0 && (
              <>
                <span>·</span>
                <span className="text-amber-400">{totalFaculties} {totalFaculties === 1 ? "faculty" : "faculties"}</span>
              </>
            )}
            {totalVideos > 0 && (
              <>
                <span>·</span>
                <span className="text-amber-400">{totalVideos} lectures</span>
              </>
            )}
          </div>

          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mb-5">
            {course.description}
          </p>

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs text-neutral-500">Prerequisites:</span>
              {course.prerequisites.map((p) => (
                <span key={p} className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded font-mono border border-neutral-700">
                  {p}
                </span>
              ))}
            </div>
          )}

          {course.tags && course.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {course.tags.map((tag) => (
                <span key={tag} className="text-xs bg-neutral-800/50 text-neutral-500 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* What you'll learn */}
      {whatYouLearn.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-8 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white mb-4">What you'll learn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whatYouLearn.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-amber-400 mt-0.5 flex-none">✓</span>
                <span className="text-sm text-neutral-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}