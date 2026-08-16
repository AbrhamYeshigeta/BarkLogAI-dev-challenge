import React, { useState } from "react";
import {
  X,
  Dog,
  Sparkles,
  Heart,
  Volume2,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const SYSTEM_PROMPT = `You are "BarkLog AI" – a funny, warm, and slightly dramatic dog expert.

Your job is to analyze uploaded dog photos and respond in a very specific format.

**Your response must follow this exact structure:**

[First Sentence]: Identify the dog's breed and estimated age. Be specific if possible (e.g., "This is a 3-year-old Golden Retriever" or "This looks like a 2-year-old Corgi mix").

[Second Sentence]: Write a hilarious, playful 1-sentence inner thought that this dog is having RIGHT NOW based on its facial expression and body language. Make it sound like the dog is talking in a dramatic, human-like voice.

**Rules:**
- Keep your total response under 50 words.
- Always be playful and lighthearted.
- Never be mean or harsh about the dog.
- If you cannot identify the breed, say "This looks like a happy mystery mutt!"
- If you cannot estimate age, say "a young pup" or "a wise old soul".

**Example of a perfect response:**
"This is a 2-year-old Siberian Husky with striking blue eyes. I'm definitely plotting my escape from this boring living room, but I'll forgive you if you give me a treat."

**Now analyze the uploaded image and respond in exactly the format above.**`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(SYSTEM_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-[#E8DFD1] flex flex-col my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] sm:max-h-[88vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#E8DFD1] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#E06D53] to-[#C84F36] text-white flex items-center justify-center shadow-md shadow-[#E06D53]/20 shrink-0">
              <Dog className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg sm:text-xl text-[#2B1F17] tracking-tight">
                  <span className="sm:hidden">About Us</span>
                  <span className="hidden sm:inline">About BarkLog AI</span>
                </h3>
                <span className="hidden sm:inline-block bg-[#E06D53]/15 text-[#C84F36] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Canine AI
                </span>
              </div>
              <p className="hidden sm:block text-xs text-[#7A6A5E] font-medium">
                Dog Vision Intelligence & Dramatic Voice Narrator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#7A6A5E] hover:text-[#2B1F17] transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto text-[#4A3A2F]">
          {/* Mission Statement Hero Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF5EE] to-[#F5ECE0] border border-[#E8DFD1] space-y-2.5">
            <div className="flex items-center gap-2 text-[#C84F36] font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Our Mission</span>
            </div>
            <h4 className="font-display font-bold text-lg text-[#2B1F17] leading-snug">
              Giving every dog a hilarious, dramatic voice through cutting-edge multimodal AI.
            </h4>
            <p className="text-xs sm:text-sm text-[#6A5A4E] leading-relaxed">
              Every dog owner has wondered what is going on behind those soulful puppy eyes. 
              <strong> BarkLog AI</strong> bridges the human-canine communication gap by analyzing canine facial micro-expressions, ear positions, and body posture to reveal their dramatic inner monologue.
            </p>
          </div>

          {/* Core Features Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#2B1F17] uppercase tracking-wider">
              What Powers BarkLog AI
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-1.5 hover:border-[#D4C3B0] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#FAF1E4] text-[#C84F36] flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h5 className="font-display font-bold text-sm text-[#2B1F17]">
                  Multimodal Vision AI
                </h5>
                <p className="text-xs text-[#7A6A5E] leading-relaxed">
                  Identifies dog breeds, estimated ages, emotional mood scores, and canine body language nuances.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-1.5 hover:border-[#D4C3B0] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#FAF1E4] text-[#C84F36] flex items-center justify-center font-bold text-xs">
                  <Volume2 className="w-4 h-4" />
                </div>
                <h5 className="font-display font-bold text-sm text-[#2B1F17]">
                  4 Dramatic Voice Personas
                </h5>
                <p className="text-xs text-[#7A6A5E] leading-relaxed">
                  Narrates inner monologues in Broadway Diva, Posh Aristocrat, Grumpy Grandpa, or Anxious Overthinker styles.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-1.5 hover:border-[#D4C3B0] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#FAF1E4] text-[#C84F36] flex items-center justify-center font-bold text-xs">
                  <Heart className="w-4 h-4" />
                </div>
                <h5 className="font-display font-bold text-sm text-[#2B1F17]">
                  Acoustic Sound Synthesizer
                </h5>
                <p className="text-xs text-[#7A6A5E] leading-relaxed">
                  Generates authentic barking acoustics matched precisely to dog breed size, pitch, and energy levels.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD1] shadow-2xs space-y-1.5 hover:border-[#D4C3B0] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-[#FAF1E4] text-[#C84F36] flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h5 className="font-display font-bold text-sm text-[#2B1F17]">
                  BarkCard Souvenir Passports
                </h5>
                <p className="text-xs text-[#7A6A5E] leading-relaxed">
                  Export high-resolution passport cards with personality badges and funny quotes ready for sharing.
                </p>
              </div>
            </div>
          </div>

          {/* Collapsible AI Studio Technical Prompt Box */}
          <div className="border border-[#E8DFD1] rounded-2xl overflow-hidden bg-[#FAF7F2]">
            <button
              onClick={() => setShowPromptDetails(!showPromptDetails)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F4ECE0] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#E06D53]" />
                <span className="text-xs font-bold text-[#2B1F17]">
                  Google AI Studio Vision Prompt & System Instructions
                </span>
              </div>
              {showPromptDetails ? (
                <ChevronUp className="w-4 h-4 text-[#7A6A5E]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#7A6A5E]" />
              )}
            </button>

            {showPromptDetails && (
              <div className="p-4 border-t border-[#E8DFD1] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-[#7A6A5E]">
                    The exact Gemini prompt architecture powering BarkLog AI:
                  </p>
                  <button
                    onClick={handleCopyPrompt}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF1E4] hover:bg-[#F5E6D3] text-[#8C5E2E] text-xs font-bold border border-[#DFC9AB] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#2B1F17] rounded-xl p-3 text-[11px] font-mono text-[#E8DFD1] overflow-x-auto leading-relaxed border border-[#3E2D22] max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{SYSTEM_PROMPT}</pre>
                </div>

                <div className="text-[11px] text-[#8C7D72] flex items-center gap-1">
                  <span>Test directly in</span>
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#E06D53] font-bold underline inline-flex items-center gap-0.5"
                  >
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E8DFD1] bg-[#FAF7F2] flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <span className="text-[11px] sm:text-xs text-[#8C7D72] text-center sm:text-left">
            Crafted for dog lovers everywhere 🐶
          </span>
          <button
            onClick={onClose}
            id="btn-about-modal-got-it"
            className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-[#2B1F17] hover:bg-[#433226] text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98] sm:active:scale-95 cursor-pointer flex items-center justify-center tracking-wide"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
