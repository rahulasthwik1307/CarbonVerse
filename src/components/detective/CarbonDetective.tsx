"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import { DetectiveResult } from "@/types/carbon";
import ReceiptUpload from "./ReceiptUpload";
import DetectiveResults from "./DetectiveResults";
import VerdOrb from "@/components/ui/VerdOrb";

type DetectiveStep = "upload" | "analyzing" | "duplicate_warning" | "results" | "error";

export default function CarbonDetective() {
  const router = useRouter();
  const city = useSessionStore(s => s.profile.city);
  
  const [step, setStep] = useState<DetectiveStep>("upload");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("");
  const [result, setResult] = useState<DetectiveResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const loadingTexts = [
    "Reading your receipt... 🔍",
    "Calculating carbon footprint... 🌍",
    "Finding green alternatives... 🌱"
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "analyzing") {
      interval = setInterval(() => {
        setLoadingTextIdx(prev => (prev + 1) % loadingTexts.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [step, loadingTexts.length]);

  const handleImageReady = (base64: string, mime: string) => {
    setImageBase64(base64);
    setMimeType(mime);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setStep("analyzing");
    
    try {
      const res = await fetch("/api/detective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          city: city || "India"
        })
      });
      
      const data = await res.json();
      
      if (!data.isValid) {
        setErrorMessage(data.invalidReason || "This doesn't look like a receipt. Please try a different image.");
        setStep("error");
        return;
      }
      
      setResult(data);

      const { memoryBook } = useSessionStore.getState();
      const isDuplicate = memoryBook.receipts.some(r => 
        r.merchantName === data.merchantName &&
        r.receiptType === data.receiptType &&
        Math.abs(r.totalCO2 - data.totalCO2) < 0.5
      );

      if (isDuplicate) {
        setStep("duplicate_warning");
        return;
      }
      
      proceedWithResult(data);
      
    } catch {
      setErrorMessage("Connection failed. Please check your internet and try again.");
      setStep("error");
    }
  };

  const proceedWithResult = (dataToSave: any) => {
    const { addReceiptToMemoryBook, updateMissionProgress, checkAndUnlockAchievements } = useSessionStore.getState();
    
    addReceiptToMemoryBook({
      receiptType: dataToSave.receiptType,
      merchantName: dataToSave.merchantName || "Unknown",
      totalCO2: dataToSave.totalCO2,
      impactLevel: dataToSave.impactLevel,
      items: dataToSave.items.map((i: any) => ({
        name: i.name,
        estimatedCO2: i.estimatedCO2
      }))
    });

    updateMissionProgress("receipt_upload");
    checkAndUnlockAchievements();

    setStep("results");
  };

  const handleReset = () => {
    setStep("upload");
    setImageBase64("");
    setMimeType("");
    setResult(null);
    setErrorMessage("");
  };

  return (
    <div className="w-full max-w-150 mx-auto flex flex-col items-center">
      
      {/* Header - always visible */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <VerdOrb size={40} />
        <h1 className="text-2xl font-bold mt-4" style={{ color: "#2D5016" }}>Carbon Detective 🔍</h1>
        <p className="text-[15px] font-medium mt-1" style={{ color: "#4A7C2F" }}>
          Upload a receipt. Verd reveals its carbon secrets.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        
        {/* UPLOAD STEP */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex flex-col items-center"
          >
            <ReceiptUpload 
              onImageReady={handleImageReady} 
              isAnalyzing={false} 
            />
            
            <AnimatePresence>
              {imageBase64 && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 20, height: 0 }}
                  className="w-full mt-6 flex flex-col items-center overflow-hidden"
                >
                  <button
                    onClick={handleAnalyze}
                    className="w-full max-w-md h-13 rounded-2xl font-semibold text-white shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #4A7C2F 0%, #7BC67E 100%)",
                      boxShadow: "0 4px 16px rgba(74,124,47,0.25)"
                    }}
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full h-full flex items-center justify-center">
                      Analyze with Verd →
                    </motion.div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-[13px] italic mt-6 max-w-sm" style={{ color: "#6B8F5E" }}>
              Works with grocery bills, restaurant receipts, fuel slips, electricity bills, and more.
            </p>
          </motion.div>
        )}

        {/* ANALYZING STEP */}
        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-12 w-full"
          >
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
            >
              <VerdOrb size={64} mood="eco" />
            </motion.div>
            <div className="h-8 mt-6 flex items-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingTextIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[16px] font-medium"
                  style={{ color: "#2D5016" }}
                >
                  {loadingTexts[loadingTextIdx]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* RESULTS STEP */}
        {step === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <DetectiveResults result={result} city={city || ""} onReset={handleReset} />
          </motion.div>
        )}

        {/* ERROR STEP */}
        {step === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md p-6 rounded-3xl flex flex-col items-center text-center gap-5"
            style={{
              background: "rgba(255,248,230,0.9)",
              border: "2px solid rgba(244,168,50,0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <VerdOrb size={56} mood="high" />
            <div className="text-[40px]">😕</div>
            <p className="font-medium text-[16px] leading-relaxed" style={{ color: "#8B6914" }}>
              {errorMessage}
            </p>
            
            <div className="flex flex-col w-full gap-3 mt-2">
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-2xl font-semibold text-white"
                style={{ background: "#F4A832", boxShadow: "0 4px 12px rgba(244,168,50,0.3)" }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Try Again
                </motion.div>
              </button>
              <button
                onClick={() => router.push("/story")}
                className="w-full py-3 rounded-2xl font-medium"
                style={{ 
                  background: "rgba(255,255,255,0.5)", 
                  border: "1px solid rgba(244,168,50,0.4)",
                  color: "#8B6914"
                }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Start Story Instead
                </motion.div>
              </button>
            </div>
          </motion.div>
        )}

        {/* DUPLICATE WARNING STEP */}
        {step === "duplicate_warning" && result && (
          <motion.div
            key="duplicate_warning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md p-6 rounded-3xl flex flex-col items-center text-center gap-5"
            style={{
              background: "rgba(255,248,230,0.9)",
              border: "2px solid rgba(244,168,50,0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div className="text-[40px]">⚠️</div>
            <h2 className="text-xl font-bold" style={{ color: "#8B6914" }}>Similar Receipt Detected</h2>
            <p className="font-medium text-[15px] leading-relaxed" style={{ color: "#A06000" }}>
              This receipt appears similar to one already analyzed.
            </p>
            
            <div className="flex flex-col w-full gap-3 mt-2">
              <button
                onClick={() => proceedWithResult(result)}
                className="w-full py-3 rounded-2xl font-semibold text-white"
                style={{ background: "#F4A832", boxShadow: "0 4px 12px rgba(244,168,50,0.3)" }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Analyze Again
                </motion.div>
              </button>
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-2xl font-medium"
                style={{ 
                  background: "rgba(255,255,255,0.5)", 
                  border: "1px solid rgba(244,168,50,0.4)",
                  color: "#8B6914"
                }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Cancel
                </motion.div>
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
