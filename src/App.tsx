import { useState, useEffect } from "react";
import { ConfessionViewer } from "./components/ConfessionViewer";
import { SubmitConfession } from "./components/SubmitConfession";
import { AdminPanel } from "./components/AdminPanel";
import { motion, AnimatePresence } from "motion/react";
import { Heart, EyeOff, Sparkles, Feather, ArrowLeft, Shield } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"read" | "share" | "admin">("read");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle URL changes to support /admin and #admin
  useEffect(() => {
    const handleLocationCheck = () => {
      if (window.location.pathname === "/admin" || window.location.hash === "#admin") {
        setActiveTab("admin");
      } else if (activeTab === "admin") {
        setActiveTab("read");
      }
    };

    handleLocationCheck();
    window.addEventListener("hashchange", handleLocationCheck);
    return () => window.removeEventListener("hashchange", handleLocationCheck);
  }, []);

  // Sync hash state with active tab change
  const handleTabChange = (tab: "read" | "share" | "admin") => {
    setActiveTab(tab);
    if (tab === "admin") {
      window.location.hash = "admin";
    } else if (tab === "share") {
      window.location.hash = "share";
    } else {
      window.location.hash = "";
      // Clean URL if we are on /admin
      if (window.location.pathname === "/admin") {
        window.history.pushState({}, "", "/");
      }
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  return (
    <div 
      id="app-container" 
      className="min-h-screen bg-[#060404] flex flex-col justify-between selection:bg-stone-800 selection:text-stone-100 overflow-x-hidden relative"
    >
      
      {/* Immersive cursor-follow spotlight glow in the void */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(147, 51, 234, 0.05), rgba(79, 70, 229, 0.04), transparent 80%)`
        }}
      />
      
      {/* Background static radial soft lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-950/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        
        {/* Ultra-minimalist custom header bar */}
        <header className="w-full max-w-5xl mx-auto px-6 py-6 md:py-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-default">
            <Sparkles className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
            <span className="font-display font-medium text-xs tracking-widest text-stone-300 uppercase">
              whispers
            </span>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "read" ? (
              <motion.button
                key="btn-share"
                id="header-share-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleTabChange("share")}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono border border-stone-800 bg-stone-950/40 text-stone-300 hover:text-stone-100 hover:border-stone-700 hover:bg-stone-900/30 transition-all cursor-pointer"
              >
                <Feather size={12} />
                <span>Share a secret</span>
              </motion.button>
            ) : (
              <motion.button
                key="btn-read"
                id="header-read-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleTabChange("read")}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono border border-stone-800 bg-stone-950/40 text-stone-300 hover:text-stone-100 hover:border-stone-700 hover:bg-stone-900/30 transition-all cursor-pointer"
              >
                <ArrowLeft size={12} />
                <span>Back to deck</span>
              </motion.button>
            )}
          </AnimatePresence>
        </header>

        {/* Dynamic Content Frame */}
        <main className="flex-grow flex items-center justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {activeTab === "read" ? (
                <ConfessionViewer onGoToShare={() => handleTabChange("share")} />
              ) : activeTab === "share" ? (
                <SubmitConfession onSuccess={() => handleTabChange("read")} />
              ) : (
                <AdminPanel onBack={() => handleTabChange("read")} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Minimalist Footnote */}
      <footer className="relative z-10 border-t border-stone-950 bg-stone-950/20 py-6 text-center text-[10px] font-mono tracking-widest text-stone-600 uppercase">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <EyeOff size={11} className="text-stone-700" />
            <span>Completely unmonitored, private, and ethereal</span>
          </div>
          
          <div className="flex items-center justify-center">
            <button 
              onClick={() => handleTabChange(activeTab === "admin" ? "read" : "admin")}
              className="flex items-center gap-1 opacity-35 hover:opacity-100 hover:text-indigo-400 transition-all cursor-pointer text-[10px] font-mono uppercase tracking-widest"
              title="Portal Guardian Key"
            >
              <Shield size={10} className="stroke-[1.5]" />
              <span>Portal Guardian</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 justify-center sm:justify-end">
            <span>Speak your truth in the quiet</span>
            <Heart size={9} className="text-stone-700 hover:text-red-500/50 transition-colors cursor-pointer animate-pulse" />
          </div>
        </div>
      </footer>

    </div>
  );
}
