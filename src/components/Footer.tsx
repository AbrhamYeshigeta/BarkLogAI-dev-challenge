import React from "react";
import {
  Dog,
  Sparkles,
  History,
  ArrowUp,
  Info,
  Shuffle,
  Shield,
  Heart,
} from "lucide-react";
import { SampleDog } from "../types";
import { SAMPLE_DOGS } from "../data/sampleDogs";

interface FooterProps {
  onOpenAbout: () => void;
  onOpenHistory: () => void;
  onSelectSampleDog: (dog: SampleDog) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenHistory,
  onSelectSampleDog,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRandomDog = () => {
    const randomSample = SAMPLE_DOGS[Math.floor(Math.random() * SAMPLE_DOGS.length)];
    onSelectSampleDog(randomSample);
    scrollToTop();
  };

  return (
    <footer className="w-full bg-[#1C1613] border-t border-[#362A22] text-[#D8CABE] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Brand Identity & Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E06D53] text-white flex items-center justify-center shadow-xs">
              <Dog className="w-4 h-4" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-display font-extrabold text-sm text-[#FBF6EE] tracking-tight">
                BarkLog AI
              </span>
              <span className="hidden sm:inline text-[#6C5B4E]">•</span>
              <span className="text-[11px] text-[#A8988B]">
                Multimodal Canine Vision & Voice Lab
              </span>
            </div>
          </div>

          {/* Center: Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-[#C4B5A5]">
            <button
              onClick={onOpenAbout}
              id="footer-link-about"
              className="inline-flex items-center gap-1.5 hover:text-[#E06D53] transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-[#E06D53]" />
              <span>About Us</span>
            </button>

            <button
              onClick={handleRandomDog}
              id="footer-link-surprise"
              className="inline-flex items-center gap-1.5 hover:text-[#E06D53] transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#E06D53]" />
              <span>Surprise Dog</span>
            </button>

            <button
              onClick={onOpenHistory}
              id="footer-link-history"
              className="inline-flex items-center gap-1.5 hover:text-[#E06D53] transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-[#E06D53]" />
              <span>Scan History</span>
            </button>
          </div>

          {/* Right: Back to top & Copyright */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#867567] hidden lg:inline">
              © {new Date().getFullYear()} BarkLog AI
            </span>
            <button
              onClick={scrollToTop}
              id="footer-btn-back-to-top"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2B211B] hover:bg-[#3B2E26] border border-[#44352B] text-xs font-medium text-[#EBE0D5] hover:text-white transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5 text-[#E06D53]" />
              <span>Top</span>
            </button>
          </div>
        </div>

        {/* Subtle Bottom Credit Line */}
        <div className="mt-4 pt-3 border-t border-[#2D211A] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A695C] gap-2">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3 h-3 text-[#E06D53] fill-[#E06D53]" />
            <span>Built with Gemini Vision AI for dog lovers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>Client-side Privacy Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
