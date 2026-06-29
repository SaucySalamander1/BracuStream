import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import https from "https";

dotenv.config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const YT_API_KEY = process.env.YOUTUBE_API_KEY!;

// ── Fetch playlist items from YouTube API ─────────────────────
function fetchPlaylist(playlistId: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YT_API_KEY}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.error) { reject(json.error); return; }
          resolve(json.items || []);
        } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

// ── Extract playlist ID from URL ──────────────────────────────
function getPlaylistId(url: string): string {
  const match = url.match(/[?&]list=([^&]+)/);
  return match ? match[1] : "";
}

// ── Format duration (YouTube gives ISO 8601, we store mm:ss) ──
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── All 26 CSE courses ────────────────────────────────────────
const COURSES = [
  { id:"cse110", code:"CSE110", title:"Programming Language I",           credits:3, labCourse:false, description:"Introduction to programming using Python. Covers variables, data types, loops, functions, lists, tuples, dictionaries and OOP basics.", prerequisites:[], tags:["programming","python","beginner"] },
  { id:"cse111", code:"CSE111", title:"Programming Language II",          credits:3, labCourse:false, description:"Object-oriented programming using Python. Covers inheritance, polymorphism, file handling, exception handling and GUI basics.", prerequisites:["CSE110"], tags:["programming","python","oop"] },
  { id:"cse220", code:"CSE220", title:"Data Structure",                   credits:3, labCourse:false, description:"Arrays, linked lists, stacks, queues, trees, heaps, graphs and their algorithms. Sorting and searching techniques.", prerequisites:["CSE110","CSE111"], tags:["data structures","algorithms"] },
  { id:"cse221", code:"CSE221", title:"Algorithm Analysis & Design",      credits:3, labCourse:false, description:"Algorithm design techniques including divide and conquer, greedy, dynamic programming, backtracking and graph algorithms.", prerequisites:["CSE220"], tags:["algorithms","complexity"] },
  { id:"cse230", code:"CSE230", title:"Discrete Mathematics",             credits:3, labCourse:false, description:"Logic, sets, relations, functions, graph theory, combinatorics and probability for computer science.", prerequisites:[], tags:["math","logic","graph theory"] },
  { id:"cse250", code:"CSE250", title:"Circuits and Electronics",         credits:3, labCourse:true,  description:"Basic circuit theory, Ohm's law, Kirchhoff's laws, AC and DC circuits, diodes and transistors.", prerequisites:[], tags:["circuits","electronics","hardware"] },
  { id:"cse251", code:"CSE251", title:"Electronic Devices and Circuits",  credits:3, labCourse:true,  description:"Semiconductor devices, BJT, FET, amplifiers, oscillators and electronic circuit design.", prerequisites:["CSE250"], tags:["electronics","devices"] },
  { id:"cse260", code:"CSE260", title:"Digital Logic Design",             credits:3, labCourse:true,  description:"Boolean algebra, logic gates, combinational and sequential circuits, flip-flops, counters and registers.", prerequisites:[], tags:["digital","logic","hardware"] },
  { id:"cse320", code:"CSE320", title:"Data Communications",              credits:3, labCourse:false, description:"Data transmission, encoding, multiplexing, error detection, network protocols and communication media.", prerequisites:["CSE260"], tags:["networking","communication"] },
  { id:"cse321", code:"CSE321", title:"Operating Systems",                credits:3, labCourse:false, description:"Process management, CPU scheduling, memory management, file systems, I/O management and security.", prerequisites:["CSE220"], tags:["os","systems"] },
  { id:"cse330", code:"CSE330", title:"Numerical Methods",                credits:3, labCourse:false, description:"Numerical solutions of equations, interpolation, numerical integration and differentiation, ODEs using computational methods.", prerequisites:["CSE110"], tags:["math","numerical","computation"] },
  { id:"cse331", code:"CSE331", title:"Automata and Computability",       credits:3, labCourse:false, description:"Finite automata, regular expressions, context-free grammars, pushdown automata, Turing machines and complexity theory.", prerequisites:["CSE230"], tags:["theory","automata","computability"] },
  { id:"cse340", code:"CSE340", title:"Computer Architecture",            credits:3, labCourse:false, description:"CPU design, instruction sets, memory hierarchy, pipelining, parallel processing and I/O systems.", prerequisites:["CSE260"], tags:["architecture","hardware","cpu"] },
  { id:"cse341", code:"CSE341", title:"Microprocessors",                  credits:3, labCourse:true,  description:"Microprocessor architecture, assembly language programming, interrupts, memory and I/O interfacing.", prerequisites:["CSE340"], tags:["microprocessor","assembly","hardware"] },
  { id:"cse350", code:"CSE350", title:"Digital Electronics and Pulse Techniques", credits:3, labCourse:true, description:"Digital circuits, pulse shaping, waveform generation, A/D and D/A conversion techniques.", prerequisites:["CSE260"], tags:["digital","electronics","pulse"] },
  { id:"cse360", code:"CSE360", title:"Computer Interfacing",             credits:3, labCourse:true,  description:"Interfacing microprocessors with peripheral devices, serial and parallel communication, sensors and actuators.", prerequisites:["CSE341"], tags:["interfacing","hardware","sensors"] },
  { id:"cse370", code:"CSE370", title:"Database",                         credits:3, labCourse:false, description:"Relational database design, SQL, normalization, transactions, indexing, query optimization and NoSQL databases.", prerequisites:["CSE220"], tags:["database","sql","nosql"] },
  { id:"cse400", code:"CSE400", title:"Final Year Design Project",        credits:6, labCourse:false, description:"Capstone project where students design, implement and present a complete software or hardware system.", prerequisites:[], tags:["project","capstone"] },
  { id:"cse420", code:"CSE420", title:"Compiler Design",                  credits:3, labCourse:false, description:"Lexical analysis, parsing, semantic analysis, intermediate code generation, optimization and code generation.", prerequisites:["CSE331"], tags:["compiler","languages","theory"] },
  { id:"cse421", code:"CSE421", title:"Computer Networks",                credits:3, labCourse:false, description:"Network architecture, TCP/IP, routing, switching, network security, wireless networks and application layer protocols.", prerequisites:["CSE320"], tags:["networks","tcp/ip","security"] },
  { id:"cse422", code:"CSE422", title:"Artificial Intelligence",          credits:3, labCourse:false, description:"Search algorithms, knowledge representation, expert systems, machine learning, neural networks and natural language processing.", prerequisites:["CSE221"], tags:["ai","machine learning","neural networks"] },
  { id:"cse423", code:"CSE423", title:"Computer Graphics",                credits:3, labCourse:false, description:"2D and 3D graphics, transformations, clipping, rendering, shading, texture mapping and animation.", prerequisites:["CSE221"], tags:["graphics","rendering","3d"] },
  { id:"cse460", code:"CSE460", title:"VLSI Design",                      credits:3, labCourse:true,  description:"CMOS technology, logic design, circuit simulation, layout design, testing and verification of VLSI circuits.", prerequisites:["CSE350"], tags:["vlsi","chip design","hardware"] },
  { id:"cse461", code:"CSE461", title:"Introduction to Robotics",         credits:3, labCourse:true,  description:"Robot kinematics, sensors, actuators, control systems, path planning and programming autonomous robots.", prerequisites:["CSE341"], tags:["robotics","sensors","control"] },
  { id:"cse470", code:"CSE470", title:"Software Engineering",             credits:3, labCourse:false, description:"Software development lifecycle, requirements engineering, design patterns, testing, project management and agile methodologies.", prerequisites:["CSE220"], tags:["software engineering","agile","design patterns"] },
  { id:"cse471", code:"CSE471", title:"System Analysis and Design",       credits:3, labCourse:false, description:"Systems thinking, requirements analysis, UML modeling, system design methodologies and project documentation.", prerequisites:["CSE370"], tags:["system design","uml","analysis"] },
];

