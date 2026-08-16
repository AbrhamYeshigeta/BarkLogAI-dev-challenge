import { BarkAnalysis, VoicePersona } from "../types";
import { getProfileForDog, generateCanineAudioBuffer } from "./audioBank";

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: "trailer",
    name: "Dramatic Movie Trailer",
    tagline: "Epic, deep, and cinematic",
    pitch: 0.72,
    rate: 0.88,
    genderPref: "male",
    description: "Deep cinematic baritone that turns any living room thought into a blockbuster monologue.",
  },
  {
    id: "hyper",
    name: "Hyperactive Pup",
    tagline: "Fast, bouncy, 100% zoomies",
    pitch: 1.42,
    rate: 1.22,
    genderPref: "female",
    description: "Bubbly, energetic, and breathless with absolute excitement for balls and snacks.",
  },
  {
    id: "gentleman",
    name: "Sophisticated Gentleman",
    tagline: "Aristocratic, crisp, distinguished",
    pitch: 0.95,
    rate: 0.92,
    genderPref: "male",
    description: "Refined aristocratic accent worthy of a lord surveying his estate sofa.",
  },
  {
    id: "sassy",
    name: "Sassy Diva",
    tagline: "Playful, expressive, judgmental",
    pitch: 1.18,
    rate: 1.05,
    genderPref: "female",
    description: "Expressive with sassy inflection, evaluating human behavior with supreme confidence.",
  },
  {
    id: "oldhound",
    name: "Wise Old Hound",
    tagline: "Calm, slow, deeply soulful",
    pitch: 0.65,
    rate: 0.80,
    genderPref: "male",
    description: "Slow, gravelly, and peaceful tone of a dog who has seen every squirrel in history.",
  },
];

// Audio Context Singleton for safe Web Audio API synthesis
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Resolves acoustic physical parameters from dog image analysis:
 * - Dog Size (tiny, small, medium, large, giant)
 * - Emotion & Mood (Tired, Suspicious, Chaos, Pure Joy, Snack Alert)
 * - Bark Energy Rating (1 - 100%)
 */
