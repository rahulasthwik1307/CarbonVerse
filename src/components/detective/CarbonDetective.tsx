"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import { DetectiveResult } from "@/types/carbon";
import ReceiptUpload from "./ReceiptUpload";
import DetectiveResults from "./DetectiveResults";
import ImpactCard from "./ImpactCard";
import VerdInsightCard from "./VerdInsightCard";
import MissionOpportunityCard from "./MissionOpportunityCard";
import BadgePreviewCard from "./BadgePreviewCard";
import VerdOrb from "@/components/ui/VerdOrb";

type DetectiveStep = "upload" | "analyzing" | "impact" | "insight" | "mission" | "badge" | "duplicate_warning" | "results" | "error";

export default function CarbonDetective() {
  const router = useRouter();
  const city = useSessionStore(s => s.profile.city);
  
  const [step, setStep] = useState<DetectiveStep>("upload");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("");
  const [result, setResult] = useState<DetectiveResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const loadingTexts = [
    "Verd is examining your receipt...",
    "Reading line items...",
    "Estimating carbon impact...",
    "Finding improvement opportunities...",
    "Building your report..."
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (step === "analyzing") {
      setLoadingTextIdx(0);
      setAnalyzingProgress(0);
      
      const timings = [800, 800, 900, 900];
      let currentStep = 0;
      
      const advance = () => {
        if (currentStep < timings.length) {
          timeout = setTimeout(() => {
            currentStep++;
            setLoadingTextIdx(currentStep);
            
            if (currentStep === 1) setAnalyzingProgress(25);
            else if (currentStep === 2) setAnalyzingProgress(50);
            else if (currentStep === 3) setAnalyzingProgress(75);
            else if (currentStep === 4) setAnalyzingProgress(95);

            advance();
          }, timings[currentStep]);
        }
      };
      advance();
    }
    return () => clearTimeout(timeout);
  }, [step]);

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
    const { addReceiptToMemoryBook, updateMissionProgress, checkAndUnlockAchievements, updateVerdContext } = useSessionStore.getState();
    
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

    updateVerdContext({
      lastReceiptType: dataToSave.receiptType,
      lastReceiptCO2: dataToSave.totalCO2,
      totalReceiptsAnalyzed: useSessionStore.getState().verdContext.totalReceiptsAnalyzed + 1
    });

    updateMissionProgress("receipt_upload");
    checkAndUnlockAchievements();

    setAnalyzingProgress(100);
    setTimeout(() => {
      setStep("results");
    }, 1200);
  };

  const handleReset = () => {
    setStep("upload");
    setImageBase64("");
    setMimeType("");
    setResult(null);
    setErrorMessage("");
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center px-4">
      {/* Outer Shell for double-bezel architecture */}
      <div 
        className="w-full p-1.5 rounded-[32px] transition-all duration-300"
        style={{
          background: "rgba(45, 80, 22, 0.03)",
          border: "1px solid rgba(184, 212, 168, 0.3)",
          boxShadow: "0 12px 48px rgba(45, 80, 22, 0.08)"
        }}
      >
        {/* Inner Core */}
        <div
          className="w-full p-6 md:p-8 rounded-[26px] flex flex-col relative overflow-hidden transition-all duration-300"
          style={{
            background: "rgba(255, 248, 231, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(184, 212, 168, 0.45)",
            boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.4)"
          }}
        >
          <AnimatePresence mode="wait">
            
            {/* UPLOAD STEP */}
            {step === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex flex-col items-center"
              >
                {/* Header Area */}
                <div className="flex flex-col items-center text-center mb-6">
                  <VerdOrb size={56} mood="eco" />
                  <h1 className="text-[26px] font-bold mt-4 tracking-tight" style={{ color: "#2D5016" }}>
                    Carbon Detective 🔍
                  </h1>
                  <p className="text-[14px] font-medium mt-1 leading-relaxed max-w-xs" style={{ color: "#4A7C2F" }}>
                    Upload a receipt. Verd reveals its carbon secrets.
                  </p>
                </div>
                
                <ReceiptUpload 
                  onImageReady={handleImageReady} 
                  isAnalyzing={false} 
                />
                
                <AnimatePresence>
                  {imageBase64 && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: 15, height: 0 }}
                      className="w-full mt-5 flex flex-col items-center overflow-hidden"
                    >
                      <button
                        onClick={handleAnalyze}
                        className="w-full max-w-md h-12 rounded-2xl font-semibold text-white shadow-md cursor-pointer transition-transform active:scale-[0.97]"
                        style={{
                          background: "linear-gradient(135deg, #4A7C2F 0%, #7BC67E 100%)",
                          boxShadow: "0 4px 16px rgba(74,124,47,0.2)"
                        }}
                      >
                        Analyze with Verd →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-center text-[12px] font-medium italic mt-6 max-w-xs" style={{ color: "#6B8F5E" }}>
                  Works with grocery bills, restaurant receipts, fuel slips, electricity bills, and more.
                </p>
              </motion.div>
            )}

            {/* ANALYZING STEP */}
            {step === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full flex flex-col items-center py-4"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <motion.div
                    animate={{ y: [-6, 6, -6] }}
                    transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
                    className="mb-4"
                  >
                    <VerdOrb size={64} mood="eco" />
                  </motion.div>
                  <h2 className="text-[20px] font-bold tracking-tight" style={{ color: "#2D5016" }}>
                    🕵️ Verd's Investigation
                  </h2>
                  <p className="text-[14px] font-medium mt-1" style={{ color: "#6B8F5E" }}>
                    Analyzing receipt carbon footprints...
                  </p>
                </div>

                {/* Checklist items */}
                <div className="w-full max-w-xs flex flex-col gap-3.5 my-6">
                  {[
                    { id: 0, text: "Reading receipt" },
                    { id: 1, text: "Identifying merchant" },
                    { id: 2, text: "Detecting line items" },
                    { id: 3, text: "Estimating carbon footprint" },
                    { id: 4, text: "Building Verd report" }
                  ].map((item) => {
                    const isCompleted = loadingTextIdx > item.id || analyzingProgress === 100;
                    const isCurrent = loadingTextIdx === item.id && analyzingProgress < 100;
                    
                    return (
                      <div key={item.id} className="flex items-center gap-3.5">
                        {isCompleted ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ background: "#4CAF50" }}
                          >
                            ✓
                          </motion.span>
                        ) : isCurrent ? (
                          <motion.span
                            animate={{ scale: [1, 1.12, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0"
                            style={{
                              background: "rgba(244, 168, 50, 0.15)",
                              border: "1.5px solid #F4A832",
                              color: "#F4A832"
                            }}
                          >
                            ⚡
                          </motion.span>
                        ) : (
                          <span 
                            className="w-5 h-5 rounded-full border border-dashed shrink-0"
                            style={{ borderColor: "rgba(184, 212, 168, 0.6)", borderWidth: "1.5px" }}
                          />
                        )}
                        <span 
                          className="text-[14px] transition-colors duration-200"
                          style={{ 
                            color: isCompleted ? "#2D5016" : isCurrent ? "#2D5016" : "#6B8F5E",
                            fontWeight: isCurrent ? "600" : "500",
                            opacity: isCompleted ? 0.75 : isCurrent ? 1 : 0.4
                          }}
                        >
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Bar & Percentage */}
                <div className="w-full max-w-xs flex flex-col gap-2 mt-4">
                  <div className="flex justify-between items-center px-1 text-[13px] font-bold" style={{ color: "#2D5016" }}>
                    <span className="opacity-70">Progress</span>
                    <span>{analyzingProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full relative overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 rounded-full"
                      style={{ background: "linear-gradient(90deg, #7BC67E 0%, #4CAF50 100%)" }}
                      animate={{ width: `${analyzingProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* RESULTS STEP */}
            {step === "results" && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center text-center gap-4"
              >
                <VerdOrb size={56} mood="high" />
                <div className="text-[32px]">😕</div>
                <p className="font-semibold text-[15px] leading-relaxed max-w-xs" style={{ color: "#8B6914" }}>
                  {errorMessage}
                </p>
                
                <div className="flex flex-col w-full max-w-xs gap-2.5 mt-2">
                  <button
                    onClick={handleReset}
                    className="w-full py-3 rounded-2xl font-semibold text-white cursor-pointer transition-transform active:scale-[0.97]"
                    style={{ background: "#F4A832", boxShadow: "0 4px 12px rgba(244,168,50,0.3)" }}
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push("/story")}
                    className="w-full py-3 rounded-2xl font-medium cursor-pointer transition-transform active:scale-[0.97]"
                    style={{ 
                      background: "rgba(255,255,255,0.5)", 
                      border: "1px solid rgba(244,168,50,0.4)",
                      color: "#8B6914"
                    }}
                  >
                    Start Story Instead
                  </button>
                </div>
              </motion.div>
            )}

            {/* DUPLICATE WARNING STEP */}
            {step === "duplicate_warning" && result && (
              <motion.div
                key="duplicate_warning"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center text-center gap-4"
              >
                <div className="text-[36px]">⚠️</div>
                <h2 className="text-lg font-bold" style={{ color: "#8B6914" }}>Similar Receipt Detected</h2>
                <p className="font-semibold text-[14px] leading-relaxed max-w-xs" style={{ color: "#A06000" }}>
                  This receipt appears similar to one already analyzed.
                </p>
                
                <div className="flex flex-col w-full max-w-xs gap-2.5 mt-2">
                  <button
                    onClick={() => proceedWithResult(result)}
                    className="w-full py-3 rounded-2xl font-semibold text-white cursor-pointer transition-transform active:scale-[0.97]"
                    style={{ background: "#F4A832", boxShadow: "0 4px 12px rgba(244,168,50,0.3)" }}
                  >
                    Analyze Again
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full py-3 rounded-2xl font-medium cursor-pointer transition-transform active:scale-[0.97]"
                    style={{ 
                      background: "rgba(255,255,255,0.5)", 
                      border: "1px solid rgba(244,168,50,0.4)",
                      color: "#8B6914"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
