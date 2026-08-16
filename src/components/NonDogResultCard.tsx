import React from "react";
import { XCircle, Camera, RefreshCw, Sparkles, Dog, ArrowLeft, AlertTriangle } from "lucide-react";
import { SAMPLE_DOGS } from "../data/sampleDogs";
import { SampleDog } from "../types";

interface NonDogResultCardProps {
  imageUrl: string;
  onReset: () => void;
  onForceAnalyze: () => void;
  onSelectSampleDog: (dog: SampleDog) => void;
}

export const NonDogResultCard: React.FC<NonDogResultCardProps> = ({
  imageUrl,
  onReset,
  onForceAnalyze,
  onSelectSampleDog,
}) => {
  return (
    <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-amber-500 via-[#E06D53] to-red-500 p-4 sm:p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-lg sm:text-xl tracking-tight">
                Dog Detector: NO
              </h3>
              <span className="bg-black/25 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Verification Result
              </span>
            </div>
            <p className="text-xs text-white/90">
              No canine subject was detected in this photo.
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Try Another</span>
        </button>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left column: Scanned image with Detector stamp */}
        <div className="md:col-span-5 relative rounded-2xl overflow-hidden bg-[#2B1F17] aspect-square max-h-[320px] mx-auto w-full border border-[#E8DFD1] shadow-inner">
          <img
            src={imageUrl}
            alt="Scanned Upload"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
            <div className="px-4 py-2 rounded-xl bg-red-600/90 text-white font-display font-black text-sm uppercase tracking-wider shadow-lg border border-red-400/50 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>Dog Detected: NO</span>
            </div>
            <p className="text-[11px] text-white/80 mt-2 max-w-[200px]">
              Canine detection criteria not met
            </p>
          </div>
        </div>

        {/* Right column: Explanation and Quick Actions */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-2">
            <h4 className="font-display font-bold text-xl text-[#2B1F17]">
              Canine Detection Rules
            </h4>
            <p className="text-xs sm:text-sm text-[#6A5A4E] leading-relaxed">
              The AI Dog Detector evaluated this image under the strict canine classification protocol:
            </p>

            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1] text-xs space-y-1 text-[#5C4A3E]">
              <div className="flex items-center gap-2 font-medium">
                <span className="text-emerald-700 font-bold">✓ YES:</span>
                <span>Real dogs, toy dogs, cartoon dogs, or dogs with other animals</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span className="text-red-700 font-bold">✗ NO:</span>
                <span>Images with no dog or canine subject</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onReset}
              className="flex-1 px-5 py-3 rounded-2xl bg-[#E06D53] hover:bg-[#C84F36] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#E06D53]/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Upload A Dog Photo</span>
            </button>

            <button
              onClick={onForceAnalyze}
              className="px-4 py-3 rounded-2xl bg-white hover:bg-[#FAF7F2] border border-[#D8C9B8] text-[#5C4533] text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              title="Force Gemini to analyze this image anyway"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#E06D53]" />
              <span>Force Analysis Anyway</span>
            </button>
          </div>

          {/* Sample Dog Quick Suggestions */}
          <div className="pt-2 border-t border-[#E8DFD1] space-y-2">
            <span className="text-[11px] font-bold text-[#8C7D72] uppercase tracking-wider">
              Or test with a sample dog:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_DOGS.slice(0, 3).map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => onSelectSampleDog(dog)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF1E4] hover:bg-[#F5E6D3] border border-[#DFC9AB] text-xs font-semibold text-[#6C4E28] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Dog className="w-3.5 h-3.5 text-[#E06D53]" />
                  <span>{dog.name} ({dog.breed})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
