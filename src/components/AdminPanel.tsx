import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { db } from "../firebase";
import { Confession, CARD_THEMES, Comment } from "../types";
import { 
  Trash2, 
  Search, 
  Filter, 
  Lock, 
  ShieldAlert, 
  MessageSquare, 
  Calendar, 
  Heart, 
  Smile, 
  Users,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeError, setPasscodeError] = useState("");
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Track items pending confirmation to bypass window.confirm limitations in sandboxed iframes
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmCommentId, setConfirmCommentId] = useState<string | null>(null);

  // Default admin passcode
  const ADMIN_PASSCODE = "110809";

  useEffect(() => {
    // Keep authenticated state in sessionStorage so we don't have to login on refresh
    const authSaved = sessionStorage.getItem("whispers_admin_authenticated");
    if (authSaved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConfessions();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem("whispers_admin_authenticated", "true");
      setPasscodeError("");
    } else {
      setPasscodeError("Invalid admin security key. Access denied.");
    }
  };

  const fetchConfessions = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "confessions"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list: Confession[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Confession);
      });
      setConfessions(list);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Failed to fetch confessions from database." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfession = async (id: string) => {
    try {
      await deleteDoc(doc(db, "confessions", id));
      setConfessions(confessions.filter((c) => c.id !== id));
      setStatusMessage({ type: "success", text: "Confession deleted successfully." });
      setConfirmDeleteId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Failed to delete confession." });
    }
  };

  const handleDeleteComment = async (confessionId: string, commentId: string) => {
    try {
      const confession = confessions.find((c) => c.id === confessionId);
      if (!confession || !confession.comments) return;

      const updatedComments = confession.comments.filter((cmt) => cmt.id !== commentId);
      const confRef = doc(db, "confessions", confessionId);
      await updateDoc(confRef, { comments: updatedComments });

      // Update state locally
      setConfessions(
        confessions.map((c) => {
          if (c.id === confessionId) {
            return { ...c, comments: updatedComments };
          }
          return c;
        })
      );
      setStatusMessage({ type: "success", text: "Whisper comment deleted successfully." });
      setConfirmCommentId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Failed to delete comment." });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("whispers_admin_authenticated");
    setPasscode("");
  };

  // Helper to safely format time
  const formatTime = (ts: any) => {
    if (!ts) return "";
    let date = new Date();
    if (typeof ts === "number") {
      date = new Date(ts);
    } else if (ts.toDate) {
      date = ts.toDate();
    } else if (ts.seconds) {
      date = new Date(ts.seconds * 1000);
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Tag list for filtering
  const tagsList = [
    { id: "all", name: "All Tags" },
    { id: "crush", name: "Crush" },
    { id: "regret", name: "Regret" },
    { id: "unsent", name: "Unsent" },
    { id: "gratitude", name: "Gratitude" },
    { id: "secrets", name: "Secrets" },
    { id: "funny", name: "Funny" },
  ];

  // Filter confessions based on search query and tag selection
  const filteredConfessions = confessions.filter((c) => {
    const textMatch = c.text.toLowerCase().includes(searchQuery.toLowerCase());
    const aliasMatch = c.alias.toLowerCase().includes(searchQuery.toLowerCase());
    const tagMatch = selectedTag === "all" || c.tag === selectedTag;
    return (textMatch || aliasMatch) && tagMatch;
  });

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-stone-950/80 border border-stone-850 p-8 rounded-3xl shadow-2xl text-center space-y-6"
        >
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
            <Lock size={20} />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl font-light text-stone-200">Admin Sanctuary</h2>
            <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest leading-relaxed">
              Whispers Void Guardian Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">
                Enter Void Key Passcode
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 bg-stone-900/60 border border-stone-800 focus:border-stone-700 rounded-xl text-stone-200 text-sm focus:outline-none text-center tracking-widest font-mono transition-all"
              />
            </div>

            {passcodeError && (
              <div className="text-[10px] font-mono text-rose-500 bg-rose-950/15 border border-rose-900/25 p-2.5 rounded-xl text-center">
                {passcodeError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Verify Key
            </button>
          </form>

          <button
            onClick={onBack}
            className="text-[10px] font-mono text-stone-500 hover:text-stone-300 transition-colors uppercase tracking-widest"
          >
            ← Return to silent deck
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-6 md:py-8 space-y-6">
      
      {/* Header bar of admin panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h1 className="font-serif text-2xl font-light text-stone-100">Portal Guardian</h1>
          </div>
          <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
            Audit and moderate inappropriate secrets
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchConfessions}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border border-stone-850 bg-stone-950/50 text-stone-400 hover:text-stone-200 hover:border-stone-700 transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Sync Void</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border border-red-900/30 bg-red-950/15 text-red-400 hover:bg-red-950/30 transition-all cursor-pointer"
          >
            <EyeOff size={13} />
            <span>Lock Portal</span>
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border border-stone-800 text-stone-300 hover:border-stone-700 transition-all cursor-pointer"
          >
            Back to Deck
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-mono border ${
              statusMessage.type === "success" 
                ? "bg-emerald-950/15 border-emerald-900/25 text-emerald-400" 
                : "bg-rose-950/15 border-rose-900/25 text-rose-400"
            }`}
          >
            {statusMessage.type === "success" ? <CheckCircle2 size={14} /> : <ShieldAlert size={14} />}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and search bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search secrets, authors, keywords..."
            className="w-full pl-10 pr-4 py-3 bg-stone-950/60 border border-stone-850 focus:border-stone-700 text-xs font-mono text-stone-200 rounded-xl focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter size={13} className="text-stone-500 shrink-0 ml-1" />
          <div className="flex gap-1.5 shrink-0">
            {tagsList.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                  selectedTag === tag.id
                    ? "border-indigo-500/40 bg-indigo-950/30 text-indigo-300"
                    : "border-stone-850 hover:border-stone-700 text-stone-400 hover:text-stone-200"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main List of Confessions */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center text-center opacity-40 font-mono text-xs gap-2">
          <RefreshCw size={24} className="animate-spin text-stone-500" />
          <span>Synchronizing silent deck...</span>
        </div>
      ) : filteredConfessions.length === 0 ? (
        <div className="h-64 border border-dashed border-stone-850 rounded-3xl flex flex-col items-center justify-center text-center opacity-40 font-mono text-xs gap-1.5 p-6">
          <AlertTriangle size={24} className="text-stone-500 stroke-1" />
          <p className="font-serif italic text-sm">No confessions match the audit scope.</p>
          <span className="text-[10px]">The void is absolutely clean or search query is vacant.</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest pl-1">
            Displaying {filteredConfessions.length} of {confessions.length} secret records
          </div>

          <div className="space-y-4">
            {filteredConfessions.map((c) => {
              const theme = CARD_THEMES[c.theme] || CARD_THEMES.midnight;
              return (
                <div 
                  key={c.id} 
                  className="bg-stone-950 border border-stone-850 hover:border-stone-800 rounded-2xl overflow-hidden transition-all shadow-xl"
                >
                  <div className="p-5 md:p-6 space-y-4">
                    
                    {/* Top Row: Meta info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-900 pb-3">
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className={`px-2 py-0.5 rounded border ${theme.badgeClass}`}>
                          {c.tag}
                        </span>
                        <span className="text-stone-500">ID: {c.id}</span>
                        <span className="text-stone-600">•</span>
                        <span className="text-stone-400 font-semibold">{c.alias}</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-[10px] font-mono text-stone-500">
                        <Calendar size={11} />
                        <span>{formatTime(c.createdAt)}</span>
                      </div>
                    </div>

                    {/* Middle: Content */}
                    <div className="font-serif italic text-stone-300 text-sm md:text-base leading-relaxed pl-2 border-l-2 border-stone-800">
                      &ldquo;{c.text}&rdquo;
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      {/* Left: Interactions */}
                      <div className="flex gap-4 text-[10px] font-mono text-stone-500">
                        <div className="flex items-center gap-1">
                          <Heart size={11} className="text-red-500/80" />
                          <span>{c.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Smile size={11} className="text-amber-500/80" />
                          <span>{c.hugs || 0} hugs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={11} className="text-indigo-400" />
                          <span>{c.meToos || 0} me too</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare size={11} className="text-stone-400" />
                          <span>{(c.comments || []).length} whispers</span>
                        </div>
                      </div>

                      {/* Right: Deletion Button */}
                      {confirmDeleteId === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-red-400 font-medium">Sahkan padam?</span>
                          <button
                            onClick={() => handleDeleteConfession(c.id)}
                            className="px-2.5 py-1 rounded bg-red-600 text-white text-[10px] font-mono hover:bg-red-500 transition-all cursor-pointer"
                          >
                            Ya, Padam
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 rounded bg-stone-800 text-stone-300 text-[10px] font-mono hover:bg-stone-700 transition-all cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(c.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-mono border border-red-900/40 bg-red-950/10 text-red-400 hover:bg-red-950/30 transition-all cursor-pointer"
                        >
                          <Trash2 size={11} />
                          <span>Padam Confession</span>
                        </button>
                      )}
                    </div>

                    {/* Comments list for moderation */}
                    {c.comments && c.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-stone-900 space-y-3">
                        <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                          <MessageSquare size={10} />
                          <span>Moderate Whispers / Comments ({c.comments.length})</span>
                        </div>
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {c.comments.map((comment) => (
                            <div 
                              key={comment.id} 
                              className="flex justify-between items-start gap-4 p-2.5 rounded-xl bg-stone-900/30 border border-stone-900 text-[11px] hover:border-stone-850 transition-all"
                            >
                              <div className="space-y-1">
                                <p className="text-stone-300 italic font-light">&ldquo;{comment.text}&rdquo;</p>
                                <div className="flex items-center gap-2 text-[9px] font-mono text-stone-500">
                                  <span className="font-semibold text-stone-400">{comment.alias}</span>
                                  <span>•</span>
                                  <span>{formatTime(comment.createdAt)}</span>
                                </div>
                              </div>

                              {confirmCommentId === comment.id ? (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleDeleteComment(c.id, comment.id)}
                                    className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-mono hover:bg-red-500 transition-all cursor-pointer"
                                  >
                                    Ya
                                  </button>
                                  <button
                                    onClick={() => setConfirmCommentId(null)}
                                    className="px-2 py-0.5 rounded bg-stone-800 text-stone-400 text-[9px] font-mono hover:bg-stone-700 transition-all cursor-pointer"
                                  >
                                    Tak
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmCommentId(comment.id)}
                                  className="p-1 rounded text-red-500/70 hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer shrink-0"
                                  title="Delete comment"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
