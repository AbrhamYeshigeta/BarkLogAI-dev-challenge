import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dog, Sparkles, AlertCircle, RefreshCw, Heart } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { MoodBoard } from "./components/MoodBoard";
import { PhotoUploader } from "./components/PhotoUploader";
import { AnalysisCard } from "./components/AnalysisCard";
import { NonDogResultCard } from "./components/NonDogResultCard";
import { BarkCardExportModal } from "./components/BarkCardExportModal";
import { AboutModal } from "./components/AboutModal";
import { Footer } from "./components/Footer";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { BarkAnalysis, HistoryItem, SampleDog } from "./types";
import { SAMPLE_DOGS } from "./data/sampleDogs";
import { playHappyChime, preloadAllSampleDogsBarkSounds } from "./utils/audioSynth";

export default function App() {
  // Preload ElevenLabs AI dog barking sound effects for sample dogs on mount
  useEffect(() => {
    preloadAllSampleDogsBarkSounds(SAMPLE_DOGS);
  }, []);

  // Main State
  const [currentAnalysis, setCurrentAnalysis] = useState<BarkAnalysis | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isNonDogResult, setIsNonDogResult] = useState<boolean>(false);
  const [activeMood, setActiveMood] = useState<string>("Suspicious");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("Scanning dog features...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUploadedData, setLastUploadedData] = useState<{ base64: string; previewUrl: string } | null>(null);

  // Sound FX Toggle (default enabled)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("barklog_sound");
    return saved !== null ? saved === "true" : true;
  });

  // Modal states
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("barklog_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save sound setting
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("barklog_sound", String(next));
      return next;
    });
  };

  // Save history to localStorage
  const saveToHistory = (analysis: BarkAnalysis, imageUrl: string) => {
    const newItem: HistoryItem = {
      id: "item-" + Date.now(),
      timestamp: Date.now(),
      imageUrl,
      analysis,
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev.filter((x) => x.imageUrl !== imageUrl)].slice(0, 20);
      localStorage.setItem("barklog_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("barklog_history");
  };

  // Handle Image Upload / Selection
  const handleImageSelected = async (
    base64Data: string,
    previewUrl: string,
    sampleDog?: SampleDog,
    forceAnalysis: boolean = false
  ) => {
    setErrorMessage(null);
    setIsNonDogResult(false);
    setIsLoading(true);
    setCurrentImageUrl(previewUrl);
    setLastUploadedData({ base64: base64Data, previewUrl });

    // If a sample dog is selected, we can use its prompt-compliant analysis directly or send to API
    if (sampleDog) {
      setLoadingStep("Reading " + sampleDog.name + "'s expressive mind...");
      setTimeout(() => {
        setCurrentAnalysis(sampleDog.analysis);
        setActiveMood(sampleDog.analysis.mood);
        setIsLoading(false);
        saveToHistory(sampleDog.analysis, previewUrl);
      }, 1100);
      return;
    }

    // Call server Gemini Vision API
    const loadingSteps = [
      "Analyzing dog breed & estimated age...",
      "Decoding canine facial micro-expressions...",
      "Calculating Bark Energy meter...",
      "Translating inner monologue into dramatic voice...",
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % loadingSteps.length;
      setLoadingStep(loadingSteps[stepIndex]);
    }, 1200);

    try {
      const response = await fetch("/api/analyze-dog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data, forceAnalysis }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let rawError = errorData.error || "Failed to analyze dog image.";
        if (typeof rawError === "string" && rawError.startsWith("{")) {
          try {
            const parsed = JSON.parse(rawError);
            rawError = parsed?.error?.message || parsed?.message || rawError;
          } catch {
            // Keep rawError
          }
        }
        throw new Error(rawError);
      }

      const result = await response.json();
      if (result.success && result.isDog === false) {
        setIsNonDogResult(true);
        setCurrentAnalysis(null);
        return;
      }

      if (result.success && result.data) {
        const analysisData: BarkAnalysis = result.data;
        setCurrentAnalysis(analysisData);
        setActiveMood(analysisData.mood || "Suspicious");
        saveToHistory(analysisData, previewUrl);
      } else {
        throw new Error("Invalid response format from Gemini.");
      }
    } catch (err: unknown) {
      clearInterval(interval);
      console.error("Analysis failure:", err);
      let msg = err instanceof Error ? err.message : "Error analyzing dog photo. Please check your connection.";
      if (msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE")) {
        msg = "The AI model is experiencing high demand. Please click 'Retry Analysis' to run again!";
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastUploadedData) {
      handleImageSelected(lastUploadedData.base64, lastUploadedData.previewUrl);
    }
  };

  const handleReset = () => {
    setCurrentAnalysis(null);
    setCurrentImageUrl(null);
    setIsNonDogResult(false);
    setErrorMessage(null);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setIsNonDogResult(false);
    setCurrentAnalysis(item.analysis);
    setCurrentImageUrl(item.imageUrl);
    setActiveMood(item.analysis.mood);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2B1F17]">
      {/* Top Navigation */}
      <Navbar
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onGoHome={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Dynamic Mood Board */}
        <section aria-label="Dog Mood Board">
          <MoodBoard
            currentMood={activeMood}
            customLines={currentAnalysis?.moodBoardLines}
            customSubtitle={currentAnalysis?.moodSubtitle}
            onSelectPresetMood={(m) => setActiveMood(m)}
            isAnalyzing={isLoading}
            soundEnabled={soundEnabled}
          />
        </section>

        {/* Error Alert Message if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Dog Analysis Notice</p>
                <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {lastUploadedData && (
                <button
                  onClick={handleRetry}
                  className="px-3.5 py-1.5 bg-[#E06D53] hover:bg-[#C84F36] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Analysis</span>
                </button>
              )}
              <button
                onClick={() => setErrorMessage(null)}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay State */}
        {isLoading && (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DFD1] shadow-lg flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#FAF1E4] border-2 border-[#E06D53]/40 flex items-center justify-center animate-bounce">
                <Dog className="w-10 h-10 text-[#C84F36]" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#E06D53] text-white flex items-center justify-center text-xs animate-ping">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-display font-bold text-xl text-[#2B1F17]">
                BarkLog AI is Thinking...
              </h3>
              <p className="text-xs text-[#7A6A5E] font-medium animate-pulse">
                {loadingStep}
              </p>
            </div>
          </div>
        )}

        {/* Main Interface: Upload or Result Card */}
        <AnimatePresence mode="wait">
          {!isLoading && isNonDogResult && currentImageUrl ? (
            <section key="nondog-view" aria-label="Non-Dog Verification Result">
              <NonDogResultCard
                imageUrl={currentImageUrl}
                onReset={handleReset}
                onForceAnalyze={() => {
                  if (lastUploadedData) {
                    handleImageSelected(lastUploadedData.base64, lastUploadedData.previewUrl, undefined, true);
                  }
                }}
                onSelectSampleDog={(dog) => handleImageSelected(dog.imageUrl, dog.imageUrl, dog)}
              />
            </section>
          ) : !isLoading && currentAnalysis && currentImageUrl ? (
            <section key="analysis-view" aria-label="Dog Analysis Result">
              <AnalysisCard
                analysis={currentAnalysis}
                imageUrl={currentImageUrl}
                onReset={handleReset}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                soundEnabled={soundEnabled}
              />
            </section>
          ) : !isLoading ? (
            <section key="upload-view" aria-label="Dog Photo Upload">
              <PhotoUploader
                onImageSelected={handleImageSelected}
                isLoading={isLoading}
                soundEnabled={soundEnabled}
              />
            </section>
          ) : null}
        </AnimatePresence>

        {/* Feature Highlights Grid at Bottom */}
        {!currentAnalysis && !isNonDogResult && !isLoading && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#FAF1E4] text-[#C84F36] flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-display font-bold text-sm text-[#2B1F17]">
                Gemini Vision Detection
              </h4>
              <p className="text-xs text-[#7A6A5E] leading-relaxed">
                Identifies breed, estimated age, and decodes subtle facial cues into a funny monologue under 50 words.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFF8E7] text-[#D9A322] flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-display font-bold text-sm text-[#2B1F17]">
                Dramatic Voice Narration
              </h4>
              <p className="text-xs text-[#7A6A5E] leading-relaxed">
                Multi-persona voice synthesizer reads the dog's dramatic thoughts aloud with real-time waveform sync.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#F3F4F9] text-[#5D6B99] flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-display font-bold text-sm text-[#2B1F17]">
                Doggo Souvenir Passport
              </h4>
              <p className="text-xs text-[#7A6A5E] leading-relaxed">
                Generates a downloadable high-res BarkCard with energy meter, mood badge, and hilarious quote.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onSelectSampleDog={(dog) => handleImageSelected(dog.imageUrl, dog.imageUrl, dog)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Modals & Drawers */}
      {isAboutModalOpen && (
        <AboutModal onClose={() => setIsAboutModalOpen(false)} />
      )}

      {isExportModalOpen && currentAnalysis && currentImageUrl && (
        <BarkCardExportModal
          analysis={currentAnalysis}
          imageUrl={currentImageUrl}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
