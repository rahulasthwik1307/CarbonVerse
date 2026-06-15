"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Confetti = () => {
  const colors = ["#4CAF50", "#FFD700", "#4A9B8E", "#F4A832", "#7BC67E"];
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  if (windowWidth === 0) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
      {Array.from({ length: 20 }).map((_, i) => {
        const left = Math.random() * windowWidth;
        const delay = Math.random() * 2;
        return (
          <motion.div
            key={i}
            initial={{ top: -20, left, scale: 0 }}
            animate={{ top: "110vh", scale: 1 }}
            transition={{ duration: 3, delay, ease: "easeIn" }}
            style={{ 
              position: "absolute", 
              width: 5, 
              height: 5, 
              borderRadius: "50%", 
              background: colors[i % colors.length] 
            }}
          />
        );
      })}
    </div>
  );
};

const FlowerSVG = ({ color }: { color: string }) => (
  <svg width="50" height="50" viewBox="0 0 50 50">
    <g transform="translate(25, 25)">
      {Array.from({length: 6}).map((_, i) => (
        <ellipse key={i} rx="6" ry="14" fill={color} transform={`rotate(${i * 60}) translate(0, -14)`} />
      ))}
      <circle r="7" fill="#FFC107" />
    </g>
  </svg>
);

const ButterflySVG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <motion.g animate={{ scaleX: [-1, 1, -1] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "20px 20px" }}>
      <path d="M 20 20 Q 5 5 15 5 Q 25 15 20 20 Z" fill="#9370DB" />
      <path d="M 20 20 Q 5 35 15 35 Q 25 25 20 20 Z" fill="#FFA500" />
      <path d="M 20 20 Q 35 5 25 5 Q 15 15 20 20 Z" fill="#9370DB" />
      <path d="M 20 20 Q 35 35 25 35 Q 15 25 20 20 Z" fill="#FFA500" />
    </motion.g>
    <rect x="19" y="8" width="2" height="24" rx="1" fill="#4A5568" />
  </svg>
);

const SproutSVG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <path d="M 20 40 Q 20 20 25 15" stroke="#5DB87A" strokeWidth="3" fill="none" />
    <path d="M 25 15 Q 35 10 30 20 Q 25 25 25 15 Z" fill="#5DB87A" />
    <path d="M 22 25 Q 10 20 15 30 Q 22 32 22 25 Z" fill="#82C059" />
  </svg>
);

const SeedSVG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    <ellipse cx="20" cy="30" rx="15" ry="6" fill="#8B5A2B" opacity="0.4" />
    <circle cx="20" cy="30" r="1.5" fill="#5D4037" opacity="0.6" />
    <circle cx="15" cy="29" r="1" fill="#5D4037" opacity="0.4" />
    <circle cx="25" cy="31" r="1" fill="#5D4037" opacity="0.4" />
  </svg>
);

