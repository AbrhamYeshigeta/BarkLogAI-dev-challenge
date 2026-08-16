import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Lazy Gemini client helper
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not configured.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // System Prompt for BarkLog AI
  const BARKLOG_SYSTEM_INSTRUCTION = `You are "BarkLog AI" – a funny, warm, and slightly dramatic dog expert.

Your job is to analyze uploaded dog photos and respond in a very specific format.

Your response must follow this exact structure:
[First Sentence]: Identify the dog's breed and estimated age. Be specific if possible (e.g., "This is a 3-year-old Golden Retriever" or "This looks like a 2-year-old Corgi mix").
[Second Sentence]: Write a hilarious, playful 1-sentence inner thought that this dog is having RIGHT NOW based on its facial expression and body language. Make it sound like the dog is talking in a dramatic, human-like voice.

Rules:
- Keep the combined first and second sentence under 50 words.
- Always be playful and lighthearted.
- Never be mean or harsh about the dog.
- If you cannot identify the breed, say "This looks like a happy mystery mutt!"
- If you cannot estimate age, say "a young pup" or "a wise old soul".
- Extract the core emotional mood (e.g., Tired, Suspicious, Goofy, Pure Chaos, Snack Obsessed, Majestic, Plotting, Confused, Zen, Guilty).
- Create 3-5 artistic staggered poetic words/lines for the Mood Board (e.g., ["I'm", "Suspicious.", "What", "Is", "That?"] or ["I'm", "Tired.", "Such", "A", "Long Day."]).
- Calculate a Bark Energy rating (1-100) from body language.
- Assign a funny alias/title and 3 hilarious character traits.
- Determine the dog's physical size category based on the breed and visual scale: 'tiny' (Chihuahua, Pomeranian, Yorkie), 'small' (Corgi, Frenchie, Pug, Beagle), 'medium' (Border Collie, Aussie, Spaniel, Boxer), 'large' (Golden Retriever, Husky, German Shepherd, Labrador), 'giant' (Great Dane, Saint Bernard, Mastiff).
- Estimate the dog's characteristic bark acoustic pitch in Hz (e.g., 600-850Hz for tiny, 350-550Hz for small, 220-350Hz for medium, 140-220Hz for large, 70-130Hz for giant).
- Give a 2-4 word description of their custom bark style (e.g., 'Ultrasonic Squeaky Yap', 'Subwoofer Chest Boof', 'Dramatic Husky Opera Awoo', 'Playful Double Woof', 'Sleepy Muffled Snort').`;

  // Dog Detector System Prompt & Strict Rules
  const DOG_DETECTOR_PROMPT = `Look at the uploaded image. Answer ONLY with "YES" if the image contains a dog, or "NO" if it does not.

Rules:
- ONLY respond with "YES" or "NO".
- No explanation, no punctuation, no extra text.
- If uncertain, make your best guess.
- Cartoon dogs = YES. Toy dogs = YES.
- Dogs with other animals = YES.
- No dog = NO.

Now respond with ONLY "YES" or "NO".`;

  async function checkIsDogInImage(ai: GoogleGenAI, imagePart: any): Promise<"YES" | "NO"> {
    const candidateModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.7-flash",
      "gemini-flash-latest",
    ];

    for (const modelName of candidateModels) {
      try {
        console.log(`[Dog Detector] Evaluating image with ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              imagePart,
              { text: DOG_DETECTOR_PROMPT },
            ],
          },
          config: {
            temperature: 0.0,
            maxOutputTokens: 10,
          },
        });

        const rawText = response.text?.trim()?.toUpperCase() || "";
        console.log(`[Dog Detector] Model ${modelName} returned: "${rawText}"`);
        if (rawText.startsWith("YES") || rawText === "YES") {
          return "YES";
        }
        if (rawText.startsWith("NO") || rawText === "NO") {
          return "NO";
        }
      } catch (err) {
        console.warn(`[Dog Detector] Model ${modelName} attempt failed:`, err);
      }
    }

    // Default to YES if detection endpoint encounters transient network errors
    return "YES";
  }

  // Standalone API Route: Dog Detector
  app.post("/api/detect-dog", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg" } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 payload" });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
      const ai = getGeminiClient();
      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      };

      const detection = await checkIsDogInImage(ai, imagePart);
      return res.json({
        success: true,
        isDog: detection === "YES",
        dogDetection: detection,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Dog detector error.";
      return res.status(500).json({ error: message });
    }
  });

  // API Route: Analyze dog photo
  app.post("/api/analyze-dog", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", forceAnalysis = false } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 payload" });
      }

      // Clean base64 data prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

      const ai = getGeminiClient();

      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      };

      // Step 1: Run Dog Detector unless explicitly bypassed
      let dogDetectionResult: "YES" | "NO" = "YES";
      if (!forceAnalysis) {
        dogDetectionResult = await checkIsDogInImage(ai, imagePart);
        if (dogDetectionResult === "NO") {
          console.log("[Dog Detector] Result: NO. Rejecting non-canine image.");
          return res.json({
            success: true,
            isDog: false,
            dogDetection: "NO",
            message: "No dog was detected in this image. (Detector output: NO)",
          });
        }
      }

      const promptPart = {
        text: "Analyze this dog photo as BarkLog AI. Provide the identification sentence, the hilarious inner thought monologue, mood classification, mood board staggered text, energy score, character traits, dog size category, and personalized bark acoustic profile.",
      };

      // Candidate models in order of priority
      const candidateModels = [
        "gemini-3.1-flash-lite",
        "gemini-3.7-flash",
        "gemini-flash-latest",
      ];

      const config = {
        systemInstruction: BARKLOG_SYSTEM_INSTRUCTION,
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            breedIdentification: {
              type: Type.STRING,
              description: "Sentence 1: Breed and estimated age, e.g. 'This is a 2-year-old Siberian Husky with striking blue eyes.'",
            },
            innerThought: {
              type: Type.STRING,
              description: "Sentence 2: Hilarious 1-sentence inner thought in dramatic first-person dog voice.",
            },
            fullResponse: {
              type: Type.STRING,
              description: "The combined sentence 1 and sentence 2 formatted together under 50 words.",
            },
            mood: {
              type: Type.STRING,
              description: "Single primary mood word, e.g. Suspicious, Tired, Goofy, Pure Chaos, Majestic, Snack Obsessed, Dramatic, Innocent, Zoomies Ready.",
            },
            moodSubtitle: {
              type: Type.STRING,
              description: "A short funny mood subtitle, e.g. 'Plotting grand living room escape' or 'Exhausted from a 3-minute nap'.",
            },
            moodBoardLines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 staggered artistic poetic lines for the mood board (e.g. ['I\\'m', 'Suspicious.', 'What', 'Is', 'That?']).",
            },
            barkEnergy: {
              type: Type.INTEGER,
              description: "Bark energy level from 1 to 100 based on the dog's pose and mood.",
            },
            energyCategory: {
              type: Type.STRING,
              description: "One of: 'Couch Potato' (1-20), 'Gentle Trotter' (21-40), 'Zoomies Ready' (41-60), 'Hyper Fetcher' (61-80), 'Chaos Demon!' (81-100).",
            },
            dogAlias: {
              type: Type.STRING,
              description: "A witty dog nickname/title, e.g. 'Sir Barks-a-Lot', 'The Sock Bandit', 'Captain Snooze'.",
            },
            traits: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 funny character traits, e.g. ['Master of Side-Eye', 'Treat Negotiator', 'Vacuum Hater'].",
            },
            favoriteActivity: {
              type: Type.STRING,
              description: "Funny preferred hobby/activity deduced from image.",
            },
            dogSize: {
              type: Type.STRING,
              description: "Dog physical size: 'tiny', 'small', 'medium', 'large', or 'giant'.",
            },
            barkPitchHz: {
              type: Type.INTEGER,
              description: "Estimated base bark pitch in Hertz based on dog size (70 to 850 Hz).",
            },
            barkTypeDescription: {
              type: Type.STRING,
              description: "A short title for this dog's acoustic bark style, e.g. 'Subwoofer Chest Boof' or 'Ultrasonic Rapid Pocket Yap'.",
            },
          },
          required: [
            "breedIdentification",
            "innerThought",
            "fullResponse",
            "mood",
            "moodSubtitle",
            "moodBoardLines",
            "barkEnergy",
            "energyCategory",
            "dogAlias",
            "traits",
            "dogSize",
            "barkTypeDescription",
          ],
        },
      };

      let lastError: unknown = null;
      let parsedData: any = null;

      // Try candidate models with automatic retry on 503 / 429
      for (const modelName of candidateModels) {
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
          attempts++;
          try {
            console.log(`Analyzing dog with model: ${modelName} (attempt ${attempts})...`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: { parts: [imagePart, promptPart] },
              config,
            });

            const responseText = response.text;
            if (responseText) {
              try {
                const cleaned = responseText
                  .replace(/^```json\s*/i, "")
                  .replace(/```\s*$/i, "")
                  .trim();
                parsedData = JSON.parse(cleaned);
                break;
              } catch (parseErr) {
                console.warn(`JSON parse error from ${modelName}:`, parseErr);
              }
            }
          } catch (err: any) {
            lastError = err;
            const errMsg = err?.message || String(err);
            console.warn(`Model ${modelName} attempt ${attempts} failed:`, errMsg);

            const isHighDemandOrRateLimit =
              errMsg.includes("503") ||
              errMsg.includes("429") ||
              errMsg.includes("high demand") ||
              errMsg.includes("UNAVAILABLE") ||
              errMsg.includes("RESOURCE_EXHAUSTED");

            if (isHighDemandOrRateLimit && attempts < maxAttempts) {
              // Wait 1.2s before retrying
              await new Promise((resolve) => setTimeout(resolve, 1200));
            } else {
              break; // Switch to next fallback model
            }
          }
        }

        if (parsedData) break;
      }

      if (parsedData) {
        parsedData.isDog = true;
        parsedData.dogDetection = dogDetectionResult;
        return res.json({ success: true, isDog: true, dogDetection: dogDetectionResult, data: parsedData });
      }

      // If all live API models are temporarily unavailable due to upstream Google server load,
      // create a humorous intelligent fallback so the user never gets an ugly crash screen
      console.warn("All Gemini models encountered high demand; providing resilient backup analysis.");
      const fallbackAnalysis = {
        isDog: true,
        dogDetection: dogDetectionResult,
        breedIdentification: "This is a charismatic mystery canine with expressive, soulful eyes.",
        innerThought: "I demand to speak to whoever is in charge of dispensing the peanut butter biscuits immediately.",
        fullResponse: "This is a charismatic mystery canine with expressive, soulful eyes. I demand to speak to whoever is in charge of dispensing the peanut butter biscuits immediately.",
        mood: "Suspicious",
        moodSubtitle: "Calculating the exact distance between human hands and the snack counter",
        moodBoardLines: ["I'm", "Suspicious.", "Where", "Are", "My Snacks?"],
        barkEnergy: 68,
        energyCategory: "Hyper Fetcher",
        dogAlias: "The Snack Detective",
        traits: ["Master of Suspicion", "Cheese Sensor 3000", "Selective Hearing Expert"],
        favoriteActivity: "Intensely staring at anyone opening the refrigerator",
        dogSize: "medium",
        barkPitchHz: 260,
        barkTypeDescription: "Suspicious Snack Alert Boof",
      };

      return res.json({ success: true, isDog: true, dogDetection: dogDetectionResult, data: fallbackAnalysis, isFallback: true });
    } catch (err: unknown) {
      console.error("BarkLog Vision API final error handler:", err);
      const message = err instanceof Error ? err.message : "Failed to analyze dog image.";
      return res.status(500).json({ error: message });
    }
  });

  // API Route: Voice and Sound Effects Status check
  app.get("/api/voice-status", (req, res) => {
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
    res.json({
      elevenLabsConfigured: Boolean(elevenLabsKey),
      soundEffectsConfigured: Boolean(elevenLabsKey),
      provider: elevenLabsKey
        ? "ElevenLabs AI Voice & Sound Effects"
        : "Client Web Speech & Audio Synth",
    });
  });

  // In-memory sound effects cache to avoid duplicate API calls and ensure instant playback
  const soundFxCache = new Map<string, Buffer>();
  const inFlightSoundRequests = new Map<string, Promise<Buffer | null>>();

  // Sequential task queue for ElevenLabs Sound Generation to strictly prevent 429 concurrent_limit_exceeded errors
  let lastSoundGenTime = 0;
  let soundGenQueueTail = Promise.resolve();

  async function enqueueElevenLabsSoundGen(
    apiKey: string,
    soundPrompt: string
  ): Promise<Buffer | null> {
    const queuePromise = soundGenQueueTail.then(async () => {
      // Ensure minimum 350ms between requests to respect ElevenLabs rate & concurrency limits
      const now = Date.now();
      const timeSinceLast = now - lastSoundGenTime;
      if (timeSinceLast < 350) {
        await new Promise((resolve) => setTimeout(resolve, 350 - timeSinceLast));
      }
      lastSoundGenTime = Date.now();

      try {
        console.log(`[ElevenLabs Sound Gen] Requesting: "${soundPrompt.slice(0, 70)}..."`);
        const response = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text: soundPrompt.slice(0, 400),
            duration_seconds: 1.5,
            prompt_influence: 0.45,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          if (response.status === 429) {
            console.warn(`[ElevenLabs Sound Gen Rate Limited 429] Queuing backoff:`, errText);
            // Brief cooldown on 429
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } else {
            console.warn(`[ElevenLabs Sound Gen Error ${response.status}]:`, errText);
          }
          return null;
        }

        const audioArrayBuffer = await response.arrayBuffer();
        return Buffer.from(audioArrayBuffer);
      } catch (err) {
        console.warn("[ElevenLabs Sound Gen Exception]:", err);
        return null;
      }
    });

    soundGenQueueTail = queuePromise.then(() => {}).catch(() => {});
    return queuePromise;
  }

  // API Route: ElevenLabs Hyper-Realistic Dog Bark Sound Generator
  app.post("/api/bark-sound", async (req, res) => {
    try {
      const { prompt, breed, mood, dogSize, energy, dogAlias } = req.body || {};

      // Build rich, expressive audio prompt for ElevenLabs Sound Generator
      let soundPrompt = prompt;
      if (!soundPrompt || typeof soundPrompt !== "string") {
        const aliasLower = (dogAlias || "").toLowerCase();
        const breedLower = (breed || "").toLowerCase();
        const moodLower = (mood || "").toLowerCase();

        if (aliasLower.includes("pip") || (breedLower.includes("chihuahua") && moodLower.includes("chaos"))) {
          // Swapped with Milo's sound prompt
          soundPrompt =
            "Authentic mellow warm resonant mid-pitch dog bark boof sound effect with gentle friendly acoustic timber and soft tail resonance, calm happy dog woof";
        } else if (aliasLower.includes("milo") || moodLower.includes("philosophical")) {
          // Swapped with Pip's sound prompt
          soundPrompt =
            "Realistic high-pitched Chihuahua dog rapid frantic yip yip barking sound effect with fast sharp treble bursts and feisty toy dog excitement";
        } else {
          const breedName = breed || "dog";
          const sizeDescriptor = dogSize ? `${dogSize} ` : "";
          const moodDescriptor = mood ? ` expressing a ${mood} mood` : "";
          const energyRating = energy ? ` with energy level ${energy}%` : "";
          soundPrompt = `Authentic realistic sound effect of a ${sizeDescriptor}${breedName} dog barking with clear natural canine acoustic resonance${moodDescriptor}${energyRating}, real dog woof sound`;
        }
      }

      const cacheKey = soundPrompt.toLowerCase().trim();
      if (soundFxCache.has(cacheKey)) {
        const cached = soundFxCache.get(cacheKey)!;
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Length", cached.byteLength.toString());
        res.setHeader("X-Sound-Source", "elevenlabs-cache");
        return res.send(cached);
      }

      const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          useClientSynth: true,
          message: "ELEVENLABS_API_KEY not configured. Falling back to client acoustic synth.",
        });
      }

      // Deduplicate in-flight requests for the exact same prompt
      let soundPromise = inFlightSoundRequests.get(cacheKey);
      if (!soundPromise) {
        soundPromise = enqueueElevenLabsSoundGen(apiKey, soundPrompt).finally(() => {
          inFlightSoundRequests.delete(cacheKey);
        });
        inFlightSoundRequests.set(cacheKey, soundPromise);
      }

      const buffer = await soundPromise;

      if (!buffer) {
        return res.status(200).json({
          useClientSynth: true,
          error: "ElevenLabs sound generation unavailable, using client acoustic engine.",
        });
      }

      // Keep cache size bounded
      if (soundFxCache.size < 100) {
        soundFxCache.set(cacheKey, buffer);
      }

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", buffer.byteLength.toString());
      res.setHeader("X-Sound-Source", "elevenlabs-live");
      return res.send(buffer);
    } catch (err: unknown) {
      console.warn("ElevenLabs sound generation route exception:", err);
      return res.status(200).json({
        useClientSynth: true,
        error: "ElevenLabs sound generation unavailable, using client synth.",
      });
    }
  });

  // API Route: ElevenLabs High-Definition Voice Narration
  app.post("/api/narrate", async (req, res) => {
    try {
      const { text, personaId } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing required 'text' parameter." });
      }

      const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          useClientSynth: true,
          message: "ELEVENLABS_API_KEY not configured. Falling back to client-side voice synthesis.",
        });
      }

      // Dynamic voice resolution with reliable fallback
      // Uses the user's available voices on their tier, or standard core voices
      let availableVoiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel (Default Core voice)

      try {
        const voicesListRes = await fetch("https://api.elevenlabs.io/v1/voices", {
          headers: { "xi-api-key": apiKey },
        });
        if (voicesListRes.ok) {
          const listData = await voicesListRes.json();
          const userVoices = listData.voices || [];
          if (userVoices.length > 0) {
            // Match persona gender preference if possible
            if (personaId === "trailer" || personaId === "oldhound") {
              const maleVoice = userVoices.find((v: any) => v.labels?.gender === "male" || v.category === "premade");
              if (maleVoice) availableVoiceId = maleVoice.voice_id;
            } else if (personaId === "hyper" || personaId === "sassy") {
              const femaleVoice = userVoices.find((v: any) => v.labels?.gender === "female" || v.category === "premade");
              if (femaleVoice) availableVoiceId = femaleVoice.voice_id;
            } else {
              availableVoiceId = userVoices[0].voice_id;
            }
          }
        }
      } catch (listErr) {
        console.warn("[ElevenLabs Voices Lookup Notice]:", listErr);
      }

      console.log(`Generating ElevenLabs voice for persona '${personaId}' (using voice: ${availableVoiceId})...`);

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${availableVoiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.slice(0, 500), // safety limit
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        console.warn(`ElevenLabs API error (${response.status}):`, errorBody);
        return res.status(200).json({
          useClientSynth: true,
          error: `ElevenLabs returned ${response.status}. Falling back to client voice.`,
        });
      }

      const audioBuffer = await response.arrayBuffer();
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", audioBuffer.byteLength.toString());
      return res.send(Buffer.from(audioBuffer));
    } catch (err: unknown) {
      console.warn("ElevenLabs generation exception:", err);
      return res.status(200).json({
        useClientSynth: true,
        error: "ElevenLabs unavailable, falling back to client voice.",
      });
    }
  });

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
    res.json({
      status: "ok",
      app: "BarkLog AI",
      hasGeminiKey: Boolean(geminiKey),
      hasElevenLabsKey: Boolean(elevenLabsKey),
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BarkLog AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
