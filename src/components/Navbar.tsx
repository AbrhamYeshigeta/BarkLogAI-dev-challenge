import React from "react";
import { Dog, Volume2, VolumeX, History, Info } from "lucide-react";

interface NavbarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAbout: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenAbout,
  onOpenHistory,
  historyCount,
  onGoHome,
}) => {
  const handleLogoClick = () => {
    onGoHome();
  };

  return (
    <header className="w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD1] sticky top-0 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo - Returns to Homepage */}
        <button
          onClick={handleLogoClick}
          className="group flex items-center gap-2.5 text-left focus:outline-none transition-transform active:scale-95 cursor-pointer"
          title="Return to BarkLog AI Homepage"
          aria-label="BarkLog AI Homepage"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E06D53] to-[#C84F36] text-white flex items-center justify-center shadow-md shadow-[#E06D53]/20 group-hover:rotate-6 transition-transform shrink-0">
            <Dog className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xl tracking-tight text-[#2B1F17]">
                BarkLog
              </span>
              <span className="bg-[#E06D53]/10 text-[#C84F36] text-xs font-bold px-1.5 py-0.5 rounded-md border border-[#E06D53]/20">
                AI
              </span>
            </div>
            <p className="text-[11px] text-[#7A6A5E] font-medium">
              Dog Vision & Dramatic Voice Narrator
            </p>
          </div>
        </button>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle (Icon Only) */}
          <button
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
              soundEnabled
                ? "bg-[#FAF1E4] border-[#DFC9AB] text-[#8C5E2E] hover:bg-[#F5E6D3]"
                : "bg-white border-[#E8DFD1] text-[#9A8B80] hover:bg-[#F4EFE6]"
            }`}
            title={soundEnabled ? "Sound FX: Enabled (Click to mute)" : "Sound FX: Muted (Click to enable)"}
            aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#C84F36]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* About Us Button */}
          <button
            onClick={onOpenAbout}
            id="btn-nav-about-us"
            className="flex items-center gap-1.5 p-2.5 sm:px-3 sm:py-2 rounded-xl bg-white border border-[#E8DFD1] text-xs font-bold text-[#4A3A2F] hover:bg-[#F9F5F0] hover:border-[#D4C3B0] shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="About BarkLog AI & Features"
            aria-label="About Us"
          >
            <Info className="w-4 h-4 text-[#E06D53]" />
            <span className="hidden sm:inline">About Us</span>
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="relative p-2 rounded-xl bg-white border border-[#E8DFD1] text-[#4A3A2F] hover:bg-[#F9F5F0] transition-all active:scale-95 cursor-pointer"
            title="View Doggo History"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E06D53] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {historyCount > 9 ? "9+" : historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
