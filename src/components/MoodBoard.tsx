import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Smile, Flame, Moon, Search, Utensils, Zap, Quote, Heart, Volume2, Dog } from "lucide-react";
import { playRealisticDogBark } from "../utils/audioSynth";

export interface MoodConfig {
  name: string;
  badge: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  staggeredLines: string[];
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  dogName: string;
  dogBreed: string;
  dogImageUrl: string;
  dogQuote: string;
  vibeTag: string;
  vibeDescription: string;
}

export const MOOD_THEMES: Record<string, MoodConfig> = {
  Suspicious: {
    name: "Suspicious",
    badge: "Side-Eye Mode",
    bgGradient: "from-[#FFF8E7] via-[#FFF3D1] to-[#FCECC2]",
    borderColor: "border-[#E5C978]",
    textColor: "text-[#5C4509]",
    accentColor: "bg-[#D9A322] text-white",
    staggeredLines: ["I'm", "Suspicious.", "What", "Is", "That?"],
    subtitle: "Triangulating suspicious human activities and hidden treat locations.",
    icon: Search,
    dogName: "Luna",
    dogBreed: "Siberian Husky",
    dogImageUrl: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=600&q=80",
    dogQuote: "I saw you hide that bacon behind the broccoli. Don't test me.",
    vibeTag: "Side-Eye Radar 98%",
    vibeDescription: "Calculates every sneaky move near the kitchen. Master of side-eye skepticism.",
  },
  Tired: {
    name: "Tired",
    badge: "Couch Potato State",
    bgGradient: "from-[#F3F4F9] via-[#E8EBF5] to-[#DDE1EE]",
    borderColor: "border-[#C5CCE4]",
    textColor: "text-[#3D4665]",
    accentColor: "bg-[#5D6B99] text-white",
    staggeredLines: ["I'm", "Tired.", "Such", "A", "Long Day."],
    subtitle: "Exhausted from doing absolutely nothing all afternoon.",
    icon: Moon,
    dogName: "Barnaby",
    dogBreed: "English Bulldog",
    dogImageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80",
    dogQuote: "I have been awake for twelve minutes and demand an immediate 4-hour nap.",
    vibeTag: "0% Battery Level",
    vibeDescription: "Heavy cushion-melting physics. Zero energy for running, only competitive snoring.",
  },
  "Pure Joy": {
    name: "Pure Joy",
    badge: "100% Zoomies",
    bgGradient: "from-[#FFF9E6] via-[#FFF1C2] to-[#FFE599]",
    borderColor: "border-[#F2C94C]",
    textColor: "text-[#6E4B02]",
    accentColor: "bg-[#F2994A] text-white",
    staggeredLines: ["I'm", "Ecstatic.", "Where", "Is", "The Ball?"],
    subtitle: "Vibrating at maximum golden retriever happiness frequencies.",
    icon: Smile,
    dogName: "Buster",
    dogBreed: "Golden Retriever",
    dogImageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
    dogQuote: "Best day of my life! Everything is a ball and everyone is my best friend!",
    vibeTag: "100% Zoomies",
    vibeDescription: "Unfiltered full-face sunshine grin with tail wagging at ultrasonic velocity.",
  },
  "Pure Chaos": {
    name: "Pure Chaos",
    badge: "Chaos Demon",
    bgGradient: "from-[#FFF0EC] via-[#FFE2D9] to-[#FFCCC0]",
    borderColor: "border-[#F29C85]",
    textColor: "text-[#6E2A1A]",
    accentColor: "bg-[#E05338] text-white",
    staggeredLines: ["I'm", "Pure Chaos.", "Fear", "My", "Might!"],
    subtitle: "Ready to conquer the living room at 300 miles per hour.",
    icon: Flame,
    dogName: "Pip",
    dogBreed: "Chihuahua Mix",
    dogImageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
    dogQuote: "I am a fearsome apex predator! Tremble before my mighty 3-pound squeak!",
    vibeTag: "Chaos Factor 10/10",
    vibeDescription: "A pocket hurricane running on 99% adrenaline, sonic squeaks, and zero fear.",
  },
  "Snack Alert": {
    name: "Snack Alert",
    badge: "Cheese Tax Due",
    bgGradient: "from-[#FFF5EB] via-[#FFEADB] to-[#FED9C0]",
    borderColor: "border-[#F5B584]",
    textColor: "text-[#6B3B11]",
    accentColor: "bg-[#E07A2B] text-white",
    staggeredLines: ["I", "Hear", "Cheese.", "Pay", "The Tax."],
    subtitle: "The refrigerator door clicked 3 rooms away and payment is due.",
    icon: Utensils,
    dogName: "Waffles",
    dogBreed: "Pembroke Welsh Corgi",
    dogImageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80",
    dogQuote: "The refrigerator door clicked. You owe the cheese tax immediately.",
    vibeTag: "Cheese Tax Due",
    vibeDescription: "Aerodynamic radar ears locked onto high-frequency treat bag crinkles.",
  },
  Philosophical: {
    name: "Philosophical",
    badge: "Deep Thinker",
    bgGradient: "from-[#F2F7F2] via-[#E4ECE4] to-[#D5E1D5]",
    borderColor: "border-[#AFC5AF]",
    textColor: "text-[#2B442B]",
    accentColor: "bg-[#4A704A] text-white",
    staggeredLines: ["I", "Ponder", "The", "Stick", "Dimension."],
    subtitle: "Contemplating the eternal question: who truly is the good boy?",
    icon: Zap,
    dogName: "Milo",
    dogBreed: "Mystery Mutt",
    dogImageUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80",
    dogQuote: "If a stick falls in the woods and nobody fetches it, who is truly the good boy?",
    vibeTag: "Zen Stick Master",
    vibeDescription: "Deep existential thinker pondering the metaphysical mystery of the universe.",
  },
};

