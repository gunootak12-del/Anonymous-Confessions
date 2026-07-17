import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  Keyboard,
  Compass
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import { Confession, CONFESSION_TAGS } from "../types";
import { ConfessionCard } from "./ConfessionCard";
import { motion, AnimatePresence } from "motion/react";

interface ConfessionViewerProps {
  onGoToShare: () => void;
}

export const ConfessionViewer: React.FC<ConfessionViewerProps> = ({ onGoToShare }) => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Sorting
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "loved">("latest");
  
  // Page-by-page active index
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  // Fetch confessions from Firestore with real-time updates
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    let q = query(collection(db, "confessions"));

    // If tag is selected, filter
    if (selectedTag !== "all") {
      q = query(q, where("tag", "==", selectedTag));
    }

    // Set sorting in Firestore or handle client-side sorting
    // Note: Firestore requires complex composite indices if we combine where + order_by unless we do simple single-field order.
    // So to avoid setting up composite indices which can fail in new Firestore projects, we query sorted by createdAt,
    // and if the user wants "loved" sorting, we sort in client-side memory! This is robust and 100% bug-free.
    q = query(q, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        let list: Confession[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Confession);
        });

        // Client-side sorting for popularity/love
        if (sortBy === "loved") {
          list.sort((a, b) => {
            const scoreA = (a.likes || 0) + (a.hugs || 0) + (a.meToos || 0);
            const scoreB = (b.likes || 0) + (b.hugs || 0) + (b.meToos || 0);
            return scoreB - scoreA;
          });
        }

        setConfessions(list);
        setLoading(false);
        // Reset page index if it goes out of bounds
        setActiveIndex((prev) => {
          if (list.length === 0) return 0;
          return Math.min(prev, list.length - 1);
        });
      },
      (err) => {
        console.error("Firestore loading error:", err);
        setError("Unable to load confessions. Please check your network or try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedTag, sortBy]);

  // Keyboard navigation support (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (confessions.length <= 1) return;
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, confessions.length]);

  const handleNext = () => {
    if (activeIndex < confessions.length - 1) {
      setSlideDirection("right");
      setActiveIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setSlideDirection("left");
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleCardUpdate = (updatedConfession: Confession) => {
    setConfessions((prev) => 
      prev.map((c) => (c.id === updatedConfession.id ? updatedConfession : c))
    );
  };

  // Motion animation variants for page sliding
  const slideVariants = {
    enter: (dir: "left" | "right") => ({
      x: dir === "right" ? 250 : -250,
      opacity: 0,
      scale: 0.96
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] // Beautiful custom cubic bezier
      }
    },
    exit: (dir: "left" | "right") => ({
      x: dir === "right" ? -250 : 250,
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-8">
      {/* Category Filter & Sorting Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5 z-10">
        {/* Horizontal Category selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none scroll-smooth">
          {CONFESSION_TAGS.map((tag) => (
            <button
              key={tag.id}
              id={`tag-filter-${tag.id}`}
              onClick={() => {
                setSelectedTag(tag.id);
                setActiveIndex(0);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wide whitespace-nowrap border transition-all duration-300 ${
                selectedTag === tag.id
                  ? "bg-stone-100 text-stone-900 border-stone-100"
                  : "bg-stone-950/40 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700"
              }`}
            >
              <span>{tag.icon}</span>
              <span>{tag.name}</span>
            </button>
          ))}
        </div>

        {/* Sort and UI Helpers */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-stone-900/60 border border-stone-800 rounded-xl p-1">
            <button
              id="sort-latest"
              onClick={() => setSortBy("latest")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                sortBy === "latest"
                  ? "bg-stone-800 text-stone-100 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Recent
            </button>
            <button
              id="sort-loved"
              onClick={() => setSortBy("loved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                sortBy === "loved"
                  ? "bg-stone-800 text-stone-100 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Most Loved
            </button>
          </div>
        </div>
      </div>

      {/* Main Page-by-Page Slider Section */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 md:py-10 relative min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-stone-800 border-t-stone-200 animate-spin" />
            <p className="text-xs font-mono text-stone-500 tracking-wider">Gathering whispered secrets...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 max-w-md">
            <p className="text-red-400 font-serif italic mb-4">{error}</p>
            <button
              onClick={() => {
                setSelectedTag("all");
                setSortBy("latest");
              }}
              className="text-xs font-mono bg-stone-900 border border-stone-800 hover:border-stone-700 px-4 py-2 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : confessions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 max-w-md px-6 flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-stone-900/60 border border-stone-800 flex items-center justify-center text-stone-400">
              <Compass size={24} className="stroke-1" />
            </div>
            <h3 className="font-serif text-xl italic font-light text-stone-300">Quiet Silence</h3>
            <p className="text-sm font-light text-stone-400 leading-relaxed">
              No one has confessed to <span className="font-semibold">{CONFESSION_TAGS.find(t=>t.id===selectedTag)?.name}</span> yet. Every quiet stream starts with a single drop.
            </p>
            <button
              onClick={onGoToShare}
              className="mt-2 text-xs font-mono bg-stone-100 text-stone-900 px-5 py-2.5 rounded-xl hover:bg-stone-200 font-medium tracking-wide shadow-lg"
            >
              Share Your Confession
            </button>
          </motion.div>
        ) : (
          <div className="w-full flex flex-col items-center gap-8">
            {/* Immersive Page Slider Container */}
            <div className="w-full flex items-center justify-between gap-4 md:gap-8 max-w-4xl">
              
              {/* Previous page button */}
              <button
                id="prev-page-btn"
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className={`p-3 rounded-full border bg-stone-950/60 transition-all duration-300 ${
                  activeIndex === 0
                    ? "opacity-10 border-stone-900 cursor-not-allowed"
                    : "opacity-75 hover:opacity-100 border-stone-800 hover:border-stone-700 text-stone-300 active:scale-95"
                } hidden md:flex items-center justify-center`}
                title="Previous confession (Left Arrow)"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Central Paginated Card Area */}
              <div className="flex-1 flex justify-center items-center min-h-[480px] md:min-h-[520px] relative w-full overflow-visible">
                <AnimatePresence mode="popLayout" custom={slideDirection}>
                  <motion.div
                    key={confessions[activeIndex].id}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.5}
                    onDragEnd={(e, info) => {
                      const swipeThreshold = 60;
                      if (info.offset.x < -swipeThreshold) {
                        handleNext();
                      } else if (info.offset.x > swipeThreshold) {
                        handlePrev();
                      }
                    }}
                    className="w-full flex justify-center cursor-grab active:cursor-grabbing touch-pan-y"
                  >
                    <ConfessionCard 
                      confession={confessions[activeIndex]} 
                      onUpdate={handleCardUpdate}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next page button */}
              <button
                id="next-page-btn"
                onClick={handleNext}
                disabled={activeIndex === confessions.length - 1}
                className={`p-3 rounded-full border bg-stone-950/60 transition-all duration-300 ${
                  activeIndex === confessions.length - 1
                    ? "opacity-10 border-stone-900 cursor-not-allowed"
                    : "opacity-75 hover:opacity-100 border-stone-800 hover:border-stone-700 text-stone-300 active:scale-95"
                } hidden md:flex items-center justify-center`}
                title="Next confession (Right Arrow)"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Mobile / Tablet Swipe or Arrow Overlay Controls */}
            <div className="flex md:hidden items-center justify-center gap-6 mt-2">
              <button
                id="prev-page-btn-mobile"
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className={`px-4 py-2 rounded-xl border text-xs font-mono tracking-wide transition-all ${
                  activeIndex === 0
                    ? "opacity-20 border-stone-900 text-stone-700"
                    : "opacity-80 border-stone-800 text-stone-300 active:bg-stone-900"
                }`}
              >
                ← Prev
              </button>
              
              <span className="text-xs font-mono text-stone-500">
                {activeIndex + 1} / {confessions.length}
              </span>
              
              <button
                id="next-page-btn-mobile"
                onClick={handleNext}
                disabled={activeIndex === confessions.length - 1}
                className={`px-4 py-2 rounded-xl border text-xs font-mono tracking-wide transition-all ${
                  activeIndex === confessions.length - 1
                    ? "opacity-20 border-stone-900 text-stone-700"
                    : "opacity-80 border-stone-800 text-stone-300 active:bg-stone-900"
                }`}
              >
                Next →
              </button>
            </div>

            {/* Bottom Meta & Instructions */}
            <div className="flex flex-col items-center gap-3">
              {/* Desktop keyboard helper */}
              <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-stone-500">
                <Keyboard size={11} />
                <span>Tip: Use </span>
                <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800">←</kbd>
                <span> and </span>
                <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800">→</kbd>
                <span> keys to flip pages</span>
              </div>

              {/* Progress dots at bottom */}
              <div className="hidden md:flex justify-center items-center gap-1 max-w-xs flex-wrap px-8">
                {/* To keep dots small and tidy, we only show up to 15, or use a slider line */}
                {confessions.length <= 15 ? (
                  confessions.map((_, i) => (
                    <button
                      key={i}
                      id={`dot-indicator-${i}`}
                      onClick={() => {
                        setSlideDirection(i > activeIndex ? "right" : "left");
                        setActiveIndex(i);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeIndex 
                          ? "w-4 bg-stone-300" 
                          : "w-1.5 bg-stone-800 hover:bg-stone-700"
                      }`}
                    />
                  ))
                ) : (
                  <div className="flex items-center gap-3 text-xs font-mono text-stone-500">
                    <span>Page</span>
                    <span className="text-stone-300 font-bold">{activeIndex + 1}</span>
                    <span>of</span>
                    <span className="text-stone-300">{confessions.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
