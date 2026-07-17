import React, { useState, useEffect } from "react";
import { 
  Heart, 
  MessageSquare, 
  Clock, 
  User, 
  Send, 
  ChevronRight,
  Smile,
  Users,
  Share2
} from "lucide-react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { Confession, CARD_THEMES, Comment, generateAnonymousAlias } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ShareModal } from "./ShareModal";

interface ConfessionCardProps {
  confession: Confession;
  onUpdate?: (updated: Confession) => void;
}

export const ConfessionCard: React.FC<ConfessionCardProps> = ({ 
  confession,
  onUpdate 
}) => {
  const [likes, setLikes] = useState(confession.likes || 0);
  const [hugs, setHugs] = useState(confession.hugs || 0);
  const [meToos, setMeToos] = useState(confession.meToos || 0);
  
  const [hasLiked, setHasLiked] = useState(false);
  const [hasHugged, setHasHugged] = useState(false);
  const [hasMeTooed, setHasMeTooed] = useState(false);
  
  const [showComments, setShowComments] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(confession.comments || []);
  const [newComment, setNewComment] = useState("");
  const [commentAlias, setCommentAlias] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    
    const x = px - box.width / 2;
    const y = py - box.height / 2;
    const rotX = -(y / (box.height / 2)) * 6;
    const rotY = (x / (box.width / 2)) * 6;
    
    setRotateX(rotX);
    setRotateY(rotY);
    setSpotlightPos({ x: px, y: py });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Sync state if confession changes (e.g. next card loaded)
  useEffect(() => {
    setLikes(confession.likes || 0);
    setHugs(confession.hugs || 0);
    setMeToos(confession.meToos || 0);
    setComments(confession.comments || []);
    
    // Check local storage for previous session interactions
    setHasLiked(localStorage.getItem(`like_${confession.id}`) === "true");
    setHasHugged(localStorage.getItem(`hug_${confession.id}`) === "true");
    setHasMeTooed(localStorage.getItem(`metoo_${confession.id}`) === "true");
    
    setShowComments(false);
    setNewComment("");
  }, [confession]);

  const activeTheme = CARD_THEMES[confession.theme] || CARD_THEMES.midnight;

  // Format date elegantly
  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "just now";
    
    let date: Date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    return `${days}d ago`;
  };

  // Dynamically size text based on characters to keep a gorgeous layout
  const getTextSizeClass = (text: string) => {
    const len = text.length;
    if (len < 80) return "text-2xl md:text-3xl leading-relaxed font-light";
    if (len < 200) return "text-xl md:text-2xl leading-relaxed font-light";
    if (len < 400) return "text-lg md:text-xl leading-relaxed font-light";
    return "text-base md:text-lg leading-relaxed font-light";
  };

  const handleInteraction = async (type: "likes" | "hugs" | "meToos") => {
    const confRef = doc(db, "confessions", confession.id);
    
    if (type === "likes") {
      if (hasLiked) {
        // decrement
        const newVal = Math.max(0, likes - 1);
        setLikes(newVal);
        setHasLiked(false);
        localStorage.setItem(`like_${confession.id}`, "false");
        try {
          await updateDoc(confRef, { likes: newVal });
        } catch (e) {
          console.error(e);
        }
      } else {
        // increment
        const newVal = likes + 1;
        setLikes(newVal);
        setHasLiked(true);
        localStorage.setItem(`like_${confession.id}`, "true");
        try {
          await updateDoc(confRef, { likes: newVal });
        } catch (e) {
          console.error(e);
        }
      }
    } else if (type === "hugs") {
      if (hasHugged) {
        const newVal = Math.max(0, hugs - 1);
        setHugs(newVal);
        setHasHugged(false);
        localStorage.setItem(`hug_${confession.id}`, "false");
        try {
          await updateDoc(confRef, { hugs: newVal });
        } catch (e) {
          console.error(e);
        }
      } else {
        const newVal = hugs + 1;
        setHugs(newVal);
        setHasHugged(true);
        localStorage.setItem(`hug_${confession.id}`, "true");
        try {
          await updateDoc(confRef, { hugs: newVal });
        } catch (e) {
          console.error(e);
        }
      }
    } else if (type === "meToos") {
      if (hasMeTooed) {
        const newVal = Math.max(0, meToos - 1);
        setMeToos(newVal);
        setHasMeTooed(false);
        localStorage.setItem(`metoo_${confession.id}`, "false");
        try {
          await updateDoc(confRef, { meToos: newVal });
        } catch (e) {
          console.error(e);
        }
      } else {
        const newVal = meToos + 1;
        setMeToos(newVal);
        setHasMeTooed(true);
        localStorage.setItem(`metoo_${confession.id}`, "true");
        try {
          await updateDoc(confRef, { meToos: newVal });
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const finalAlias = commentAlias.trim() || generateAnonymousAlias();
    
    const freshComment: Comment = {
      id: Math.random().toString(36).substring(2, 9),
      text: newComment.trim(),
      alias: finalAlias,
      createdAt: Date.now()
    };

    try {
      const confRef = doc(db, "confessions", confession.id);
      await updateDoc(confRef, {
        comments: arrayUnion(freshComment)
      });
      
      const updatedComments = [...comments, freshComment];
      setComments(updatedComments);
      setNewComment("");
      setCommentAlias("");
      
      if (onUpdate) {
        onUpdate({
          ...confession,
          comments: updatedComments
        });
      }
    } catch (err) {
      console.error("Error adding comment: ", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div 
      id={`confession-card-${confession.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: showComments ? "none" : "transform 0.15s ease-out, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      className={`group relative w-full max-w-2xl min-h-[460px] md:min-h-[500px] flex flex-col justify-between rounded-3xl border p-8 md:p-12 shadow-2xl overflow-hidden ${activeTheme.bgClass} ${activeTheme.borderClass}`}
    >
      {/* Dynamic Cursor Spotlight Shine */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(450px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(255,255,255,0.06), transparent 80%)`,
        }}
      />

      {/* Background ambient lighting blur ring */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-stone-500/5 blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-stone-500/5 blur-[80px]" />

      {/* Card Header Info */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-mono border tracking-wide uppercase ${activeTheme.badgeClass}`}>
            {confession.tag}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono opacity-60">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatTimeAgo(confession.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Main Confession Body */}
      <div className="my-auto py-8 z-10">
        <p className={`font-serif text-center whitespace-pre-wrap select-text italic ${getTextSizeClass(confession.text)}`}>
          “{confession.text}”
        </p>
      </div>

      {/* Card Footer Section */}
      <div className="flex flex-col gap-6 z-10 pt-4 border-t border-current/10">
        {/* Alias Info */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono opacity-75">
          <User size={13} className="opacity-80" />
          <span>shared by</span>
          <span className="font-semibold underline decoration-dotted underline-offset-4">{confession.alias}</span>
        </div>

        {/* Action / Reaction Rows */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5 md:gap-3">
            {/* Heart Button */}
            <button
              id={`like-btn-${confession.id}`}
              onClick={() => handleInteraction("likes")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border tracking-wider transition-all duration-300 ${
                hasLiked 
                  ? "bg-red-500/15 text-red-400 border-red-500/30" 
                  : `border-current/10 opacity-70 hover:opacity-100 ${activeTheme.accentClass}`
              }`}
            >
              <Heart size={14} fill={hasLiked ? "currentColor" : "none"} className="transition-transform duration-300 active:scale-125" />
              <span>{likes}</span>
            </button>

            {/* Hug Button */}
            <button
              id={`hug-btn-${confession.id}`}
              onClick={() => handleInteraction("hugs")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border tracking-wider transition-all duration-300 ${
                hasHugged 
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30" 
                  : `border-current/10 opacity-70 hover:opacity-100 ${activeTheme.accentClass}`
              }`}
            >
              <Smile size={14} className="transition-transform duration-300 active:scale-125" />
              <span>{hugs} Hugs</span>
            </button>

            {/* Me Too Button */}
            <button
              id={`metoo-btn-${confession.id}`}
              onClick={() => handleInteraction("meToos")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border tracking-wider transition-all duration-300 ${
                hasMeTooed 
                  ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" 
                  : `border-current/10 opacity-70 hover:opacity-100 ${activeTheme.accentClass}`
              }`}
            >
              <Users size={14} className="transition-transform duration-300 active:scale-125" />
              <span>{meToos} Me too</span>
            </button>
          </div>

          {/* Comments Toggle */}
          <button
            id={`toggle-comments-${confession.id}`}
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border border-current/10 opacity-75 hover:opacity-100 transition-all duration-300 ${activeTheme.accentClass} ${showComments ? "bg-white/5 opacity-100" : ""}`}
          >
            <MessageSquare size={14} />
            <span>{comments.length} Whispers</span>
          </button>

          {/* Share / Export Card Button */}
          <button
            id={`share-btn-${confession.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsShareOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono border border-current/10 opacity-75 hover:opacity-100 transition-all duration-300 ${activeTheme.accentClass}`}
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Slide-out Bottom Sheet for Comments/Whispers inside card */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={`absolute inset-0 bg-inherit flex flex-col p-6 z-20 overflow-hidden`}
          >
            {/* Comments Header */}
            <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-4">
              <h4 className="text-sm font-mono tracking-wider uppercase font-semibold">
                Supportive Whispers ({comments.length})
              </h4>
              <button 
                onClick={() => setShowComments(false)}
                className="text-xs font-mono px-2 py-1 rounded hover:bg-current/10 border border-current/10"
              >
                Close
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text">
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8">
                  <MessageSquare size={24} className="mb-2 stroke-1" />
                  <p className="text-xs font-serif italic">No whispers left yet. Be the first to leave a gentle word.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3.5 rounded-2xl bg-current/5 border border-current/5 flex flex-col gap-1.5">
                    <p className="text-sm font-light leading-relaxed select-text italic">
                      “{comment.text}”
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-60">
                      <span className="font-semibold">{comment.alias}</span>
                      <span>{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="mt-auto pt-3 border-t border-current/10">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentAlias}
                    onChange={(e) => setCommentAlias(e.target.value)}
                    placeholder="Pen name (optional)"
                    maxLength={20}
                    className="w-1/3 text-xs bg-current/5 border border-current/10 rounded-xl px-3 py-2 focus:outline-none focus:border-current/30 text-inherit font-mono"
                  />
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave a supportive word..."
                    maxLength={140}
                    className="flex-1 text-xs bg-current/5 border border-current/10 rounded-xl px-3 py-2 focus:outline-none focus:border-current/30 text-inherit font-light italic"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="p-2 rounded-xl bg-current/10 border border-current/10 hover:bg-current/20 disabled:opacity-40 transition-all flex items-center justify-center text-inherit"
                  >
                    <Send size={14} />
                  </button>
                </div>
                <div className="flex justify-between items-center px-1 text-[10px] font-mono opacity-40">
                  <span>Keep it gentle, warm, and supportive</span>
                  <span>{newComment.length}/140</span>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isShareOpen && (
          <ShareModal 
            confession={confession} 
            onClose={() => setIsShareOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