// ── Playlists with real YouTube links ─────────────────────────
const PLAYLISTS: Record<string, { label: string; url: string }[]> = {
  cse110: [
    { label:"Faculty 1", url:"https://www.youtube.com/playlist?list=PLLkaPhRBVqfIdKjIv82AIuitXQIX92UXR" },
    { label:"Faculty 2", url:"https://www.youtube.com/playlist?list=PLNjWIgFDvJno4Ggf3uitYCOr7oO8mTIL4" },
  ],
  cse111: [
    { label:"Faculty 1", url:"https://www.youtube.com/playlist?list=PLR0j6NckpKjyNO579D4P4qCGBSlY8Ous5" },
    { label:"Faculty 2", url:"https://www.youtube.com/playlist?list=PLkqsZdV3LRJTuZRThm0UzJzCcytnQmyRY" },
  ],
  cse220: [
    { label:"Faculty 1", url:"https://www.youtube.com/playlist?list=PLBJgv5EOl28KRGTJHjREcFM9z0p5Ewxis" },
    { label:"Faculty 2", url:"https://www.youtube.com/playlist?list=PLYv5ovgT8QC79CTFkvdHo7ZTcM0ZJ3ALA" },
    { label:"Faculty 3", url:"https://www.youtube.com/playlist?list=PL7oKIPF7ZnjbOmZ1JWCE0xnqH-gUmCV9u" },
  ],
  cse221: [
    { label:"Faculty 1", url:"https://www.youtube.com/playlist?list=PLYv5ovgT8QC4r4TOgWCE-Ps-LXiLZGz3J" },
    { label:"Faculty 2", url:"https://www.youtube.com/playlist?list=PLFPKdFlHwv3_jLHLO_nlfawkzuvwDCdLO" },
    { label:"Faculty 3", url:"https://www.youtube.com/playlist?list=PL7oKIPF7ZnjbGNJFAb5b8Mz7bMgNaA2Tr" },
    { label:"Faculty 4", url:"https://www.youtube.com/playlist?list=PLncbpxWvJ5rzmrDfJtYC5GFCSixYg00bt" },
  ],
  cse360: [
    { label:"Faculty 1", url:"https://www.youtube.com/playlist?list=PLL6TRCyswkrs0h9IzTZrIZUzJZEmQ_nHN" },
    { label:"Faculty 2", url:"https://www.youtube.com/playlist?list=PL8I0kbow2q8HgpBEruOmyFA63ejc-QHaq" },
  ],
  cse460: [
    { label:"Faculty 1", url:"https://www.youtube.com/playlist?list=PLbn1ykCe23UeICjfkoruMhr3WcHWkItfa" },
    { label:"Faculty 2", url:"https://www.youtube.com/playlist?list=PLn12JjJn-4YkQy8uyNnkRrt4SiE4SvZDX" },
    { label:"Faculty 3", url:"https://www.youtube.com/playlist?list=PLWEBVLl1ZK5qz5X7mEbuVzB0f5JcUX05l" },
  ],
  cse470: [
    { label:"Faculty 1", url:"https://www.youtube.com/playlist?list=PLKsM9YbCRgQ7wBUcoFxmHEFMUxWavbsDA" },
    { label:"Faculty 2", url:"https://www.youtube.com/playlist?list=PL9aZtK5kh5Wcmeuxc1Jv8EGeakaNnxD3A" },
  ],
};