export function resolveDogAcoustics(analysis?: Partial<BarkAnalysis> | null) {
  let size: "tiny" | "small" | "medium" | "large" | "giant" = analysis?.dogSize || "medium";
  const breedText = (analysis?.breedIdentification || "").toLowerCase();
  const moodText = (analysis?.mood || "").toLowerCase();
  const aliasText = (analysis?.dogAlias || "").toLowerCase();
  const energy = analysis?.barkEnergy ?? 50;

  if (!analysis?.dogSize) {
    if (
      breedText.includes("chihuahua") ||
      breedText.includes("pomeranian") ||
      breedText.includes("yorkie") ||
      breedText.includes("maltese") ||
      breedText.includes("shih tzu") ||
      breedText.includes("pocket") ||
      breedText.includes("toy ")
    ) {
      size = "tiny";
    } else if (
      breedText.includes("corgi") ||
      breedText.includes("french") ||
      breedText.includes("pug") ||
      breedText.includes("dachshund") ||
      breedText.includes("beagle") ||
      breedText.includes("jack russell") ||
      breedText.includes("boston")
    ) {
      size = "small";
    } else if (
      breedText.includes("husky") ||
      breedText.includes("retriever") ||
      breedText.includes("shepherd") ||
      breedText.includes("labrador") ||
      breedText.includes("rottweiler") ||
      breedText.includes("boxer") ||
      breedText.includes("doberman")
    ) {
      size = "large";
    } else if (
      breedText.includes("dane") ||
      breedText.includes("bernard") ||
      breedText.includes("mastiff") ||
      breedText.includes("newfoundland") ||
      breedText.includes("cane corso")
    ) {
      size = "giant";
    }
  }

  // Base physical acoustic profile
  let baseFreq = 280;
  let endFreq = 130;
  let filterCutoff = 950;
  let filterEnd = 380;
  let duration = 0.16;
  let pulses = 2;
  let pulseGap = 135;
  let hasSubBass = false;
  let hasHowl = false;

  switch (size) {
    case "tiny":
      baseFreq = 740;
      endFreq = 420;
      filterCutoff = 2600;
      filterEnd = 1200;
      duration = 0.085;
      pulses = energy > 55 ? 3 : 2;
      pulseGap = 90;
      break;
    case "small":
      baseFreq = 450;
      endFreq = 230;
      filterCutoff = 1600;
      filterEnd = 650;
      duration = 0.12;
      pulses = energy > 70 ? 3 : 2;
      pulseGap = 110;
      break;
    case "medium":
      baseFreq = 280;
      endFreq = 130;
      filterCutoff = 950;
      filterEnd = 380;
      duration = 0.16;
      pulses = energy < 25 ? 1 : 2;
      pulseGap = 135;
      break;
    case "large":
      baseFreq = 180;
      endFreq = 85;
      filterCutoff = 650;
      filterEnd = 240;
      duration = 0.20;
      hasSubBass = true;
      pulses = energy < 30 ? 1 : 2;
      pulseGap = 160;
      if (
        breedText.includes("husky") ||
        moodText.includes("dramatic") ||
        moodText.includes("opera")
      ) {
        hasHowl = true;
      }
      break;
    case "giant":
      baseFreq = 110;
      endFreq = 50;
      filterCutoff = 420;
      filterEnd = 160;
      duration = 0.25;
      hasSubBass = true;
      pulses = energy < 40 ? 1 : 2;
      pulseGap = 190;
      break;
  }

  // Specific signature customizations for notable dogs (Pip swapped with Milo, Milo swapped with Pip)
  if (
    aliasText.includes("pip") ||
    breedText.includes("pip") ||
    (breedText.includes("chihuahua") && (moodText.includes("chaos") || energy >= 90))
  ) {
    // Pip's sound effect SWAPPED with Milo's signature: Calm, warm, thoughtful double boof with mellow tail resonance
    return {
      size: "medium",
      baseFreq: 225,
      endFreq: 110,
      filterCutoff: 800,
      filterEnd: 300,
      duration: 0.22,
      pulses: 2,
      pulseGap: 210,
      hasSubBass: true,
      hasHowl: false,
      energy: 38,
    };
  }

  if (
    aliasText.includes("milo") ||
    breedText.includes("milo") ||
    aliasText.includes("philosopher") ||
    moodText.includes("philosophical")
  ) {
    // Milo's sound effect SWAPPED with Pip's signature: Hyper-energetic 4-burst pocket yip with sharp treble bite
    return {
      size: "tiny",
      baseFreq: 860,
      endFreq: 460,
      filterCutoff: 3200,
      filterEnd: 1500,
      duration: 0.075,
      pulses: 4,
      pulseGap: 85,
      hasSubBass: false,
      hasHowl: false,
      energy: 95,
    };
  }

  // Emotion & Mood Modulation
  if (moodText.includes("tired") || moodText.includes("sleep") || energy <= 20) {
    pulses = 1;
    duration *= 1.3;
    baseFreq *= 0.85;
    endFreq *= 0.8;
  } else if (moodText.includes("chaos") || moodText.includes("zoomies") || energy >= 85) {
    pulses = Math.max(pulses, 3);
    baseFreq *= 1.15;
    endFreq *= 1.1;
    pulseGap *= 0.82;
  } else if (moodText.includes("snack") || moodText.includes("suspicious")) {
    baseFreq *= 1.08;
  }

  return {
    size,
    baseFreq,
    endFreq,
    filterCutoff,
    filterEnd,
    duration,
    pulses,
    pulseGap,
    hasSubBass,
    hasHowl,
    energy,
  };
}

export interface RealisticBarkOptions {
  breed?: string;
  breedIdentification?: string;
  mood?: string;
  dogSize?: "tiny" | "small" | "medium" | "large" | "giant";
  energy?: number;
  barkEnergy?: number;
  prompt?: string;
  dogAlias?: string;
  barkTypeDescription?: string;
}