export default function MemoryGarden() {
  const router = useRouter();
  const { decisions, profile, worldState, totalCarbonDelta, resetSession } = useSessionStore();
  const [narrative, setNarrative] = useState("");
  const [typedTitle, setTypedTitle] = useState("");
  
  const ecoCount = decisions.filter(d => d.impactType === "eco").length;
  const totalDecisions = decisions.length;
  
  const titleText = "Every eco choice you made planted something beautiful here.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedTitle(titleText.substring(0, i + 1));
      i++;
      if (i >= titleText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNarrative = async () => {
      try {
        const res = await fetch("/api/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: "garden complete",
            impactType: ecoCount > totalDecisions / 2 ? "eco" : "moderate",
            worldState,
            city: profile.city || "your city",
            chapter: "memory garden finale",
            aqi: 75
          })
        });
        const data = await res.json();
        setNarrative(data.narrative);
      } catch (e) {
        setNarrative("A beautiful legacy for tomorrow. 🌱");
      }
    };
    fetchNarrative();
  }, [ecoCount, totalDecisions, worldState, profile.city]);

  const gardenItems = decisions.map((d, i) => {
    if (d.impactType === "eco") {
      const types = ["tree", "flower", "butterfly", "sprout"];
      return { type: types[i % 4], planted: true, choice: d.choice, index: i };
    }
    if (d.impactType === "moderate") {
      return { type: "sprout", planted: true, choice: d.choice, index: i };
    }
    return { type: "seed", planted: false, choice: d.choice, index: i };
  });

  const getFlowerColor = (i: number) => {
    const colors = ["#FFB347", "#FF69B4", "#FF6B6B", "#FFD700"];
    return colors[i % colors.length];
  };

  const [shareState, setShareState] = useState<"idle"|"generating"|"ready">("idle");
  const [shareText, setShareText] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  const generateShareText = () => {
    const eco = decisions.filter(d=>d.impactType==="eco").length;
    const total = decisions.length;
    const carbon = Math.abs(totalCarbonDelta);
    const mood = worldState.planetMood;
    
    return `🌍 My CarbonVerse Story\n\n🌱 ${eco}/${total} eco choices made\n${totalCarbonDelta < 0 ? `▼ ${carbon} kg CO₂ saved` : `▲ ${carbon} kg CO₂ impact`}\n🌿 Planet Mood: ${mood}\n${profile.city ? `📍 ${profile.city}\n` : ""}\n${mood === "Thriving" ? "My garden is flourishing! 🌸🦋🌳" : mood === "Recovering" ? "My garden is growing stronger! 🌿🌱" : "Every eco choice grows my garden! 🌱"}\n\nPlay your own carbon story:\n#CarbonVerse #SustainabilityChallenge`;
  };

  const handleShare = async () => {
    setShareState("generating");
    const text = generateShareText();
    setShareText(text);
    
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My CarbonVerse Garden 🌱",
          text: text,
          url: window.location.origin,
        });
        setShareState("idle");
        return;
      } catch {
        // Fall through to copy
      }
    }
    
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setShareState("ready");
      // Reset after 3s
      setTimeout(() => setShareState("idle"), 3000);
    } catch {
      // Last fallback: show text in a modal
      setShareState("idle");
      setShowShareModal(true);
    }
  };

  const dateStr = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32, alignItems: "center" }}>
      {ecoCount === totalDecisions && <Confetti />}

      {/* HEADER */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 16 }}>
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <VerdOrb size={56} mood="eco" />
        </motion.div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2D5016", margin: 0 }}>Your Memory Garden 🌱</h1>
        <div style={{ textAlign: "center", height: 48, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 15, color: "#4A7C2F", fontWeight: 500 }}>{typedTitle}</div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} style={{ fontSize: 13, color: "#6B8F5E", fontStyle: "italic" }}>
            {ecoCount} out of {totalDecisions} choices grew your garden.
          </motion.div>
        </div>
      </div>

      {/* GARDEN VISUAL */}
      <div style={{ 
        width: "100%", 
        background: "linear-gradient(180deg, rgba(168,216,120,0.4) 0%, rgba(106,171,69,0.3) 100%)",
        border: "2px solid rgba(106,171,69,0.4)",
        borderRadius: 24,
        padding: "32px 24px",
        minHeight: 240,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}>
        {ecoCount === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 2, repeat: Infinity }}>
              <SeedSVG />
            </motion.div>
            <div style={{ color: "#2D5016", fontSize: 16, fontWeight: 600, textAlign: "center", fontStyle: "italic" }}>
              Your garden is waiting to bloom. <br/> Try again with different choices! 🌱
            </div>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", 
            gap: 24, 
            width: "100%",
            justifyItems: "center",
            alignItems: "end"
          }}>
            {gardenItems.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: i * 0.2 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              >
                <div style={{ height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  {item.type === "tree" && <div style={{ width: 80 }}><DotLottieReact src="/lottie/tree.json" loop autoplay /></div>}
                  {item.type === "flower" && <FlowerSVG color={getFlowerColor(i)} />}
                  {item.type === "butterfly" && <div style={{ paddingBottom: 20 }}><ButterflySVG /></div>}
                  {item.type === "sprout" && <SproutSVG />}
                  {item.type === "seed" && <SeedSVG />}
                </div>
                <div style={{ fontSize: 10, color: "#6B8F5E", fontWeight: 600, textAlign: "center", background: "rgba(255,255,255,0.4)", padding: "2px 8px", borderRadius: 8 }}>
                  {item.choice.length > 12 ? item.choice.substring(0, 12) + "..." : item.choice}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* STATS */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
        <div style={{ background: "rgba(76,175,80,0.1)", color: "#2D7A1F", padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
          🌱 {ecoCount} Plants Grown
        </div>
        <div style={{ background: "rgba(74,124,47,0.08)", color: "#4A7C2F", padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
          🌍 {totalCarbonDelta < 0 ? Math.abs(totalCarbonDelta) : 0} kg CO₂ saved
        </div>
        <div style={{ background: "rgba(0,0,0,0.05)", color: "#2D5016", padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
          🌤️ Planet: {worldState.planetMood.charAt(0).toUpperCase() + worldState.planetMood.slice(1)}
        </div>
      </div>

      {/* VERD'S GARDEN MESSAGE */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
        style={{ display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", padding: 20, borderRadius: 24, border: "1px solid #B8D4A8", width: "100%" }}
      >
        <VerdOrb size={40} mood={ecoCount > totalDecisions / 2 ? "eco" : "moderate"} />
        <div style={{ flex: 1, fontSize: 15, color: "#2D5016", fontStyle: "italic", fontWeight: 600, lineHeight: 1.5 }}>
          {narrative || "Growing this beautiful world alongside you! 🌱"}
        </div>
      </motion.div>

      {/* CERTIFICATE & RESTART */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
        style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderRadius: "1rem", padding: 24, border: "2px solid rgba(74,124,47,0.2)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ position: "absolute", top: 12, left: 12, fontSize: 24, opacity: 0.5 }}>🍃</div>
          <div style={{ position: "absolute", bottom: 12, right: 12, fontSize: 24, opacity: 0.5 }}>🍃</div>
          
          <div style={{ fontSize: 18, fontWeight: 800, color: "#2D5016" }}>🌍 CarbonVerse Story Complete</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#4A7C2F" }}>{profile.city || "Your City"}'s Carbon Champion</div>
          <div style={{ fontSize: 14, color: "#6B8F5E" }}>{ecoCount}/{totalDecisions} eco choices made</div>
          <div style={{ fontSize: 13, color: "#82C059", marginTop: 4, fontStyle: "italic" }}>{dateStr}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { resetSession(); router.push("/"); }}
            style={{ padding: "16px", background: "linear-gradient(135deg, #4A7C2F 0%, #2D5016 100%)", color: "white", borderRadius: 16, fontWeight: 600, fontSize: 16, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(45,80,22,0.2)" }}
          >
            🔄 Start a New Story
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            style={{ padding: "14px", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)", color: shareState === "ready" ? "#2D7A1F" : "#2D5016", borderRadius: 16, fontWeight: 600, fontSize: 15, border: "1px solid #B8D4A8", cursor: "pointer" }}
          >
            {shareState === "idle" ? "🌱 Share My Garden" : shareState === "generating" ? "Preparing..." : "✓ Copied to clipboard!"}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "white", padding: 24, borderRadius: 24, width: "100%", maxWidth: 400, border: "1px solid #B8D4A8", boxShadow: "0 12px 48px rgba(45,80,22,0.1)" }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#2D5016", marginBottom: 16 }}>Share Your Garden 🌱</h2>
              <textarea
                readOnly
                value={shareText}
                style={{ width: "100%", height: 160, padding: 12, borderRadius: 12, border: "1px solid rgba(184,212,168,0.5)", background: "rgba(74,124,47,0.05)", color: "#2D5016", fontSize: 14, resize: "none", marginBottom: 16 }}
              />
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowShareModal(false)}
                  style={{ flex: 1, padding: "12px", background: "rgba(0,0,0,0.05)", color: "#6B8F5E", borderRadius: 12, fontWeight: 600, border: "none", cursor: "pointer" }}
                >
                  Close
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(shareText); setShowShareModal(false); setShareState("ready"); setTimeout(() => setShareState("idle"), 3000); }}
                  style={{ flex: 1, padding: "12px", background: "#4A7C2F", color: "white", borderRadius: 12, fontWeight: 600, border: "none", cursor: "pointer" }}
                >
                  Copy Text
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
