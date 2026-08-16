import React, { useRef, useState, useEffect } from "react";
import { X, Download, Sparkles, Dog, Check, RefreshCw } from "lucide-react";
import { BarkAnalysis } from "../types";

interface BarkCardExportModalProps {
  analysis: BarkAnalysis;
  imageUrl: string;
  onClose: () => void;
}

export const BarkCardExportModal: React.FC<BarkCardExportModalProps> = ({
  analysis,
  imageUrl,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState(false);

  // Render the souvenir Passport BarkCard onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsGenerating(true);

    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    const drawCard = (imageElement: HTMLImageElement | null) => {
      // 1. Clear Canvas & Set Background Warm Paper Texture
      ctx.fillStyle = "#FAF7F2";
      ctx.fillRect(0, 0, width, height);

      // Card outer frame with passport double border
      ctx.strokeStyle = "#DFD5C6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(24, 24, width - 48, height - 48, 24);
      ctx.stroke();

      ctx.strokeStyle = "#EBE3D7";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(32, 32, width - 64, height - 64, 18);
      ctx.stroke();

      // 2. Top Passport Header Banner
      ctx.fillStyle = "#2B1F17";
      ctx.beginPath();
      ctx.roundRect(46, 46, width - 92, 86, 18);
      ctx.fill();

      // Official BarkLog AI Brand Logo Icon Badge
      const logoSize = 52;
      const logoX = 64;
      const logoY = 63;

      // Brand gradient rounded squircle
      const logoGrad = ctx.createLinearGradient(logoX, logoY, logoX + logoSize, logoY + logoSize);
      logoGrad.addColorStop(0, "#E06D53");
      logoGrad.addColorStop(1, "#C84F36");
      ctx.fillStyle = logoGrad;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.fill();

      // Subtle inner light border highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw official BarkLog AI Dog vector icon
      ctx.save();
      ctx.translate(logoX + (logoSize - 32) / 2, logoY + (logoSize - 32) / 2);
      const iconScale = 32 / 24;
      ctx.scale(iconScale, iconScale);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Canine ears
      const earLeft = new Path2D("M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5");
      ctx.stroke(earLeft);

      const earRight = new Path2D("M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5");
      ctx.stroke(earRight);

      // Canine eyes
      const eyeLeft = new Path2D("M8 14v.5");
      ctx.stroke(eyeLeft);
      const eyeRight = new Path2D("M16 14v.5");
      ctx.stroke(eyeRight);

      // Canine muzzle / nose triangle
      const muzzle = new Path2D("M11.25 16.25h1.5L12 17l-.75-.75Z");
      ctx.fillStyle = "#FFFFFF";
      ctx.fill(muzzle);
      ctx.stroke(muzzle);

      // Canine head & jaw contour
      const jaw = new Path2D("M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306");
      ctx.stroke(jaw);
      ctx.restore();

      // Passport Header Titles
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("BARKLOG AI — CANINE PASSPORT", 132, 80);

      ctx.fillStyle = "#E06D53";
      ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("OFFICIAL SOUVENIR RECORD & INNER MONOLOGUE", 134, 104);

      // Passport ID stamp top right
      ctx.fillStyle = "#A8988B";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "right";
      const passportNo = `DOG-${(analysis.dogAlias.replace(/[^A-Za-z0-9]/g, "").slice(0, 4) || "BARK").toUpperCase()}-${Math.floor(Math.abs(Math.sin(analysis.barkEnergy || 42) * 8999) + 1000)}`;
      ctx.fillText(passportNo, width - 64, 82);
      ctx.fillStyle = "#8C7D72";
      ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("CERTIFIED CANINE IDENTITY", width - 64, 102);
      ctx.textAlign = "start";

      // 3. Photo Frame (Aspect-Ratio Aware Center Crop)
      const photoX = 46;
      const photoY = 148;
      const photoW = width - 92; // 708
      const photoH = 430;

      // Draw photo container shadow / background
      ctx.fillStyle = "#1E1510";
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 20);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 20);
      ctx.clip();

      if (imageElement && imageElement.width > 0 && imageElement.height > 0) {
        // Calculate aspect-ratio "cover" math so image is never stretched or squished
        const imgRatio = imageElement.width / imageElement.height;
        const targetRatio = photoW / photoH;
        let sWidth = imageElement.width;
        let sHeight = imageElement.height;
        let sx = 0;
        let sy = 0;

        if (imgRatio > targetRatio) {
          // Source is wider than frame -> crop sides
          sWidth = imageElement.height * targetRatio;
          sx = (imageElement.width - sWidth) / 2;
        } else {
          // Source is taller than frame -> crop top/bottom with slight upward bias for dog faces
          sHeight = imageElement.width / targetRatio;
          sy = (imageElement.height - sHeight) * 0.35; // 35% bias towards head/face
        }

        ctx.drawImage(imageElement, sx, sy, sWidth, sHeight, photoX, photoY, photoW, photoH);
      } else {
        // Fallback attractive background
        ctx.fillStyle = "#2B1F17";
        ctx.fillRect(photoX, photoY, photoW, photoH);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 36px 'Fraunces', Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("🐾 " + analysis.dogAlias, photoX + photoW / 2, photoY + photoH / 2);
        ctx.textAlign = "start";
      }

      // Elegant Scrim gradient over photo bottom for clear readable text
      const scrim = ctx.createLinearGradient(0, photoY + photoH - 140, 0, photoY + photoH);
      scrim.addColorStop(0, "rgba(21, 13, 8, 0)");
      scrim.addColorStop(1, "rgba(21, 13, 8, 0.95)");
      ctx.fillStyle = scrim;
      ctx.fillRect(photoX, photoY, photoW, photoH);

      ctx.restore();

      // Crisp frame border
      ctx.strokeStyle = "#DFD5C6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoW, photoH, 20);
      ctx.stroke();

      // 4. Overlaid Badges on Photo
      // Mood Pill (Top Left)
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.beginPath();
      ctx.roundRect(photoX + 16, photoY + 16, 200, 38, 19);
      ctx.fill();
      ctx.strokeStyle = "rgba(232, 223, 209, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#C84F36";
      ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("✨ MOOD:", photoX + 32, photoY + 40);

      ctx.fillStyle = "#2B1F17";
      ctx.font = "900 13px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(analysis.mood.toUpperCase(), photoX + 102, photoY + 40);

      // Bark Energy Level Badge (Top Right)
      ctx.fillStyle = "rgba(43, 31, 23, 0.9)";
      ctx.beginPath();
      ctx.roundRect(photoX + photoW - 170, photoY + 16, 154, 38, 19);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(`⚡ ENERGY: ${analysis.barkEnergy}%`, photoX + photoW - 152, photoY + 40);

      // Overlaid Dog Identity on photo bottom
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 28px 'Fraunces', Georgia, serif";
      ctx.fillText(analysis.dogAlias, photoX + 24, photoY + photoH - 42);

      ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
      ctx.font = "600 14px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(analysis.moodSubtitle, photoX + 24, photoY + photoH - 18);

      // 5. Passport Metadata Grid & Text Section
      let currentY = photoY + photoH + 28;

      // Breed & Physical Identification Card
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.roundRect(photoX, currentY, photoW, 58, 14);
      ctx.fill();
      ctx.strokeStyle = "#E8DFD1";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#E06D53";
      ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("IDENTIFIED BREED & ATTRIBUTES:", photoX + 18, currentY + 22);

      ctx.fillStyle = "#2B1F17";
      ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
      const breedSummary =
        analysis.breedIdentification.length > 70
          ? analysis.breedIdentification.slice(0, 68) + "…"
          : analysis.breedIdentification;
      ctx.fillText(breedSummary, photoX + 18, currentY + 44);

      currentY += 72;

      // Inner Monologue Quote Box
      const quoteBoxH = 135;
      ctx.fillStyle = "#FAF5EE";
      ctx.beginPath();
      ctx.roundRect(photoX, currentY, photoW, quoteBoxH, 16);
      ctx.fill();
      ctx.strokeStyle = "#E06D53";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Quote label & icon
      ctx.fillStyle = "#C84F36";
      ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("💬 VERIFIED INNER MONOLOGUE / TRANSLATION:", photoX + 20, currentY + 28);

      // Quote text
      ctx.fillStyle = "#2B1F17";
      ctx.font = "italic bold 19px 'Fraunces', Georgia, serif";
      wrapText(ctx, `"${analysis.innerThought}"`, photoX + 20, currentY + 60, photoW - 40, 26);

      currentY += quoteBoxH + 22;

      // 6. Traits Pills & Bark Profile Bar
      ctx.fillStyle = "#7A6A5E";
      ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(`CANINE TRAITS: ${analysis.traits.join("   •   ")}`, photoX + 4, currentY);

      // Official Stamp Seal Bottom Right
      ctx.save();
      ctx.translate(width - 130, height - 90);
      ctx.rotate(-0.1);
      ctx.strokeStyle = "#C84F36";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#C84F36";
      ctx.font = "900 9px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BARKLOG AI", 0, -10);
      ctx.fillText("★ CERTIFIED ★", 0, 4);
      ctx.fillText("PASSPORT", 0, 18);
      ctx.restore();

      // 7. Footer
      ctx.fillStyle = "#8C7D72";
      ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "start";
      ctx.fillText("Generated with BarkLog AI & Google Gemini Vision", photoX + 4, height - 52);
      ctx.fillStyle = "#A8988B";
      ctx.font = "11px monospace";
      ctx.fillText("ai.studio/build", photoX + 4, height - 36);

      try {
        setDownloadUrl(canvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("Canvas toDataURL security notice:", err);
      }
      setIsGenerating(false);
    };

    // Load and render dog image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      drawCard(img);
    };
    img.onerror = () => {
      drawCard(null);
    };
    img.src = imageUrl;
  }, [analysis, imageUrl]);

  // Canvas text wrap helper
  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `barklog-passport-${(analysis.dogAlias || "dog").toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  };

  const handleCopyLinkOrShare = async () => {
    if (!downloadUrl) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden max-w-xl w-full shadow-2xl border border-[#E8DFD1] flex flex-col my-4 sm:my-8 max-h-[95vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD1] flex items-center justify-between bg-[#FAF7F2] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E06D53] to-[#C84F36] text-white flex items-center justify-center shadow-md shadow-[#E06D53]/20">
              <Dog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-[#2B1F17] leading-tight">
                Doggo Souvenir Passport Card
              </h3>
              <p className="text-[11px] text-[#7A6A5E] font-medium hidden sm:block">
                High-Resolution PNG Ready to Download and Share
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-passport-modal"
            className="p-2 rounded-full hover:bg-black/5 text-[#7A6A5E] hover:text-[#2B1F17] transition-colors cursor-pointer"
            aria-label="Close Passport"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Canvas Preview Frame */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-[#F5EFE6] overflow-y-auto">
          <div className="relative group max-w-[340px] sm:max-w-[380px] w-full">
            <canvas
              ref={canvasRef}
              className="w-full rounded-2xl shadow-2xl border-2 border-[#DFD5C6] bg-white transition-transform duration-300 group-hover:scale-[1.01]"
            />
            {isGenerating && (
              <div className="absolute inset-0 bg-[#FAF7F2]/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 text-[#E06D53] animate-spin" />
                <p className="text-xs text-[#7A6A5E] font-bold">
                  Rendering Canine Passport...
                </p>
              </div>
            )}
          </div>
          <p className="text-[11px] text-[#8C7D72] mt-3 font-medium text-center">
            📸 Aspect-ratio normalized high-resolution PNG (800 × 1000 px)
          </p>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#E8DFD1] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#DFD5C6] text-xs sm:text-sm font-bold text-[#5A493E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={!downloadUrl || isGenerating}
              id="btn-download-passport-png"
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#E06D53] hover:bg-[#C84F36] disabled:opacity-50 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Passport PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