// AudioBuffer memory cache for instant, zero-latency realistic canine audio
const canineAudioBufferCache = new Map<string, AudioBuffer>();

// Client-side cache for ElevenLabs AI Sound Generator audio blob URLs
const elevenLabsSoundFxBlobCache = new Map<string, string>();
const inFlightClientFetches = new Map<string, Promise<string | null>>();
const activeSoundAudios = new Set<HTMLAudioElement>();

function getSoundFxCacheKey(
  options?: RealisticBarkOptions | Partial<BarkAnalysis> | null
): string {
  if (!options) return "default-dog";
  const dogAlias =
    (options as RealisticBarkOptions)?.dogAlias ||
    (options as Partial<BarkAnalysis>)?.dogAlias ||
    "";
  const breed =
    (options as RealisticBarkOptions)?.breed ||
    (options as Partial<BarkAnalysis>)?.breedIdentification ||
    "";
  const mood = options?.mood || "";
  const prompt =
    (options as RealisticBarkOptions)?.prompt ||
    (options as Partial<BarkAnalysis>)?.soundPrompt ||
    "";
  return `${dogAlias}_${breed}_${mood}_${prompt}`.toLowerCase().trim();
}

/**
 * Pre-fetches and caches realistic Dog Bark sound effects from ElevenLabs AI Sound Generator.
 */
export async function fetchAndCacheElevenLabsBark(
  options: RealisticBarkOptions | Partial<BarkAnalysis>
): Promise<string | null> {
  const cacheKey = getSoundFxCacheKey(options);
  if (elevenLabsSoundFxBlobCache.has(cacheKey)) {
    return elevenLabsSoundFxBlobCache.get(cacheKey)!;
  }

  // Deduplicate in-flight fetch for the exact same sound key
  if (inFlightClientFetches.has(cacheKey)) {
    return inFlightClientFetches.get(cacheKey)!;
  }

  const breed =
    (options as RealisticBarkOptions)?.breed ||
    (options as Partial<BarkAnalysis>)?.breedIdentification ||
    "";
  const mood = options?.mood || "";
  const dogSize = options?.dogSize;
  const dogAlias =
    (options as RealisticBarkOptions)?.dogAlias ||
    (options as Partial<BarkAnalysis>)?.dogAlias ||
    "";
  const energy =
    (options as RealisticBarkOptions)?.energy ??
    (options as Partial<BarkAnalysis>)?.barkEnergy ??
    50;
  const prompt =
    (options as RealisticBarkOptions)?.prompt ||
    (options as Partial<BarkAnalysis>)?.soundPrompt;

  const fetchPromise = (async () => {
    try {
      const res = await fetch("/api/bark-sound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          breed,
          mood,
          dogSize,
          energy,
          dogAlias,
          prompt,
        }),
      });

      const contentType = res.headers.get("Content-Type") || "";
      if (res.ok && contentType.includes("audio/mpeg")) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        elevenLabsSoundFxBlobCache.set(cacheKey, blobUrl);
        return blobUrl;
      }
    } catch {
      // Graceful fallback to client audio synth
    }
    return null;
  })().finally(() => {
    inFlightClientFetches.delete(cacheKey);
  });

  inFlightClientFetches.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Preloads sample dogs' realistic barking audio from ElevenLabs AI Sound Generator sequentially
 * with a staggered delay to strictly avoid concurrent request rate limits.
 */
export async function preloadAllSampleDogsBarkSounds(sampleDogs: Array<{
  name: string;
  breed: string;
  analysis: Partial<BarkAnalysis>;
  soundPrompt?: string;
}>) {
  for (const dog of sampleDogs) {
    try {
      await fetchAndCacheElevenLabsBark({
        ...dog.analysis,
        dogAlias: dog.name,
        breedIdentification: dog.breed,
        prompt: dog.soundPrompt || dog.analysis.soundPrompt,
      });
      // Stagger by 600ms between requests to avoid overloading concurrency limits
      await new Promise((r) => setTimeout(r, 600));
    } catch {
      // Continue next dog without throwing
    }
  }
}

