import React, { useState } from "react";
import { X, Copy, Check, Terminal, Sparkles, ExternalLink, Code2 } from "lucide-react";

interface PromptInspectorModalProps {
  onClose: () => void;
}

export const PromptInspectorModal: React.FC<PromptInspectorModalProps> = ({ onClose }) => {
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

  const handleCopy = () => {
    navigator.clipboard.writeText(SYSTEM_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-[#E8DFD1] flex flex-col my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E8DFD1] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E06D53] text-white flex items-center justify-center shadow-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#2B1F17]">
                Google AI Studio Prompt & Config
              </h3>
              <p className="text-xs text-[#7A6A5E]">
                Official System Instructions & Gemini Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#7A6A5E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto bg-white">
          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#E5C978] text-xs text-[#5C4509] space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D9A322]" />
              How to test in Google AI Studio:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[#6E4B02]">
              <li>
                Open{" "}
                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold hover:text-black inline-flex items-center gap-0.5"
                >
                  aistudio.google.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Select model <strong>Gemini 1.5 Flash</strong> or <strong>Gemini 2.5 Flash</strong></li>
              <li>Paste the System Instructions below into the System Instructions box</li>
              <li>Attach any dog photo and run!</li>
            </ol>
          </div>

          {/* System Prompt Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A3A2F] uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#E06D53]" />
                System Instruction Prompt (Copy & Paste)
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-lg bg-[#FAF1E4] hover:bg-[#F5E6D3] text-[#8C5E2E] text-xs font-bold border border-[#DFC9AB] transition-all flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-[#2B1F17] text-[#FAF7F2] text-xs font-mono whitespace-pre-wrap leading-relaxed border border-black/10 overflow-x-auto shadow-inner">
              {SYSTEM_PROMPT}
            </pre>
          </div>

          {/* JSON Schema Configuration */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#4A3A2F] uppercase tracking-wider">
              Output Schema Extracted by BarkLog AI
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1]">
                <p className="font-bold text-[#2B1F17]">Sentence 1: Identification</p>
                <p className="text-[#7A6A5E]">Breed identification and estimated age.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1]">
                <p className="font-bold text-[#2B1F17]">Sentence 2: Inner Monologue</p>
                <p className="text-[#7A6A5E]">Dramatic human-like dog thought based on body language.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1]">
                <p className="font-bold text-[#2B1F17]">Mood & Staggered Lines</p>
                <p className="text-[#7A6A5E]">Poetic 3-5 line layout for the interactive mood board.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFD1]">
                <p className="font-bold text-[#2B1F17]">Bark Energy Meter</p>
                <p className="text-[#7A6A5E]">Score from 1 to 100 with comedic category tier.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFD1] flex items-center justify-between">
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-[#C84F36] hover:underline flex items-center gap-1"
          >
            <span>Launch Google AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2B1F17] hover:bg-[#433227] text-white text-xs font-bold transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
