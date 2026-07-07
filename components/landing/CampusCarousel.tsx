"use client";
import { useState, useEffect } from "react";

const IMAGES = [
  {
    url: "https://images.ctfassets.net/189dvqdsjh46/6VApk3dCVbRuSN3P4gjWBl/8c3a8c1a5c8e8b2c8e8b2c8e/brac-university-campus.jpg",
    caption: "BRAC University Main Campus, Merul Badda, Dhaka",
    fallback: "#1a3d6b",
  },
  {
    url: "https://www.bracu.ac.bd/sites/default/files/2024-03/campus-exterior.jpg",
    caption: "BRACU — Bangladesh's first sustainable city campus",
    fallback: "#1a6b3c",
  },
  {
    url: "https://www.bracu.ac.bd/sites/default/files/2024-03/campus-interior.jpg",
    caption: "Designed by WOHA — 14 floors, 105 labs, 123 classrooms",
    fallback: "#6b1a3d",
  },
  {
    url: "https://www.bracu.ac.bd/sites/default/files/2024-03/biotope-lake.jpg",
    caption: "The Biotope Lake — sustainable water feature on campus",
    fallback: "#1a6b5a",
  },
];

const CAMPUS_INFO = [
  { icon: "🏛", label: "14 Floors" },
  { icon: "🧪", label: "105 Labs" },
  { icon: "📚", label: "123 Classrooms" },
  { icon: "🌿", label: "Eco Campus" },
];

export default function CampusCarousel() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % IMAGES.length);
        setTransitioning(false);
      }, 500);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx: number) => {
    if (idx === current) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 300);
  };

  const handleImgError = (idx: number) => {
    setImgErrors((prev) => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-3">
          Our Campus
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          BRAC University, Merul Badda
        </h2>
        <p className="text-sm text-neutral-500">
          Kha 224 Pragati Sarani, Merul Badda, Dhaka 1212
        </p>
      </div>

      {/* Campus info pills */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {CAMPUS_INFO.map((info) => (
          <div
            key={info.label}
            className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 text-xs text-neutral-400"
          >
            <span>{info.icon}</span>
            <span>{info.label}</span>
          </div>
        ))}
      </div>

      {/* Carousel */}
      <div
        className="relative rounded-2xl overflow-hidden border border-neutral-800"
        style={{ aspectRatio: "16/7" }}
      >
        {/* Dark overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Slides */}
        {IMAGES.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: idx === current && !transitioning ? 1 : 0 }}
          >
            {!imgErrors[idx] ? (
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full object-cover"
                onError={() => handleImgError(idx)}
              />
            ) : null}
            {/* Always show gradient fallback behind image */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${img.fallback}cc 0%, #0f0f0f 100%)`,
                zIndex: imgErrors[idx] ? 1 : -1,
              }}
            >
              {/* Show campus text if image fails */}
              {imgErrors[idx] && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="text-6xl opacity-30">🏛</div>
                  <p className="text-white/40 text-sm font-mono">BRAC University</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 py-5">
          <p className="text-sm text-white/90 text-center font-medium">
            {IMAGES[current].caption}
          </p>
        </div>

        {/* Arrows */}
        <button
          onClick={() => goTo((current - 1 + IMAGES.length) % IMAGES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10 text-lg"
        >
          ‹
        </button>
        <button
          onClick={() => goTo((current + 1) % IMAGES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10 text-lg"
        >
          ›
        </button>

        {/* Slide counter */}
        <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/70 font-mono">
          {current + 1} / {IMAGES.length}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className="transition-all duration-300 rounded-full"
            style={{
              width:      idx === current ? "28px" : "8px",
              height:     "8px",
              background: idx === current ? "#d4a017" : "#2a2a2a",
            }}
          />
        ))}
      </div>
    </div>
  );
}