// ── Accent colors ─────────────────────────────────────────────
const COLORS: Record<string, string> = {
  cse110:"#1a6b3c", cse111:"#1a5c6b", cse220:"#1a3d6b", cse221:"#2d1a6b",
  cse230:"#6b1a5c", cse250:"#6b3d1a", cse251:"#6b1a1a", cse260:"#1a6b6b",
  cse320:"#3d6b1a", cse321:"#6b5c1a", cse330:"#1a2d6b", cse331:"#5c6b1a",
  cse340:"#6b1a3d", cse341:"#1a6b4a", cse350:"#4a1a6b", cse360:"#6b4a1a",
  cse370:"#1a4a6b", cse400:"#6b1a6b", cse420:"#2d6b1a", cse421:"#6b2d1a",
  cse422:"#1a6b2d", cse423:"#6b6b1a", cse460:"#1a1a6b", cse461:"#6b1a4a",
  cse470:"#4a6b1a", cse471:"#1a6b5c",
};

async function seed() {
  console.log("🌱 Seeding BRACUStream database...\n");

  for (const course of COURSES) {
    const { id, ...data } = course;
    const playlists = PLAYLISTS[id] || [];

    // ── Write course document ──────────────────────────────
    await db.collection("courses").doc(id).set({
      ...data,
      type:        "bracu",
      department:  "CSE",
      accentColor: COLORS[id] ?? "#1a3d6b",
      published:   true,
      rating:      0,
      ratingCount: 0,
      semester:    "Spring 2025",
      createdAt:   new Date(),
      updatedAt:   new Date(),
    });

    console.log(`✅ ${data.code} — ${data.title}`);

    // ── Write faculties + fetch real videos ────────────────
    if (playlists.length > 0) {
      for (let i = 0; i < playlists.length; i++) {
        const pl = playlists[i];
        const facultyId   = `faculty-${i + 1}`;
        const playlistId  = getPlaylistId(pl.url);

        // Fetch videos from YouTube
        console.log(`   📡 Fetching videos for ${pl.label}...`);
        let videos: any[] = [];
        try {
          const items = await fetchPlaylist(playlistId);
          videos = items
            .filter((item: any) => item.snippet?.resourceId?.videoId)
            .map((item: any, idx: number) => ({
              youtubeId: item.snippet.resourceId.videoId,
              title:     item.snippet.title,
              duration:  "0:00",
              order:     idx + 1,
              week:      Math.ceil((idx + 1) / 2),
              topic:     "",
              addedAt:   new Date(),
            }));
        } catch (e: any) {
          console.log(`   ⚠️  Could not fetch videos: ${e.message}`);
        }

        // Save faculty
        await db.collection("courses").doc(id)
          .collection("faculties").doc(facultyId).set({
            name:        pl.label,
            section:     `0${i + 1}`,
            playlistUrl: pl.url,
            designation: "Faculty",
            bio:         "",
            videoCount:  videos.length,
            addedAt:     new Date(),
          });

        // Save videos
        for (const video of videos) {
          await db.collection("courses").doc(id)
            .collection("faculties").doc(facultyId)
            .collection("videos").doc(`video-${video.order}`).set(video);
        }

        console.log(`   👤 ${pl.label} — ${videos.length} videos fetched`);
      }
    } else {
      console.log(`   ⏳ No playlist yet — add from admin panel later`);
    }
  }

  console.log("\n🎉 Database seeded successfully!");
  console.log("📝 Update faculty names from the admin panel.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  console.error(err.message);
  process.exit(1);
});