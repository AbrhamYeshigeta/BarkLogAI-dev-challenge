import React from "react";
import { X, Trash2, Dog, Clock, Sparkles } from "lucide-react";
import { HistoryItem } from "../types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#E8DFD1] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD1] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E06D53]" />
            <h3 className="font-display font-bold text-lg text-[#2B1F17]">
              Doggo Log History
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E06D53]/10 text-[#C84F36]">
              {history.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#7A6A5E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF7F2]/50">
          {history.length === 0 ? (
            <div className="p-12 text-center text-[#8C7D72] flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF1E4] flex items-center justify-center text-[#C84F36] mb-3">
                <Dog className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-[#2B1F17] mb-1">No Dogs Analyzed Yet</p>
              <p className="text-xs">
                Upload a photo or try a sample dog to start logging their inner thoughts!
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistory(item);
                  onClose();
                }}
                className="group p-3 rounded-2xl bg-white border border-[#E8DFD1] hover:border-[#E06D53] hover:shadow-md transition-all cursor-pointer flex gap-3 items-center"
              >
                <img
                  src={item.imageUrl}
                  alt={item.analysis.dogAlias}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="font-bold text-xs text-[#2B1F17] truncate">
                      {item.analysis.dogAlias}
                    </p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF1E4] text-[#8C5E2E]">
                      {item.analysis.mood}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A6A5E] line-clamp-1 italic">
                    "{item.analysis.innerThought}"
                  </p>
                  <p className="text-[10px] text-[#A8988B] mt-1">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFD1] flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 p-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2B1F17] text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
