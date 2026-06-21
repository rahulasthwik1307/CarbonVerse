"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface ReceiptUploadProps {
  onImageReady: (base64: string, mimeType: string) => void;
  isAnalyzing: boolean;
}

export default function ReceiptUpload({ onImageReady, isAnalyzing }: ReceiptUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndProcessFile = (file: File) => {
    setError("");

    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimeTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG or WEBP image 📸");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Please use a photo under 5MB 📏");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target?.result as string;
      if (dataURL) {
        setPreview(dataURL);
        const base64 = dataURL.split(",")[1];
        onImageReady(base64, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!preview && !isAnalyzing) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (!preview && !isAnalyzing && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={preview ? -1 : 0}
        role="button"
        aria-label="Upload receipt image"
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? "#4CAF50" : "#B8D4A8",
          backgroundColor: isDragging ? "rgba(76,175,80,0.08)" : "rgba(240,250,240,0.5)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          minHeight: 220,
          borderRadius: 24,
          borderStyle: "dashed",
          borderWidth: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: preview ? "default" : "pointer",
          width: "100%",
          padding: 24,
          position: "relative",
          overflow: "hidden"
        }}
      >
        {!preview && !isAnalyzing && (
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
              style={{ fontSize: 56, marginBottom: 12 }}
            >
              📄
            </motion.div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#2D5016", marginBottom: 4 }}>
              Drop your receipt here
            </div>
            <div style={{ fontSize: 13, color: "#6B8F5E", marginBottom: 8 }}>
              Food • Fuel • Electricity • Shopping
            </div>
            <div style={{ fontSize: 14, color: "#F4A832", fontWeight: 500 }}>
              or click to browse
            </div>
            <div style={{ fontSize: 11, color: "#A8BEA9", marginTop: 8 }}>
              Accepted: JPG, PNG, WEBP • Max 5MB
            </div>
          </div>
        )}

        {preview && !isAnalyzing && (
          <div className="flex flex-col items-center w-full text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={preview} 
              alt="Receipt preview" 
              style={{ 
                maxHeight: 200, 
                borderRadius: 16, 
                objectFit: "contain",
                marginBottom: 16 
              }} 
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(184,212,168,0.6)",
                color: "#2D5016",
                borderRadius: 12,
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              Change photo
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid rgba(74,124,47,0.2)",
                borderTopColor: "#4A7C2F",
                marginBottom: 16
              }}
            />
            <div style={{ fontSize: 16, fontWeight: 500, color: "#2D5016" }}>
              Verd is reading your receipt...
            </div>
          </div>
        )}
        
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ref={inputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: [-5, 5, -3, 3, 0] }}
          transition={{ duration: 0.4 }}
          style={{
            marginTop: 16,
            background: "rgba(255,107,107,0.08)",
            border: "1px solid rgba(255,107,107,0.3)",
            color: "#A0401A",
            fontSize: 13,
            padding: "8px 16px",
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 500
          }}
        >
          <span>⚠️</span> {error}
        </motion.div>
      )}
    </div>
  );
}