/**
 * Biophysical Canine Vocalization Synthesizer & Audio Engine
 * Models canine vocal cord glottal flow (Rosenberg model), subharmonic roughness,
 * multi-formant vocal tract resonances (pharyngeal F1, oral F2, nasal F3),
 * transient laryngeal breath burst, and organic muzzle movement.
 */
export function playWebAudioCanineSynth(analysis?: Partial<BarkAnalysis> | RealisticBarkOptions | null) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const breed =
      (analysis as RealisticBarkOptions)?.breed ||
      (analysis as Partial<BarkAnalysis>)?.breedIdentification ||
      "";
    const mood = analysis?.mood || "";
    const dogSize = analysis?.dogSize;
    const dogAlias =
      (analysis as RealisticBarkOptions)?.dogAlias ||
      (analysis as Partial<BarkAnalysis>)?.dogAlias ||
      "";
    const energy =
      (analysis as RealisticBarkOptions)?.energy ??
      (analysis as Partial<BarkAnalysis>)?.barkEnergy ??
      50;

    const profile = getProfileForDog(dogAlias, breed, mood, dogSize, energy);
    const cacheKey = `${profile.name}-${profile.fundamentalPitch}-${profile.pulses}`.toLowerCase();

    let buffer = canineAudioBufferCache.get(cacheKey);
    if (!buffer) {
      buffer = generateCanineAudioBuffer(ctx, profile);
      canineAudioBufferCache.set(cacheKey, buffer);
    }

    // Play synthesized buffer via AudioBufferSourceNode
    const sourceNode = ctx.createBufferSource();
    sourceNode.buffer = buffer;

    // Master gain & compressor for punchy, clean, distortion-free output
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.92;

    sourceNode.connect(masterGain);
    masterGain.connect(ctx.destination);

    sourceNode.start();
  } catch (e) {
    console.warn("Canine realistic vocalization error:", e);
  }
}

/**
 * Plays an ultra-realistic Canine Bark Sound Effect.
 * Seamlessly plays ElevenLabs AI Sound Generator audio if available/cached,
 * and falls back to biophysical canine vocal tract synthesis.
 */
export async function playRealisticDogBark(
  options?: RealisticBarkOptions | Partial<BarkAnalysis> | null
) {
  const cacheKey = getSoundFxCacheKey(options);

  // 1. Check if ElevenLabs AI sound effect is already cached
  if (elevenLabsSoundFxBlobCache.has(cacheKey)) {
    try {
      const blobUrl = elevenLabsSoundFxBlobCache.get(cacheKey)!;
      const audio = new Audio(blobUrl);
      audio.volume = 1.0;
      activeSoundAudios.add(audio);
      audio.onended = () => activeSoundAudios.delete(audio);
      await audio.play();
      return;
    } catch (e) {
      console.warn("ElevenLabs cached audio play failed, falling back:", e);
    }
  }

  // 2. Play immediate high-definition canine acoustic vocalization
  playWebAudioCanineSynth(options);

  // 3. Simultaneously fetch and cache the ElevenLabs AI sound effect for subsequent clicks
  if (options) {
    fetchAndCacheElevenLabsBark(options).catch(() => {});
  }
}

/**
 * Universal Alias for Dog Bark sound playback
 */
export const playBarkSound = playRealisticDogBark;

// 2. Playful Dog Whistle / Chirp Synthesizer (Alternative pitch whistle for training)
export function playDogWhistleSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.linearRampToValueAtTime(2800, now + 0.08);
    osc.frequency.linearRampToValueAtTime(2400, now + 0.18);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.24);
  } catch (e) {
    console.warn("Whistle sound error:", e);
  }
}

// Alias for squeak / playful interaction
export const playSqueakToy = playDogWhistleSound;

// 3. Camera Click Sound
export function playCameraClick() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Quick white noise burst for shutter mechanical snap
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  } catch (e) {
    console.warn("Camera sound error:", e);
  }
}

