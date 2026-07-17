import React, { useRef, useState, useEffect } from "react";
import { 
  X, 
  Download, 
  Copy, 
  Share2, 
  Check, 
  Instagram, 
  Twitter, 
  MessageCircle, 
  Sparkles,
  Smartphone,
  Square,
  Maximize2
} from "lucide-react";
import { Confession, CARD_THEMES, CardTheme } from "../types";
import { motion } from "motion/react";

interface ShareModalProps {
  confession: Confession;
  onClose: () => void;
}

type AspectRatio = "square" | "story" | "landscape";

export const ShareModal: React.FC<ShareModalProps> = ({ confession, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("square");
  const [customTheme, setCustomTheme] = useState<string>(confession.theme);
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [watermark, setWatermark] = useState(true);

  const selectedThemeObj = CARD_THEMES[customTheme] || CARD_THEMES.midnight;

  // Render on canvas whenever options change
  useEffect(() => {
    drawCanvas();
  }, [aspectRatio, customTheme, watermark, confession]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Define dimensions based on aspect ratio (multiply by 2 for Retina/high-res output!)
    let width = 1000;
    let height = 1000;

    if (aspectRatio === "story") {
      width = 1080;
      height = 1920;
    } else if (aspectRatio === "landscape") {
      width = 1200;
      height = 675;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw background
    let bgGradient = ctx.createRadialGradient(
      width / 2, height / 2, 50,
      width / 2, height / 2, Math.max(width, height)
    );

    // Color definitions based on CARD_THEMES keys
    let colors = {
      bg: "#090514",
      cardBg: "rgba(15, 11, 28, 0.95)",
      border: "rgba(99, 102, 241, 0.2)",
      text: "#f1f5f9",
      subtext: "#818cf8",
      accent: "#a5b4fc"
    };

    if (customTheme === "sunset") {
      colors = {
        bg: "#1c0a00",
        cardBg: "rgba(43, 16, 0, 0.95)",
        border: "rgba(249, 115, 22, 0.2)",
        text: "#fff7ed",
        subtext: "#fb923c",
        accent: "#fde047"
      };
    } else if (customTheme === "emerald") {
      colors = {
        bg: "#021c0e",
        cardBg: "rgba(2, 40, 20, 0.95)",
        border: "rgba(16, 185, 129, 0.2)",
        text: "#f0fdf4",
        subtext: "#34d399",
        accent: "#6ee7b7"
      };
    } else if (customTheme === "sakura") {
      colors = {
        bg: "#1c050a",
        cardBg: "rgba(54, 10, 20, 0.95)",
        border: "rgba(244, 63, 94, 0.25)",
        text: "#fff1f2",
        subtext: "#fb7185",
        accent: "#fecdd3"
      };
    } else if (customTheme === "lavender") {
      colors = {
        bg: "#0f051c",
        cardBg: "rgba(31, 10, 54, 0.95)",
        border: "rgba(167, 139, 250, 0.25)",
        text: "#faf5ff",
        subtext: "#c084fc",
        accent: "#e9d5ff"
      };
    } else if (customTheme === "ink") {
      colors = {
        bg: "#09090b",
        cardBg: "rgba(24, 24, 27, 0.95)",
        border: "rgba(63, 63, 70, 0.3)",
        text: "#f4f4f5",
        subtext: "#a1a1aa",
        accent: "#d4d4d8"
      };
    } else if (customTheme === "editorial") {
      colors = {
        bg: "#fafaf9",
        cardBg: "rgba(245, 245, 244, 0.95)",
        border: "rgba(120, 113, 108, 0.3)",
        text: "#1c1917",
        subtext: "#57534e",
        accent: "#44403c"
      };
    }

    bgGradient.addColorStop(0, colors.cardBg);
    bgGradient.addColorStop(1, colors.bg);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw some subtle visual circles or particles for extra luxury / dreaminess
    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.2, 200, 0, Math.PI * 2);
    ctx.fillStyle = colors.border.replace("0.2", "0.02").replace("0.25", "0.02").replace("0.3", "0.02");
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.8, 250, 0, Math.PI * 2);
    ctx.fillStyle = colors.border.replace("0.2", "0.02").replace("0.25", "0.02").replace("0.3", "0.02");
    ctx.fill();

    // Calculate card bounds
    const padding = 60;
    const cardWidth = width - padding * 2;
    const cardHeight = Math.min(height - padding * 2, height * 0.8);
    const cardX = padding;
    const cardY = (height - cardHeight) / 2;

    // Draw Glassmorphic Card Background
    ctx.fillStyle = colors.cardBg;
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 3;
    
    // Rounded Card
    ctx.beginPath();
    const r = 40; // radius
    ctx.moveTo(cardX + r, cardY);
    ctx.lineTo(cardX + cardWidth - r, cardY);
    ctx.arcTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + r, r);
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - r);
    ctx.arcTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - r, cardY + cardHeight, r);
    ctx.lineTo(cardX + r, cardY + cardHeight);
    ctx.arcTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - r, r);
    ctx.lineTo(cardX, cardY + r);
    ctx.arcTo(cardX, cardY, cardX + r, cardY, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw Tag/Category Bubble
    ctx.font = "bold 20px monospace";
    const tagText = confession.tag.toUpperCase();
    const tagWidth = ctx.measureText(tagText).width + 30;
    const tagX = cardX + 45;
    const tagY = cardY + 50;
    
    ctx.fillStyle = colors.border.replace("0.2", "0.15").replace("0.25", "0.15").replace("0.3", "0.15");
    ctx.strokeStyle = colors.border;
    ctx.beginPath();
    const tr = 15;
    ctx.roundRect?.(tagX, tagY, tagWidth, 38, tr) || ctx.rect(tagX, tagY, tagWidth, 38);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colors.accent;
    ctx.fillText(tagText, tagX + 15, tagY + 26);

    // Draw Quotes Decor
    ctx.font = 'italic 160px "Lora", Georgia, serif';
    ctx.fillStyle = colors.border.replace("0.2", "0.08").replace("0.25", "0.08").replace("0.3", "0.08");
    ctx.fillText("“", cardX + 40, cardY + 160);

    // Draw Confession Text
    ctx.fillStyle = colors.text;
    ctx.textAlign = "center";
    
    // Choose appropriate font size based on text length
    let fontSize = 42;
    if (confession.text.length > 300) fontSize = 28;
    else if (confession.text.length > 150) fontSize = 34;

    ctx.font = `italic ${fontSize}px "Lora", Georgia, serif`;

    // Wrap Text function for canvas
    const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(" ");
      let line = "";
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line.trim(), x, currentY);
          line = words[n] + " ";
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line.trim(), x, currentY);
      return currentY;
    };

    const textX = width / 2;
    const textY = cardY + cardHeight / 2 - 20;
    const maxTextWidth = cardWidth - 140;
    const lineHeight = fontSize * 1.45;
    
    // Center alignment calculation
    const linesCount = Math.ceil(ctx.measureText(confession.text).width / maxTextWidth) + 1;
    const startY = textY - (linesCount * lineHeight) / 3;

    wrapText(ctx, `“${confession.text}”`, textX, startY, maxTextWidth, lineHeight);

    // Draw Bottom Signature/Author Mask
    ctx.textAlign = "center";
    ctx.font = "bold 22px monospace";
    ctx.fillStyle = colors.subtext;
    ctx.fillText(`shared by ${confession.alias}`, width / 2, cardY + cardHeight - 80);

    // Draw App Watermark Void Footnote
    if (watermark) {
      ctx.textAlign = "center";
      ctx.font = "tracking-wider 16px monospace";
      ctx.fillStyle = colors.text === "#1c1917" ? "rgba(28,25,23,0.35)" : "rgba(255,255,255,0.25)";
      ctx.fillText("WHISPERS.VOID • SPEAK YOUR TRUTH IN THE SILENT DECK", width / 2, height - padding / 2);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `whisper-${confession.alias}-${aspectRatio}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyText = () => {
    const textToCopy = `“${confession.text}”\n\n— ${confession.alias}\nReleased on Whispers (Anonymous Confession Deck)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Pre-configured social links
  const textQuote = encodeURIComponent(`“${confession.text.substring(0, 100)}${confession.text.length > 100 ? "..." : ""}” — shared by ${confession.alias} on Whispers`);
  const currentUrl = encodeURIComponent(window.location.href);

  const shareTwitter = `https://twitter.com/intent/tweet?text=${textQuote}&url=${currentUrl}`;
  const shareWhatsApp = `https://api.whatsapp.com/send?text=${textQuote}%0A%0ARead%20more%20on:%20${currentUrl}`;

  return (
    <div className="fixed inset-0 bg-[#060404]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative z-50"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full border border-stone-800 hover:border-stone-700 bg-stone-950/80 text-stone-400 hover:text-stone-200 transition-all z-10"
        >
          <X size={16} />
        </button>

        {/* Left Side: Dynamic Live Canvas Preview */}
        <div className="flex-1 bg-stone-900/35 border-b lg:border-b-0 lg:border-r border-stone-800 p-6 md:p-8 flex flex-col items-center justify-center gap-4">
          <div className="text-center mb-1">
            <h4 className="text-xs font-mono text-stone-500 uppercase tracking-widest">Card Preview</h4>
          </div>
          
          {/* Sizing box wrappers to keep the canvas display highly responsive */}
          <div className="relative w-full max-w-[340px] md:max-w-[420px] aspect-square flex items-center justify-center overflow-hidden rounded-2xl border border-stone-800 bg-stone-950/60 shadow-inner">
            <canvas 
              ref={canvasRef} 
              className={`max-w-full max-h-full object-contain shadow-2xl ${
                aspectRatio === "story" ? "aspect-[9/16]" : aspectRatio === "landscape" ? "aspect-[16/9]" : "aspect-square"
              }`}
            />
          </div>

          <div className="text-center">
            <span className="text-[10px] font-mono text-stone-500">Rendered in high resolution (Retina-ready)</span>
          </div>
        </div>

        {/* Right Side: Options and Social Links */}
        <div className="w-full lg:w-[380px] p-6 md:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-xl font-light text-stone-200">Share Truth</h3>
              <p className="text-[10px] font-mono text-stone-500 mt-1 uppercase tracking-wider">
                Download a custom card layout or share on socials
              </p>
            </div>

            {/* Custom Vibe / Color select */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={11} className="text-indigo-400" />
                <span>Custom color story</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CARD_THEMES).map((themeKey) => {
                  const themeOption = CARD_THEMES[themeKey];
                  return (
                    <button
                      key={themeKey}
                      onClick={() => setCustomTheme(themeKey)}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        customTheme === themeKey
                          ? "border-stone-100 scale-110 shadow-lg"
                          : "border-stone-800 hover:border-stone-600"
                      } ${themeOption.bgClass}`}
                      title={themeOption.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Formats / Aspect Ratio Select */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-mono text-stone-400 uppercase tracking-widest flex items-center gap-1">
                <Smartphone size={11} className="text-indigo-400" />
                <span>Format Layout</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setAspectRatio("square")}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[10px] font-mono transition-all ${
                    aspectRatio === "square"
                      ? "border-stone-100 bg-stone-900/60 text-stone-200"
                      : "border-stone-850 hover:border-stone-700 text-stone-400"
                  }`}
                >
                  <Square size={14} />
                  <span>Square (1:1)</span>
                </button>
                <button
                  onClick={() => setAspectRatio("story")}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[10px] font-mono transition-all ${
                    aspectRatio === "story"
                      ? "border-stone-100 bg-stone-900/60 text-stone-200"
                      : "border-stone-850 hover:border-stone-700 text-stone-400"
                  }`}
                >
                  <Smartphone size={14} />
                  <span>Story (9:16)</span>
                </button>
                <button
                  onClick={() => setAspectRatio("landscape")}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[10px] font-mono transition-all ${
                    aspectRatio === "landscape"
                      ? "border-stone-100 bg-stone-900/60 text-stone-200"
                      : "border-stone-850 hover:border-stone-700 text-stone-400"
                  }`}
                >
                  <Maximize2 size={14} />
                  <span>Landscape</span>
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between border-t border-stone-900 pt-4">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Include void watermark</span>
              <button
                onClick={() => setWatermark(!watermark)}
                className={`w-10 h-5.5 rounded-full p-1 transition-colors ${watermark ? "bg-indigo-500" : "bg-stone-800"}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${watermark ? "translate-x-4.5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          {/* Share/Actions Rows */}
          <div className="space-y-4 pt-4 border-t border-stone-900">
            {/* Download button */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 bg-stone-100 text-stone-900 hover:bg-stone-200 rounded-xl text-xs font-mono font-bold tracking-wide shadow-lg transition-all"
            >
              <Download size={14} />
              <span>Download PNG Image</span>
            </button>

            {/* Grid social platforms */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={shareWhatsApp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-stone-800 hover:border-stone-700 bg-stone-950/40 text-[10px] font-mono text-stone-300 hover:text-stone-100 transition-all"
              >
                <MessageCircle size={13} className="text-emerald-500" />
                <span>WhatsApp Status</span>
              </a>
              <a
                href={shareTwitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-stone-800 hover:border-stone-700 bg-stone-950/40 text-[10px] font-mono text-stone-300 hover:text-stone-100 transition-all"
              >
                <Twitter size={13} className="text-sky-400" />
                <span>Share to X</span>
              </a>
            </div>

            {/* Manual Quick Copier */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyText}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-stone-800 hover:border-stone-700 bg-stone-950/40 text-[10px] font-mono text-stone-300 hover:text-stone-100 transition-all"
              >
                {copiedText ? (
                  <>
                    <Check size={13} className="text-emerald-400 animate-bounce" />
                    <span className="text-emerald-400 font-semibold">Quote Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Text Quote</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-stone-800 hover:border-stone-700 bg-stone-950/40 text-[10px] font-mono text-stone-300 hover:text-stone-100 transition-all"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400 animate-bounce" />
                    <span className="text-emerald-400 font-semibold">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    <span>Copy Deck Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Creative design tip */}
            <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-xl text-[9px] font-sans text-indigo-200/80 leading-relaxed italic">
              ✨ <strong>Tip for Insta & TikTok:</strong> Choose the &quot;Story (9:16)&quot; layout above, download the image, and upload it directly as your slide/story background for a stunning professional aesthetic!
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
};