interface MoodBoardProps {
  currentMood?: string;
  customLines?: string[];
  customSubtitle?: string;
  onSelectPresetMood?: (mood: string) => void;
  isAnalyzing?: boolean;
  soundEnabled?: boolean;
}

export const MoodBoard: React.FC<MoodBoardProps> = ({
  currentMood = "Suspicious",
  customLines,
  customSubtitle,
  onSelectPresetMood,
  isAnalyzing = false,
  soundEnabled = true,
}) => {
  const [isBarking, setIsBarking] = useState(false);

  // Normalize mood key or fallback to closest match
  const matchedKey =
    Object.keys(MOOD_THEMES).find(
      (k) => k.toLowerCase() === currentMood.toLowerCase() || currentMood.toLowerCase().includes(k.toLowerCase())
    ) || "Suspicious";

  const theme = MOOD_THEMES[matchedKey] || MOOD_THEMES.Suspicious;
  const linesToRender = customLines && customLines.length > 0 ? customLines : theme.staggeredLines;
  const subtitleToRender = customSubtitle || theme.subtitle;
  const IconComponent = theme.icon;

  const handleDogSoundClick = () => {
    if (!soundEnabled) return;
    setIsBarking(true);

    let customPrompt: string | undefined = undefined;
    if (theme.dogName.toLowerCase() === "pip") {
      // Swapped with Milo's sound effect
      customPrompt = "Authentic mellow warm resonant mid-pitch dog bark boof sound effect with gentle friendly acoustic timber and soft tail resonance, calm happy dog woof";
    } else if (theme.dogName.toLowerCase() === "milo") {
      // Swapped with Pip's sound effect
      customPrompt = "Realistic high-pitched Chihuahua dog rapid frantic yip yip barking sound effect with fast sharp treble bursts and feisty toy dog excitement";
    }

    playRealisticDogBark({
      breed: theme.dogBreed,
      mood: theme.name,
      dogAlias: theme.dogName,
      dogSize: theme.dogName.toLowerCase() === "pip" ? "medium" : theme.dogName.toLowerCase() === "milo" ? "tiny" : undefined,
      prompt: customPrompt,
    });
    setTimeout(() => setIsBarking(false), 1400);
  };

  const handlePresetClick = (moodKey: string) => {
    onSelectPresetMood?.(moodKey);
    const targetTheme = MOOD_THEMES[moodKey];
    if (soundEnabled && targetTheme) {
      let customPrompt: string | undefined = undefined;
      if (targetTheme.dogName.toLowerCase() === "pip") {
        // Swapped with Milo's sound effect
        customPrompt = "Authentic mellow warm resonant mid-pitch dog bark boof sound effect with gentle friendly acoustic timber and soft tail resonance, calm happy dog woof";
      } else if (targetTheme.dogName.toLowerCase() === "milo") {
        // Swapped with Pip's sound effect
        customPrompt = "Realistic high-pitched Chihuahua dog rapid frantic yip yip barking sound effect with fast sharp treble bursts and feisty toy dog excitement";
      }

      playRealisticDogBark({
        breed: targetTheme.dogBreed,
        mood: targetTheme.name,
        dogAlias: targetTheme.dogName,
        dogSize: targetTheme.dogName.toLowerCase() === "pip" ? "medium" : targetTheme.dogName.toLowerCase() === "milo" ? "tiny" : undefined,
        prompt: customPrompt,
      });
    }
  };

  return (
    <div className="w-full relative">
      {/* Container with dynamic mood background */}
      <motion.div
        layout
        className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-5 sm:p-7 md:p-8 bg-gradient-to-br ${theme.bgGradient} border-2 ${theme.borderColor} shadow-sm transition-colors duration-700`}
      >
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

        {/* Top Header Badge & Preset Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-3 sm:gap-2.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-full text-xs font-bold shadow-xs mr-1 sm:mr-0 shrink-0 ${theme.accentColor}`} title={theme.badge}>
              <IconComponent className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{theme.badge}</span>
            </span>
            <span className="text-xs font-semibold text-[#665548] tracking-wider uppercase">
              Live Dog Mood Board
            </span>
          </div>

          {/* Interactive Preset Chips for testing and previewing vibes */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#7A6A5E] hidden lg:inline mr-1">
              Preview Vibe:
            </span>
            {Object.keys(MOOD_THEMES).map((moodKey) => {
              const isSelected = matchedKey === moodKey;
              return (
                <button
                  key={moodKey}
                  onClick={() => handlePresetClick(moodKey)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#2B1F17] text-white shadow-sm scale-105"
                      : "bg-white/70 hover:bg-white text-[#57483D] border border-black/5 hover:border-black/10"
                  }`}
                >
                  {moodKey}
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Content Area: Staggered Typographic Text (Left) + Dog Vibe Picture (Right, Tablet & PC Only) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-2 md:py-3 relative z-10">
          {/* Left Column: Typographic Staggered Text (Full width on Mobile, Spanning 7-8 cols on Tablet/PC) */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMood + linesToRender.join("-")}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-1 sm:gap-2"
              >
                {linesToRender.map((line, idx) => {
                  // Stagger font size and indentation for high-craft artistic poetry
                  const fontSizes = [
                    "text-2xl sm:text-3xl md:text-4xl font-normal",
                    "text-4xl sm:text-5xl md:text-6xl font-black tracking-tight",
                    "text-2xl sm:text-3xl md:text-4xl font-semibold italic",
                    "text-3xl sm:text-4xl md:text-5xl font-bold",
                    "text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight",
                  ];
                  const fontSizeClass = fontSizes[idx % fontSizes.length];

                  // Indentation styling
                  const indents = ["pl-0", "pl-3 sm:pl-6", "pl-1 sm:pl-3", "pl-6 sm:pl-12", "pl-3 sm:pl-8"];
                  const indentClass = indents[idx % indents.length];

                  return (
                    <motion.div
                      key={`${line}-${idx}`}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.35 }}
                      className={`${indentClass} ${fontSizeClass} ${theme.textColor} font-display leading-[1.06] select-none`}
                    >
                      {line}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Dog Vibe Picture & Explanation
              NOTE: As specified, this is ONLY rendered in Tablet & PC format (hidden on Mobile format) */}
          <div className="hidden md:flex md:col-span-5 lg:col-span-5 flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={theme.name}
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ duration: 0.4 }}
                onClick={handleDogSoundClick}
                className="w-full max-w-[320px] bg-white/80 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-md shadow-black/5 flex flex-col gap-3 group hover:bg-white hover:shadow-lg transition-all cursor-pointer relative"
                title="Click to hear realistic dog bark sound effect!"
              >
                {/* Dog Image with Mood Aura */}
                <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-gray-100 shadow-inner">
                  <img
                    src={theme.dogImageUrl}
                    alt={`${theme.dogName} the ${theme.dogBreed} representing ${theme.name} mood`}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isBarking ? "scale-110" : "group-hover:scale-105"
                    }`}
                  />
                  {/* Floating Mood Tag */}
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{theme.vibeTag}</span>
                  </div>

                  {/* Sound FX indicator badge */}
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-[#2B1F17]/80 backdrop-blur-sm text-amber-200 text-[10px] font-bold flex items-center gap-1 shadow-sm group-hover:bg-[#E06D53] group-hover:text-white transition-colors">
                    <Volume2 className={`w-3 h-3 ${isBarking ? "animate-bounce text-white" : ""}`} />
                    <span>{isBarking ? "Barking..." : "Bark FX"}</span>
                  </div>

                  {/* Dog Name Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[#2B1F17] text-[10px] font-bold shadow-xs">
                    {theme.dogName} • {theme.dogBreed}
                  </div>
                </div>

                {/* Vibe Explanation & Thought Bubble */}
                <div className="space-y-1.5 px-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2B1F17] flex items-center gap-1">
                      <IconComponent className="w-3 h-3 text-[#E06D53]" />
                      Vibe: {theme.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[#8C7D72] flex items-center gap-1">
                      <Dog className="w-3 h-3 text-[#E06D53]" />
                      Click for Bark
                    </span>
                  </div>

                  {/* Inner Thought Quote */}
                  <p className="text-[11px] text-[#2B1F17] font-semibold italic bg-[#FAF7F2] p-2 rounded-lg border border-[#E8DFD1] leading-snug">
                    "{theme.dogQuote}"
                  </p>

                  {/* Why this dog explains this vibe */}
                  <p className="text-[10px] text-[#7A6A5E] leading-relaxed">
                    {theme.vibeDescription}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Subtitle & Status Bottom Bar */}
        <div className="mt-5 pt-3.5 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10 text-xs text-[#5C4D42]">
          <p className="font-medium max-w-xl">
            {isAnalyzing ? (
              <span className="flex items-center gap-1.5 text-[#C84F36] font-bold animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini Vision is deciphering dog facial expression & body language...
              </span>
            ) : (
              subtitleToRender
            )}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7A6A5E]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>AI Mood Synchronized</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