// 4. Celebratory Happy Chime
export function playHappyChime() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    });
  } catch (e) {
    console.warn("Happy chime error:", e);
  }
}

// 5. Speech Synthesis & ElevenLabs AI Voice Narrator Engine
export class DogNarrator {
  private static activeUtterance: SpeechSynthesisUtterance | null = null;
  private static activeAudio: HTMLAudioElement | null = null;

  public static isSupported(): boolean {
    return (
      (typeof window !== "undefined" && "speechSynthesis" in window) ||
      (typeof Audio !== "undefined")
    );
  }

  public static getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  public static async speak(
    text: string,
    persona: VoicePersona,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
      onBoundary?: (charIndex: number) => void;
    }
  ): Promise<void> {
    this.stop();

    // 1. First attempt: Check ElevenLabs AI Voice backend
    try {
      const response = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          personaId: persona.id,
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      // If backend returned raw audio MPEG stream (ElevenLabs succeeded)
      if (response.ok && contentType.includes("audio")) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        this.activeAudio = audio;

        audio.onplay = () => {
          callbacks?.onStart?.();
        };

        audio.onended = () => {
          this.activeAudio = null;
          URL.revokeObjectURL(audioUrl);
          callbacks?.onEnd?.();
        };

        audio.onerror = (e) => {
          this.activeAudio = null;
          URL.revokeObjectURL(audioUrl);
          // Fallback to Web Speech API
          this.speakWebSpeech(text, persona, callbacks);
        };

        await audio.play();
        return;
      }
    } catch {
      // Network failure on ElevenLabs route -> fall through to client voice
    }

    // 2. Fallback: Browser Web Speech API with tuned pitch & rate for persona
    this.speakWebSpeech(text, persona, callbacks);
  }

  private static speakWebSpeech(
    text: string,
    persona: VoicePersona,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
      onBoundary?: (charIndex: number) => void;
    }
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      callbacks?.onError?.(new Error("Speech synthesis not supported on this device."));
      return;
    }

    try {
      // Cancel any stuck utterances before starting
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = persona.rate;
      utterance.pitch = persona.pitch;

      const assignVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
          const searchList = englishVoices.length > 0 ? englishVoices : voices;

          if (persona.genderPref === "female") {
            const femaleMatch = searchList.find((v) =>
              /female|samantha|zira|karen|victoria|moira|fiona|veena|susan|jenny|eva/i.test(v.name)
            );
            if (femaleMatch) utterance.voice = femaleMatch;
          } else if (persona.genderPref === "male") {
            const maleMatch = searchList.find((v) =>
              /male|david|daniel|george|alex|fred|oliver|arthur|guy|tom|james|mark/i.test(v.name)
            );
            if (maleMatch) utterance.voice = maleMatch;
          }

          if (!utterance.voice && searchList[0]) {
            utterance.voice = searchList[0];
          }
        }

        utterance.onstart = () => {
          callbacks?.onStart?.();
        };

        utterance.onend = () => {
          this.activeUtterance = null;
          callbacks?.onEnd?.();
        };

        utterance.onerror = (e) => {
          this.activeUtterance = null;
          callbacks?.onError?.(e);
        };

        utterance.onboundary = (e) => {
          if (typeof e.charIndex === "number") {
            callbacks?.onBoundary?.(e.charIndex);
          }
        };

        this.activeUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0 && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          assignVoiceAndSpeak();
        };
      } else {
        assignVoiceAndSpeak();
      }
    } catch (err) {
      callbacks?.onError?.(err);
    }
  }

  public static stop() {
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      } catch {}
      this.activeAudio = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
  }

  public static isSpeaking(): boolean {
    const isAudioPlaying = Boolean(this.activeAudio && !this.activeAudio.paused);
    const isSynthSpeaking = Boolean(
      typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        window.speechSynthesis.speaking
    );
    return isAudioPlaying || isSynthSpeaking;
  }
}
