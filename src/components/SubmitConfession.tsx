import React, { useState } from "react";
import { 
  Send, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Sparkles, 
  Feather,
  Palette,
  CheckCircle,
  HelpCircle,
  Heart
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { 
  CARD_THEMES, 
  CONFESSION_TAGS, 
  generateAnonymousAlias 
} from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SubmitConfessionProps {
  onSuccess: () => void;
}

const INSPIRES = [
  "What is weighing on your heart today?",
  "A secret crush you've never spoken to?",
  "An apology you wish you could send, but can't?",
  "A childish lie you still think about?",
  "A silent gratitude for someone who doesn't know?",
  "A fear that keeps you awake at 3:00 AM?"
];

export const SubmitConfession: React.FC<SubmitConfessionProps> = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [text, setText] = useState("");
  const [theme, setTheme] = useState("midnight");
  const [tag, setTag] = useState("crush");
  const [aliasType, setAliasType] = useState<"generated" | "custom" | "none">("generated");
  const [customAlias, setCustomAlias] = useState("");
  const [generatedAlias, setGeneratedAlias] = useState(() => generateAnonymousAlias());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Floating inspire prompt
  const [inspireIndex, setInspireIndex] = useState(0);

  const rotateInspire = () => {
    setInspireIndex((prev) => (prev + 1) % INSPIRES.length);
  };

  const getFinalAlias = () => {
    if (aliasType === "generated") return generatedAlias;
    if (aliasType === "custom" && customAlias.trim()) return customAlias.trim();
    return "anonymous";
  };

  const handleNextStep = () => {
    if (step === 1 && text.trim().length < 10) return;
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (text.trim().length < 10 || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const selectedTagObj = CONFESSION_TAGS.find(t => t.id === tag) || CONFESSION_TAGS[1];
      
      const confessionData = {
        text: text.trim(),
        theme: theme,
        tag: selectedTagObj.name,
        alias: getFinalAlias(),
        createdAt: serverTimestamp(),
        likes: 0,
        hugs: 0,
        meToos: 0,
        comments: []
      };

      await addDoc(collection(db, "confessions"), confessionData);
      setSubmitted(true);
    } catch (err) {
      console.error("Error adding confession: ", err);
      alert("Something went wrong while releasing your whisper. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setText("");
    setTheme("midnight");
    setTag("crush");
    setAliasType("generated");
    setCustomAlias("");
    setGeneratedAlias(generateAnonymousAlias());
    setStep(1);
    setSubmitted(false);
  };

  // Preview styling from static CARD_THEMES
  const currentThemeObj = CARD_THEMES[theme] || CARD_THEMES.midnight;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-6 py-6 flex flex-col items-center">
      
      {/* Header Info */}
      <div className="text-center mb-8 max-w-lg">
        <h2 className="font-serif text-3xl font-light tracking-tight text-stone-200">
          {submitted ? "Released" : "Share a Secret"}
        </h2>
        <p className="text-xs font-mono text-stone-500 mt-2 tracking-wide uppercase">
          {submitted ? "Your burden is lifted" : "Completely anonymous. No accounts. No logs."}
        </p>
      </div>

      {/* Stepper Progress Indicator (Only if not submitted) */}
      {!submitted && (
        <div className="w-full flex items-center justify-between max-w-md px-4 mb-10 text-[10px] font-mono tracking-widest text-stone-500 uppercase">
          <div className="flex flex-col items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${step >= 1 ? "bg-stone-100 text-stone-900 border-stone-100" : "border-stone-800"}`}>1</span>
            <span className={step === 1 ? "text-stone-300 font-semibold" : ""}>Pen</span>
          </div>
          <div className="h-[1px] flex-1 bg-stone-900 mx-2" />
          <div className="flex flex-col items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${step >= 2 ? "bg-stone-100 text-stone-900 border-stone-100" : "border-stone-800"}`}>2</span>
            <span className={step === 2 ? "text-stone-300 font-semibold" : ""}>Canvas</span>
          </div>
          <div className="h-[1px] flex-1 bg-stone-900 mx-2" />
          <div className="flex flex-col items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${step >= 3 ? "bg-stone-100 text-stone-900 border-stone-100" : "border-stone-800"}`}>3</span>
            <span className={step === 3 ? "text-stone-300 font-semibold" : ""}>Tag</span>
          </div>
          <div className="h-[1px] flex-1 bg-stone-900 mx-2" />
          <div className="flex flex-col items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${step >= 4 ? "bg-stone-100 text-stone-900 border-stone-100" : "border-stone-800"}`}>4</span>
            <span className={step === 4 ? "text-stone-300 font-semibold" : ""}>Identity</span>
          </div>
          <div className="h-[1px] flex-1 bg-stone-900 mx-2" />
          <div className="flex flex-col items-center gap-1.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${step >= 5 ? "bg-stone-100 text-stone-900 border-stone-100" : "border-stone-800"}`}>5</span>
            <span className={step === 5 ? "text-stone-300 font-semibold" : ""}>Release</span>
          </div>
        </div>
      )}

      {/* Main Form Body / Cards */}
      <div className="w-full max-w-xl min-h-[380px] flex flex-col justify-between rounded-3xl border border-stone-800 bg-stone-950/40 p-6 md:p-10 shadow-2xl relative overflow-hidden mb-8">
        
        {/* Submitted Success View */}
        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-5">
            <div className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-emerald-400">
              <CheckCircle size={30} className="stroke-1" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl italic text-stone-200">Reverie Sent</h3>
              <p className="text-sm font-light text-stone-400 leading-relaxed max-w-sm">
                Your anonymous whisper has been released into the digital sky. Let it go; you are a little lighter now. 🕊️
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
              <button
                id="view-whispers-btn"
                onClick={onSuccess}
                className="w-full sm:w-auto text-xs font-mono bg-stone-100 text-stone-900 px-5 py-3 rounded-xl hover:bg-stone-200 font-medium tracking-wide"
              >
                Read Confessions
              </button>
              <button
                id="share-another-btn"
                onClick={handleReset}
                className="w-full sm:w-auto text-xs font-mono bg-stone-950 border border-stone-800 hover:border-stone-700 px-5 py-3 rounded-xl text-stone-300"
              >
                Share Another Secret
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            
            {/* Step Contents */}
            <div className="flex-1 flex flex-col justify-center">
              
              {/* STEP 1: Write text */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Feather size={12} />
                      Write Your Confession
                    </label>
                    <button
                      id="inspire-me-btn"
                      type="button"
                      onClick={rotateInspire}
                      className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 border border-indigo-900/40 rounded-lg px-2 py-1 flex items-center gap-1 bg-indigo-950/25"
                    >
                      <Sparkles size={10} />
                      <span>Inspire me</span>
                    </button>
                  </div>
                  
                  {/* Dynamic Inspire prompt box */}
                  <motion.p 
                    key={inspireIndex}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    className="text-xs font-serif italic text-indigo-200/80 bg-indigo-950/10 border border-indigo-950/20 rounded-xl p-3.5"
                  >
                    “ {INSPIRES[inspireIndex]} ”
                  </motion.p>

                  <textarea
                    id="confession-text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write honestly... what is a secret you carry? (Min 10 characters)"
                    maxLength={600}
                    rows={6}
                    className="w-full bg-stone-900/40 border border-stone-800 focus:border-stone-700 text-stone-100 rounded-2xl p-4 text-sm font-serif italic focus:outline-none placeholder:text-stone-600 resize-none leading-relaxed"
                  />
                  
                  <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
                    <span>Be gentle with other souls.</span>
                    <span className={text.trim().length < 10 ? "text-amber-500/80" : "text-stone-400"}>
                      {text.length} / 600 characters {text.trim().length < 10 && "(Need min 10)"}
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: Choose Theme */}
              {step === 2 && (
                <div className="space-y-6">
                  <label className="text-xs font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Palette size={12} />
                    Choose Visual Vibe
                  </label>

                  <div className="grid grid-cols-1 gap-3.5 max-h-[220px] overflow-y-auto pr-1">
                    {Object.values(CARD_THEMES).map((themeOption) => (
                      <button
                        key={themeOption.id}
                        id={`theme-btn-${themeOption.id}`}
                        onClick={() => setTheme(themeOption.id)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                          theme === themeOption.id
                            ? "border-stone-100 bg-stone-900/70"
                            : "border-stone-800/80 bg-stone-950/20 hover:border-stone-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Dot preview */}
                          <div className={`w-5 h-5 rounded-full border border-stone-500/20 ${themeOption.bgClass}`} />
                          <div>
                            <p className="text-xs font-mono font-medium text-stone-200">{themeOption.name}</p>
                            <p className="text-[10px] font-sans text-stone-500 italic mt-0.5">{themeOption.description}</p>
                          </div>
                        </div>
                        {theme === themeOption.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-100" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Aesthetic card preview slice */}
                  <div className={`p-4 rounded-2xl border ${currentThemeObj.bgClass} ${currentThemeObj.borderClass} font-serif italic text-center text-xs opacity-70`}>
                    This color story will frame your card.
                  </div>
                </div>
              )}

              {/* STEP 3: Choose Tag */}
              {step === 3 && (
                <div className="space-y-5">
                  <label className="text-xs font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} />
                    Tag Your Whispers
                  </label>

                  <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {CONFESSION_TAGS.filter(t => t.id !== "all").map((tagOption) => (
                      <button
                        key={tagOption.id}
                        id={`tag-btn-${tagOption.id}`}
                        onClick={() => setTag(tagOption.id)}
                        className={`flex flex-col items-start gap-1 p-3.5 rounded-2xl border text-left transition-all ${
                          tag === tagOption.id
                            ? "border-stone-100 bg-stone-900/70"
                            : "border-stone-800/80 bg-stone-950/20 hover:border-stone-700"
                        }`}
                      >
                        <span className="text-xl">{tagOption.icon}</span>
                        <span className="text-xs font-mono font-medium text-stone-200 mt-1">{tagOption.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Anonymous pen name */}
              {step === 4 && (
                <div className="space-y-5">
                  <label className="text-xs font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User size={12} />
                    Choose Your Mask
                  </label>

                  <div className="space-y-3.5">
                    {/* Mode 1: Generated Pseudonym */}
                    <button
                      id="alias-generated-btn"
                      onClick={() => setAliasType("generated")}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        aliasType === "generated"
                          ? "border-stone-100 bg-stone-900/60"
                          : "border-stone-800/80 bg-stone-950/20 hover:border-stone-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-mono text-stone-400">Generate Poetic Alias</p>
                        <p className="text-sm font-semibold font-mono text-indigo-400 mt-1">
                          {generatedAlias}
                        </p>
                      </div>
                      {aliasType === "generated" ? (
                        <button
                          id="regenerate-alias-btn"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGeneratedAlias(generateAnonymousAlias());
                          }}
                          className="text-[10px] font-mono text-stone-400 hover:text-stone-200 border border-stone-800 px-2 py-1 rounded-lg"
                        >
                          Reroll
                        </button>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                      )}
                    </button>

                    {/* Mode 2: Custom Pen Name */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      aliasType === "custom" ? "border-stone-100 bg-stone-900/60" : "border-stone-800/80 bg-stone-950/20"
                    }`}>
                      <button
                        id="alias-custom-btn"
                        onClick={() => setAliasType("custom")}
                        className="w-full text-left font-mono text-xs text-stone-400 flex justify-between items-center"
                      >
                        <span>Custom Pen Name</span>
                        {aliasType === "custom" && <span className="w-1.5 h-1.5 rounded-full bg-stone-100" />}
                      </button>
                      {aliasType === "custom" && (
                        <input
                          id="custom-alias-input"
                          type="text"
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                          placeholder="e.g. silent_drifter"
                          maxLength={25}
                          className="w-full bg-stone-950 border border-stone-800 focus:border-stone-700 rounded-xl px-3 py-2 text-xs font-mono mt-3 text-stone-200"
                        />
                      )}
                    </div>

                    {/* Mode 3: Fully Anonymous */}
                    <button
                      id="alias-none-btn"
                      onClick={() => setAliasType("none")}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        aliasType === "none"
                          ? "border-stone-100 bg-stone-900/60"
                          : "border-stone-800/80 bg-stone-950/20 hover:border-stone-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-mono text-stone-400">Pure Anonymous</p>
                        <p className="text-xs font-mono text-stone-500 italic mt-0.5">Simply signed as &quot;anonymous&quot;</p>
                      </div>
                      {aliasType === "none" ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-100" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Final Preview & Submit */}
              {step === 5 && (
                <div className="space-y-5">
                  <label className="text-xs font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Send size={12} />
                    Final Check & Release
                  </label>

                  {/* Card Mini Preview */}
                  <div className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-between min-h-[220px] transition-all ${currentThemeObj.bgClass} ${currentThemeObj.borderClass}`}>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border tracking-wide uppercase ${currentThemeObj.badgeClass}`}>
                        {CONFESSION_TAGS.find(t=>t.id===tag)?.name}
                      </span>
                      <span className="text-[9px] font-mono opacity-50">Just now</span>
                    </div>

                    <p className="font-serif italic text-center py-4 text-sm leading-relaxed whitespace-pre-wrap">
                      “{text}”
                    </p>

                    <div className="flex justify-center items-center gap-1 text-[9px] font-mono opacity-70 border-t border-current/10 pt-3">
                      <User size={10} />
                      <span>shared by {getFinalAlias()}</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-stone-500 text-center italic mt-2">
                    Are you ready to surrender this secret to the digital ether? You cannot edit or delete it once shared.
                  </p>
                </div>
              )}

            </div>

            {/* Step Stepper Navigation Footer */}
            <div className="flex items-center justify-between border-t border-stone-900 pt-6 mt-8">
              {step > 1 ? (
                <button
                  id="prev-step-btn"
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-stone-400 hover:text-stone-200 border border-stone-800 rounded-xl transition-all"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  id="next-step-btn"
                  type="button"
                  onClick={handleNextStep}
                  disabled={step === 1 && text.trim().length < 10}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-mono bg-stone-100 text-stone-900 rounded-xl hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed font-semibold tracking-wide transition-all ml-auto"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  id="submit-confession-btn"
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-mono bg-indigo-500 text-white hover:bg-indigo-600 rounded-xl disabled:opacity-30 font-semibold tracking-wide shadow-lg ml-auto transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-stone-200 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Release into the Void</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
