import React, { useRef, useState } from "react";
import { Upload, Camera, Sparkles, Image as ImageIcon, CheckCircle, RefreshCw, X, Volume2 } from "lucide-react";
import { SampleDog } from "../types";
import { SAMPLE_DOGS } from "../data/sampleDogs";
import { playCameraClick, playBarkSound } from "../utils/audioSynth";

interface PhotoUploaderProps {
  onImageSelected: (base64: string, previewUrl: string, sampleDog?: SampleDog) => void;
  isLoading: boolean;
  soundEnabled: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onImageSelected,
  isLoading,
  soundEnabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [barkingDogId, setBarkingDogId] = useState<string | null>(null);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const compressAndResizeImage = (fileOrBlob: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1024;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve(compressedDataUrl);
        };
        img.onerror = () => {
          resolve(readerEvent.target?.result as string);
        };
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(fileOrBlob);
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    if (soundEnabled) playCameraClick();

    try {
      const optimizedBase64 = await compressAndResizeImage(file);
      onImageSelected(optimizedBase64, optimizedBase64);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onImageSelected(base64, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample dog selection
  const handleSelectSample = async (dog: SampleDog) => {
    setBarkingDogId(dog.id);
    setTimeout(() => setBarkingDogId(null), 1200);

    if (soundEnabled) {
      playBarkSound({
        ...dog.analysis,
        dogAlias: dog.name,
        breedIdentification: dog.breed,
        soundPrompt: dog.soundPrompt || dog.analysis.soundPrompt,
      });
    }

    try {
      // Fetch sample image and convert to Base64
      const res = await fetch(dog.imageUrl);
      const blob = await res.blob();
      const optimizedBase64 = await compressAndResizeImage(blob);
      onImageSelected(optimizedBase64, dog.imageUrl, dog);
    } catch {
      // Fallback directly with URL
      onImageSelected(dog.imageUrl, dog.imageUrl, dog);
    }
  };

  // Camera Live Snapshot
  const openCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or unavailable. Please use file upload.");
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    if (soundEnabled) playCameraClick();

    const canvas = document.createElement("canvas");
    const videoW = videoRef.current.videoWidth || 640;
    const videoH = videoRef.current.videoHeight || 480;

    // Scale to max 1024
    const maxDim = 1024;
    let width = videoW;
    let height = videoH;
    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const base64 = canvas.toDataURL("image/jpeg", 0.85);
      closeCamera();
      onImageSelected(base64, base64);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Primary Upload Dropzone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl md:rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-[#E06D53] bg-[#FAF1E4] scale-[1.01]"
            : "border-[#DFD5C6] bg-white hover:border-[#C84F36]/60 hover:bg-[#FAF7F2]/50 shadow-sm"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center max-w-md mx-auto">
          {/* Animated upload icon circle */}
          <div className="w-16 h-16 rounded-2xl bg-[#FAF1E4] border border-[#E8DFD1] text-[#C84F36] flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h3 className="font-display font-bold text-xl sm:text-2xl text-[#2B1F17] mb-2">
            Upload Your Dog's Photo
          </h3>
          <p className="text-sm text-[#7A6A5E] leading-relaxed mb-6">
            Drag and drop any dog photo here, browse your files, or take a fresh photo.
            Gemini AI will analyze their breed, hilarious inner monologue, and energy meter!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#2B1F17] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#433227] transition-all active:scale-95 flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Choose Photo</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openCamera();
              }}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#DFD5C6] text-[#4A3A2F] text-xs sm:text-sm font-bold hover:bg-[#F9F5F0] hover:border-[#C84F36]/40 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
            >
              <Camera className="w-4 h-4 text-[#C84F36]" />
              <span>Take Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instant Test Sample Dog Shelf */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFD1] shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E06D53]" />
            <h4 className="font-display font-bold text-sm sm:text-base text-[#2B1F17]">
              No photo handy? Try a Sample Dog:
            </h4>
          </div>
          <span className="text-xs text-[#8C7D72] font-medium hidden sm:inline">
            1-Click Instant Analysis
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {SAMPLE_DOGS.map((dog) => {
            const isThisBarking = barkingDogId === dog.id;
            return (
              <button
                key={dog.id}
                onClick={() => handleSelectSample(dog)}
                disabled={isLoading}
                title={`Click to analyze ${dog.name} & play bark sound`}
                className={`group text-left rounded-xl overflow-hidden border bg-[#FAF7F2] hover:border-[#E06D53] hover:shadow-md transition-all active:scale-95 flex flex-col focus:outline-none cursor-pointer relative ${
                  isThisBarking ? "border-[#E06D53] ring-2 ring-[#E06D53]/30 shadow-md" : "border-[#E8DFD1]"
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                  <img
                    src={dog.imageUrl}
                    alt={dog.name}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isThisBarking ? "scale-110" : "group-hover:scale-108"
                    }`}
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {dog.analysis.mood}
                  </span>
                  {isThisBarking && (
                    <span className="absolute top-1 left-1 bg-[#E06D53] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm animate-pulse">
                      <Volume2 className="w-2.5 h-2.5" />
                      Bark!
                    </span>
                  )}
                </div>
                <div className="p-2 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-[#2B1F17] truncate">{dog.name}</p>
                    <Volume2 className={`w-3 h-3 text-[#E06D53] opacity-60 group-hover:opacity-100 ${isThisBarking ? "animate-bounce opacity-100" : ""}`} />
                  </div>
                  <p className="text-[10px] text-[#7A6A5E] truncate">{dog.breed}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-[#E8DFD1] flex flex-col">
            <div className="p-4 border-b border-[#E8DFD1] flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#C84F36]" />
                <h3 className="font-display font-bold text-base text-[#2B1F17]">
                  Doggo Camera
                </h3>
              </div>
              <button
                onClick={closeCamera}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#7A6A5E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-white">
                  <p className="text-sm mb-3">{cameraError}</p>
                  <button
                    onClick={closeCamera}
                    className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {!cameraError && (
              <div className="p-4 flex items-center justify-center gap-4 bg-[#FAF7F2]">
                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-4 py-2 rounded-xl bg-white border border-[#DFD5C6] text-xs font-semibold text-[#5A493E]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-2.5 rounded-xl bg-[#E06D53] hover:bg-[#C84F36] text-white text-sm font-bold flex items-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo!</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
