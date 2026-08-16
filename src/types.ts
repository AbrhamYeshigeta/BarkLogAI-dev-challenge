export interface BarkAnalysis {
  isDog?: boolean;
  dogDetection?: "YES" | "NO";
  breedIdentification: string;
  innerThought: string;
  fullResponse: string;
  mood: string;
  moodSubtitle: string;
  moodBoardLines: string[];
  barkEnergy: number;
  energyCategory: "Couch Potato" | "Gentle Trotter" | "Zoomies Ready" | "Hyper Fetcher" | "Chaos Demon!" | string;
  dogAlias: string;
  traits: string[];
  favoriteActivity?: string;
  dogSize?: "tiny" | "small" | "medium" | "large" | "giant";
  barkPitchHz?: number;
  barkTypeDescription?: string;
  soundPrompt?: string;
}

export interface SampleDog {
  id: string;
  name: string;
  breed: string;
  subtitle: string;
  imageUrl: string;
  soundPrompt?: string;
  analysis: BarkAnalysis;
}

export interface VoicePersona {
  id: string;
  name: string;
  tagline: string;
  pitch: number;
  rate: number;
  genderPref?: "male" | "female" | "any";
  description: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  analysis: BarkAnalysis;
}
