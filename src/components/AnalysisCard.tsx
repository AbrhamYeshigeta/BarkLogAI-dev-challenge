import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Download,
  Share2,
  Check,
  RefreshCw,
  Dog,
  Zap,
  Tag,
  Heart,
  Music,
  Smile,
  AudioWaveform,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Scan,
  X,
  Eye,
  Move,
} from "lucide-react";
import { BarkAnalysis, VoicePersona } from "../types";
import {
  DogNarrator,
  VOICE_PERSONAS,
  playBarkSound,
  playHappyChime,
  resolveDogAcoustics,
} from "../utils/audioSynth";
import confetti from "canvas-confetti";

interface AnalysisCardProps {
  analysis: BarkAnalysis;
  imageUrl: string;
  onReset: () => void;
  onOpenExportModal: () => void;
  soundEnabled: boolean;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  imageUrl,
  onReset,
  onOpenExportModal,
  soundEnabled,
}) => {
  // Voice Persona State
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(VOICE_PERSONAS[0]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isBarking, setIsBarking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isElevenLabsActive, setIsElevenLabsActive] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>(imageUrl);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [hasImgError, setHasImgError] = useState<boolean>(false);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Photo Frame Zoom, Fit & Pan States
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  useEffect(() => {
    setImgSrc(imageUrl);
    setImgLoaded(false);
    setHasImgError(false);
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }, [imageUrl]);

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3.0));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => {
      const next = Math.max(Number((prev - 0.25).toFixed(2)), 0.75);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleFitMode = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFitMode((prev) => (prev === "cover" ? "contain" : "cover"));
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag-to-pan handlers for zoomed-in photos
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Calculated acoustic profile
  const acoustics = resolveDogAcoustics(analysis);

  // Play personalized bark conditioned on dog size, emotion, energy
  const handlePlayCustomBark = () => {
    if (!soundEnabled) return;
    setIsBarking(true);
    playBarkSound(analysis);
    setTimeout(() => setIsBarking(false), (acoustics.pulses * acoustics.pulseGap) + 300);
  };

  // Check if ElevenLabs is configured on backend
  useEffect(() => {
    fetch("/api/voice-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.elevenLabsConfigured) {
          setIsElevenLabsActive(true);
        }
      })
      .catch(() => {});
  }, []);

  // Typewriter effect states
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const fullText = analysis.fullResponse || `${analysis.breedIdentification} ${analysis.innerThought}`;

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#E06D53", "#F2A365", "#ECC94B", "#48BB78", "#9F7AEA"],
      });
    } catch {
      // ignore
    }

    if (soundEnabled) {
      playHappyChime();
    }
  }, [analysis, soundEnabled]);

  // Typewriter Effect
  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let index = 0;
    const speed = 22; // ms per character

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [fullText]);

  // Clean up any timeouts or speech on unmount
  useEffect(() => {
    return () => {
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
      DogNarrator.stop();
    };
  }, []);

  // Handle Play Voice: Plays canine bark sound effect conditioned on the dog's picture before the human monologue
  const handleToggleVoice = () => {
    if (isSpeaking || voiceTimeoutRef.current) {
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
        voiceTimeoutRef.current = null;
      }
      DogNarrator.stop();
      setIsSpeaking(false);
      setIsBarking(false);
    } else {
      // 1. Play the dog's acoustic/synthesized bark sound effect matched to its breed, size, mood, and photo!
      playBarkSound(analysis);
      setIsBarking(true);
      setTimeout(() => setIsBarking(false), (acoustics.pulses * acoustics.pulseGap) + 300);

      // Trigger mini celebratory confetti burst
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {}

      setIsSpeaking(true);

      // 2. Begin human voice inner monologue right after the canine bark introduction
      const barkDelay = Math.max(380, (acoustics.pulses * acoustics.pulseGap) + 120);

      voiceTimeoutRef.current = setTimeout(() => {
        voiceTimeoutRef.current = null;
        DogNarrator.speak(analysis.innerThought || fullText, selectedPersona, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => {
            setIsSpeaking(false);
            setIsBarking(false);
          },
          onError: () => {
            setIsSpeaking(false);
            setIsBarking(false);
          },
        });
      }, barkDelay);
    }
  };

  // Copy text handler
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(
        `🐕 BarkLog AI Analysis:\n${analysis.breedIdentification}\n\n💬 Inner Monologue:\n"${analysis.innerThought}"\n\n⚡ Bark Energy: ${analysis.barkEnergy}% (${analysis.energyCategory})\n🏷️ Mood: ${analysis.mood}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Bark Energy Level Color Calculator
  const getEnergyColor = (energy: number) => {
    if (energy <= 20) return { bar: "from-[#63B3ED] to-[#4299E1]", text: "text-[#2B6CB0]", bg: "bg-blue-50" };
    if (energy <= 40) return { bar: "from-[#68D391] to-[#38A169]", text: "text-[#276749]", bg: "bg-emerald-50" };
    if (energy <= 60) return { bar: "from-[#F6E05E] to-[#ECC94B]", text: "text-[#975A16]", bg: "bg-amber-50" };
    if (energy <= 80) return { bar: "from-[#F6AD55] to-[#DD6B20]", text: "text-[#C05621]", bg: "bg-orange-50" };
    return { bar: "from-[#FC8181] to-[#E53E3E]", text: "text-[#9B2C2C]", bg: "bg-red-50" };
  };

  const energyColors = getEnergyColor(analysis.barkEnergy);

  return (
    <div className="w-full space-y-3">
      {/* Top Left Arrow Return Button */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onReset}
          id="btn-analysis-back-top"
          className="group inline-flex items-center justify-center p-2 sm:px-3 sm:py-2 rounded-2xl bg-white border border-[#E8DFD1] hover:border-[#E06D53] hover:bg-[#FAF7F2] text-[#2B1F17] hover:text-[#E06D53] shadow-xs transition-all active:scale-95 cursor-pointer gap-2"
          title="Return to Home"
          aria-label="Return to Home"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#E06D53] group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold text-[#5C4533] group-hover:text-[#E06D53]">Back to Home</span>
        </button>
      </div>

      {/* Main Analysis Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl border border-[#E8DFD1] shadow-xl overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Dog Photo & Badges in a Polished Frame with Interactive Zoom & Fit */}
          <div
            className={`lg:col-span-5 relative bg-[#1A120D] flex flex-col justify-between overflow-hidden aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-full min-h-[300px] sm:min-h-[380px] select-none ${
              zoomLevel > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Ambient Blurred Background (especially striking in Contain fitMode) */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <img
                src={imgSrc}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover blur-2xl scale-125 opacity-40 brightness-75"
              />
            </div>

            {/* Foreground Main Dog Image with Live Transform (Zoom & Pan) */}
            <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
              <img
                src={imgSrc}
                alt={analysis.dogAlias || "Analyzed Dog"}
                referrerPolicy="no-referrer"
                loading="eager"
                onLoad={() => setImgLoaded(true)}
                onError={() => {
                  if (!hasImgError) {
                    setHasImgError(true);
                    setImgSrc("https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80");
                  }
                }}
                style={{
                  transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`,
                  transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.2, 0, 0, 1)",
                }}
                className={`w-full h-full ${
                  fitMode === "cover" ? "object-cover" : "object-contain"
                } object-center ${
                  imgLoaded ? "opacity-100" : "opacity-40 blur-xs"
                }`}
              />
              {/* Dual-layer Vignette & Scrim for Pristine Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#150D08]/95 via-[#150D08]/20 to-black/35 pointer-events-none" />
              {/* Subtle inner border for crisp edge refinement */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/15 pointer-events-none" />
            </div>

            {/* Overlaid Badges & Interactive Photo Frame Controls (Top) */}
            <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between gap-2 flex-wrap">
              {/* Floating Mood Pill */}
              <div className="bg-white/95 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-extrabold text-[#2B1F17] shadow-lg flex items-center gap-1.5 border border-white/80 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#E06D53]" />
                <span className="leading-none">{analysis.mood}</span>
              </div>

              {/* Photo Zoom & Fit Toolset Pill */}
              <div className="bg-black/60 backdrop-blur-md px-1.5 py-1 rounded-full text-white shadow-lg flex items-center gap-0.5 border border-white/20">
                {/* Zoom Out Button */}
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.75}
                  id="btn-photo-zoom-out"
                  className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white/90 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  title="Zoom Out Photo"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                {/* Zoom Level Indicator / Reset */}
                <button
                  onClick={handleResetZoom}
                  id="btn-photo-zoom-reset"
                  className="px-1.5 py-0.5 text-[11px] font-bold text-white/95 hover:text-[#E06D53] hover:bg-white/15 rounded-md transition-colors cursor-pointer"
                  title="Click to reset zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>

                {/* Zoom In Button */}
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3.0}
                  id="btn-photo-zoom-in"
                  className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white/90 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  title="Zoom In Photo"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                {/* Fit Mode Toggle (Fill vs Full Photo) */}
                <button
                  onClick={toggleFitMode}
                  id="btn-photo-fit-mode"
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    fitMode === "contain"
                      ? "bg-[#E06D53] text-white shadow-xs"
                      : "hover:bg-white/20 text-white/90"
                  }`}
                  title={fitMode === "cover" ? "Switch to Full Photo (Contain)" : "Switch to Fill Frame (Cover)"}
                  aria-label="Toggle Fit Mode"
                >
                  <Scan className="w-3.5 h-3.5" />
                </button>

                {/* Fullscreen Lightbox Inspector */}
                <button
                  onClick={() => {
                    setLightboxZoom(1);
                    setIsLightboxOpen(true);
                  }}
                  id="btn-photo-fullscreen"
                  className="p-1.5 rounded-full hover:bg-white/20 active:scale-90 transition-all text-white/90 cursor-pointer"
                  title="Open Fullscreen Lightbox Inspector"
                  aria-label="Fullscreen Photo Inspector"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Overlaid Identity Details & Pan Hint (Bottom) */}
            <div className="relative z-10 p-4 sm:p-6 text-white space-y-1">
              {zoomLevel > 1 && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/90 mb-1 border border-white/20 animate-pulse">
                  <Move className="w-3 h-3 text-[#E06D53]" />
                  <span>Drag to pan photo</span>
                </div>
              )}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/95 mb-0.5 border border-white/15">
                  <span>{analysis.energyCategory || "Canine Profile"}</span>
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-white tracking-tight leading-tight drop-shadow-md">
                  {analysis.dogAlias}
                </h3>
                <p className="text-xs sm:text-sm text-white/90 font-medium drop-shadow-sm line-clamp-2 leading-relaxed">
                  {analysis.moodSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Identification, Inner Monologue, Voice & Energy */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
            {/* Top Section: Dog Identification Sentence */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E06D53]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A6A5E]">
                    Gemini Vision Identification
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold tracking-wide">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Dog Detector: YES
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD1] mb-5">
                <p className="text-sm sm:text-base font-semibold text-[#2B1F17] leading-relaxed">
                  {analysis.breedIdentification}
                </p>
              </div>

              {/* Big Speech Bubble with Typewriter Monologue */}
              <div className="relative p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#F0DFCD] shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#E06D53]/10 text-[#C84F36] text-xs font-black uppercase tracking-wider">
                      Inner Monologue
                    </span>
                    {isSpeaking && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 animate-pulse">
                        <Volume2 className="w-3.5 h-3.5" />
                        Speaking now...
                      </span>
                    )}
                  </div>

                  {/* Equalizer waveform animation when speaking */}
                  {isSpeaking && (
                    <div className="flex items-center gap-1 h-4">
                      {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8].map((scale, i) => (
                        <motion.span
                          key={i}
                          animate={{ height: ["4px", `${scale * 16}px`, "4px"] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-1 bg-[#E06D53] rounded-full inline-block"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* The Dialogue Text with Typewriter */}
                <div className="text-base sm:text-lg md:text-xl font-display font-bold text-[#2B1F17] leading-snug min-h-[64px]">
                  <span>"{displayedText}"</span>
                  {isTyping && (
                    <span className="inline-block w-2 h-5 bg-[#E06D53] ml-1 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            </div>

            {/* Middle Section: Voice Narration Controls */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF1E4]/70 border border-[#DFC9AB] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#C84F36]" />
                  <span className="text-xs font-bold text-[#5C4533] uppercase tracking-wider">
                    Voice Narration Engine
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#E8DFD1] text-[#6E5D50] text-[10px] font-semibold">
                    AI Speech Synth
                  </span>
                </div>

                {/* Voice Persona Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#7A6A5E]">Voice:</span>
                  <select
                    value={selectedPersona.id}
                    onChange={(e) => {
                      const found = VOICE_PERSONAS.find((p) => p.id === e.target.value);
                      if (found) setSelectedPersona(found);
                    }}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-white border border-[#DFD5C6] text-[#2B1F17] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
                  >
                    {VOICE_PERSONAS.map((persona) => (
                      <option key={persona.id} value={persona.id}>
                        {persona.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Big Narrate Button */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleToggleVoice}
                  className={`flex-1 min-w-[200px] py-3 px-5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 ${
                    isSpeaking
                      ? "bg-[#C84F36] text-white hover:bg-[#A83821] ring-4 ring-[#E06D53]/30"
                      : "bg-[#2B1F17] hover:bg-[#433227] text-white"
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <Square className="w-4 h-4 fill-white" />
                      <span>Pause Narration</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Listen to Dog Voice ({selectedPersona.name})</span>
                    </>
                  )}
                </button>

                {/* Personalized Dog Bark Sound Effect Button */}
                <button
                  onClick={handlePlayCustomBark}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 ${
                    isBarking
                      ? "bg-[#FAF1E4] border-[#E06D53] text-[#C84F36] ring-2 ring-[#E06D53]/30 scale-102"
                      : "bg-white border-[#DFC9AB] hover:bg-[#F9F5F0] text-[#5C4533]"
                  }`}
                  title={`Play ${analysis.dogAlias}'s Custom Bark (${analysis.barkTypeDescription || `${acoustics.size} canine vocalization`})`}
                >
                  <Dog className={`w-4 h-4 ${isBarking ? "text-[#C84F36] animate-bounce" : "text-[#E06D53]"}`} />
                  <div className="flex flex-col items-start text-left">
                    <span className="leading-tight flex items-center gap-1">
                      {isBarking ? "Barking! 🐾" : "Dog Bark FX"}
                    </span>
                    <span className="text-[10px] text-[#8C7D72] font-semibold leading-tight max-w-[120px] truncate">
                      {analysis.barkTypeDescription || `${acoustics.size} bark`}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Bark Energy Meter */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DFD1] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#DD6B20]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A6A5E]">
                    Bark Energy Meter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${energyColors.bg} ${energyColors.text}`}>
                    {analysis.energyCategory}
                  </span>
                  <span className="font-display font-black text-sm text-[#2B1F17]">
                    {analysis.barkEnergy}%
                  </span>
                </div>
              </div>

              {/* Progress bar with animated glow */}
              <div className="relative w-full h-3.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E8DFD1]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.barkEnergy}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${energyColors.bar} rounded-full`}
                />
              </div>

              <div className="flex justify-between text-[10px] font-bold text-[#8C7D72]">
                <span>Couch Potato (0%)</span>
                <span>Zoomies (50%)</span>
                <span>Chaos Demon (100%)</span>
              </div>
            </div>

            {/* Comedic Character Traits Badges */}
            <div>
              <p className="text-xs font-bold text-[#7A6A5E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#E06D53]" />
                <span>Verified Traits</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.dogSize && (
                  <span className="px-3 py-1 rounded-xl bg-[#FAF1E4] border border-[#E06D53]/30 text-xs font-bold text-[#C84F36] shadow-2xs flex items-center gap-1">
                    🐕 Size: <span className="capitalize">{analysis.dogSize}</span>
                  </span>
                )}
                {analysis.traits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1] text-xs font-bold text-[#4A3A2F] shadow-2xs"
                  >
                    🐾 {trait}
                  </span>
                ))}
                {analysis.favoriteActivity && (
                  <span className="px-3 py-1 rounded-xl bg-[#FFF8E7] border border-[#E5C978] text-xs font-bold text-[#6E4B02] shadow-2xs">
                    🎾 Favorite: {analysis.favoriteActivity}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-[#E8DFD1] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Return Home Button with Left Arrow */}
                <button
                  onClick={onReset}
                  id="btn-analysis-back-bottom"
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-[#DFD5C6] hover:border-[#E06D53] hover:bg-[#FAF7F2] text-[#4A3A2F] hover:text-[#E06D53] text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer group"
                  title="Return to Home"
                  aria-label="Return to Home"
                >
                  <ArrowLeft className="w-4 h-4 text-[#E06D53] group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Home</span>
                </button>

                {/* Export Card Button */}
                <button
                  onClick={onOpenExportModal}
                  className="px-4 py-2.5 rounded-xl bg-[#E06D53] hover:bg-[#C84F36] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download BarkCard</span>
                </button>

                {/* Copy Text Button */}
                <button
                  onClick={handleCopyText}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-[#DFD5C6] hover:bg-[#FAF7F2] text-[#4A3A2F] text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-[#7A6A5E]" />
                      <span>Copy Story</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Photo Lightbox Inspector Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Lightbox Header Bar */}
            <div
              className="w-full max-w-5xl flex items-center justify-between gap-4 text-white z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E06D53] flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-lg text-white">
                      {analysis.dogAlias}
                    </h4>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {analysis.mood}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 hidden sm:block">
                    High-Definition Dog Vision Photo Inspector
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                id="btn-lightbox-close"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90 cursor-pointer"
                title="Close Inspector (Esc)"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Main Image Stage */}
            <div
              className="relative w-full max-w-5xl flex-1 flex items-center justify-center overflow-hidden my-4 cursor-default select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  src={imgSrc}
                  alt={analysis.dogAlias}
                  referrerPolicy="no-referrer"
                  style={{
                    transform: `scale(${lightboxZoom})`,
                    transition: "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
                  }}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                />
              </div>
            </div>

            {/* Lightbox Bottom Controls Bar */}
            <div
              className="w-full max-w-xl bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center justify-between gap-4 text-white z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.75))}
                  disabled={lightboxZoom <= 0.75}
                  id="btn-lightbox-zoom-out"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <span className="text-xs font-bold text-white px-2 min-w-[50px] text-center">
                  {Math.round(lightboxZoom * 100)}%
                </span>

                <button
                  onClick={() => setLightboxZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3.0))}
                  disabled={lightboxZoom >= 3.0}
                  id="btn-lightbox-zoom-in"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setLightboxZoom(1)}
                  id="btn-lightbox-zoom-reset"
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all text-white/90 cursor-pointer"
                  title="Reset Zoom to 100%"
                >
                  Reset
                </button>
              </div>

              {/* Slider for smooth zoom */}
              <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[160px]">
                <input
                  type="range"
                  min="0.75"
                  max="3.0"
                  step="0.05"
                  value={lightboxZoom}
                  onChange={(e) => setLightboxZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#E06D53] cursor-pointer"
                />
              </div>

              {/* Download Photo Button */}
              <a
                href={imgSrc}
                download={`${analysis.dogAlias.toLowerCase().replace(/\s+/g, "_")}_barklog.png`}
                target="_blank"
                rel="noreferrer"
                id="btn-lightbox-download-photo"
                className="px-3.5 py-2 rounded-xl bg-[#E06D53] hover:bg-[#C84F36] text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Photo</span>
              </a>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
