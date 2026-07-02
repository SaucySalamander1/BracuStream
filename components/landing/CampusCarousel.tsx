"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const IMAGES = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/BRAC_University_campus%2C_Dhaka%2C_Bangladesh_%282024%29.jpg/1280px-BRAC_University_campus%2C_Dhaka%2C_Bangladesh_%282024%29.jpg",
    caption: "BRAC University Main Campus, Merul Badda, Dhaka",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/BRAC_University_campus_in_Dhaka%2C_Bangladesh_%282024%29.jpg/1280px-BRAC_University_campus_in_Dhaka%2C_Bangladesh_%282024%29.jpg",
    caption: "BRACU — Bangladesh's first sustainable city campus",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/BRAC_University_campus_%282024%29.jpg/1280px-BRAC_University_campus_%282024%29.jpg",
    caption: "Designed by WOHA Designs — 14 floors, 105 labs, 123 classrooms",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/BRAC_University_Biotope_Lake.jpg/1280px-BRAC_University_Biotope_Lake.jpg",
    caption: "The Biotope Lake — a unique sustainable water feature on campus",
  },
];

export default function CampusCarousel() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

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

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      {/* Label */}
      <div className="text-center mb-8">
        <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-2">
          Our Campus
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          BRAC University, Merul Badda
        </h2>
      </div>

      {/* Image container */}
      <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "16/7" }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)" }}
        />

        {/* Image */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
          <img
            src={IMAGES[current].url}
            alt={IMAGES[current].caption}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a gradient if image fails
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Fallback gradient background */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: `linear-gradient(135deg, #1a3d6b 0%, #0f0f0f 100%)`,
            }}
          />
        </div>

        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 py-4">
          <p className="text-sm text-white/80 text-center">{IMAGES[current].caption}</p>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={() => goTo((current - 1 + IMAGES.length) % IMAGES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
        >
          ‹
        </button>
        <button
          onClick={() => goTo((current + 1) % IMAGES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className="transition-all duration-300 rounded-full"
            style={{
              width:      idx === current ? "24px" : "8px",
              height:     "8px",
              background: idx === current ? "#d4a017" : "#2a2a2a",
            }}
          />
        ))}
      </div>
    </div>
  );
}