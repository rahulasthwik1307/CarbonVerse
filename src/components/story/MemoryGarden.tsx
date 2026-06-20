"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";

// SVG Monoline Icons for Social Sharing
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

// Reusable Double-Bezel nested card wrapper
const DoubleBezelCard = ({ children, style = {}, innerStyle = {}, ...props }: any) => {
  return (
    <div
      style={{
        background: "rgba(184, 212, 168, 0.15)", // Outer gold/green wash shell
        border: "1.5px solid rgba(184, 212, 168, 0.4)",
        borderRadius: 24,
        padding: 6,
        boxSizing: "border-box",
        ...style
      }}
      {...props}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.85)", // Inner core
          border: "1px solid rgba(184, 212, 168, 0.5)",
          borderRadius: 18,
          padding: 16,
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 20px rgba(45, 80, 22, 0.08)",
          ...innerStyle
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Shimmering skeleton loader for narrative text
function SkeletonLine({ width, height }: { width: string; height: number }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", height, width, borderRadius: 8, background: "#E8F5E3" }}>
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)" }}
      />
    </div>
  );
}

export default function MemoryGarden() {
  const router = useRouter();
  const { decisions, profile, worldState, totalCarbonDelta, resetSession } = useSessionStore();
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [alertText, setAlertText] = useState("");

  const ecoCount = decisions.filter(d => d.impactType === "eco").length;
  const highCount = decisions.filter(d => d.impactType === "high").length;
  const totalDecisions = decisions.length;

  // Outcome calculation
  let outcome: "eco" | "moderate" | "high" = "moderate";
  if (totalDecisions > 0) {
    if (ecoCount >= 4 || (totalCarbonDelta < 0 && ecoCount > highCount)) {
      outcome = "eco";
    } else if (highCount >= 3 || (totalCarbonDelta > 0 && highCount > ecoCount)) {
      outcome = "high";
    } else {
      outcome = "moderate";
    }
  }

  // Outcome details mapping
  const outcomeDetails = {
    eco: {
      videoUrl: "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781964179/Eco_Friendly_bkouq6.mp4",
      title: "🌿 Flourishing Future",
      desc: "Your choices helped ecosystems recover, wildlife thrive, and biodiversity expand."
    },
    moderate: {
      videoUrl: "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781964180/Moderate_w9k3qc.mp4",
      title: "🌱 Recovering Future",
      desc: "Nature is healing, but still needs more conscious choices."
    },
    high: {
      videoUrl: "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781964180/High_Carbon_hktodv.mp4",
      title: "🌫 Fragile Future",
      desc: "The ecosystem survived, but many opportunities were missed."
    }
  }[outcome];

  // Narrative fetch
  useEffect(() => {
    const fetchNarrative = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: "garden complete",
            impactType: outcome,
            worldState,
            city: profile.city || "your city",
            chapter: "memory garden finale",
            aqi: 75
          })
        });
        const data = await res.json();
        setNarrative(data.narrative);
      } catch (e) {
        // Poetic fallback on error
        setNarrative("");
      } finally {
        setLoading(false);
      }
    };
    fetchNarrative();
  }, [outcome, worldState, profile.city]);

  // Decision lookups for Story Reflection
  const getTransportReflection = () => {
    const transportDec = decisions.find(d => 
      ["Walk or cycle", "Take the metro", "Book a cab"].includes(d.choice)
    );
    if (!transportDec) return { emoji: "🚶", text: "Chose cleaner transport" };
    const lower = transportDec.choice.toLowerCase();
    if (lower.includes("walk") || lower.includes("cycle")) return { emoji: "🚶", text: "Chose cleaner transport" };
    if (lower.includes("metro")) return { emoji: "🚇", text: "Took public transit" };
    return { emoji: "🚗", text: "Used private motor travel" };
  };

  const getFoodReflection = () => {
    const b = decisions.find(d => ["Plant-based meal", "Local dhaba", "Delivery burger"].includes(d.choice));
    const l = decisions.find(d => ["Home-cooked tiffin", "Office canteen", "Food delivery app"].includes(d.choice));
    const dn = decisions.find(d => ["Cook at home", "Order vegetarian", "Order meat dish"].includes(d.choice));
    
    const foodDecs = [b, l, dn].filter(Boolean);
    const ecoFoodCount = foodDecs.filter(f => f?.impactType === "eco").length;
    const highFoodCount = foodDecs.filter(f => f?.impactType === "high").length;
    
    if (ecoFoodCount >= 2) {
      return { emoji: "🥗", text: "Picked lower-impact meals" };
    } else if (highFoodCount >= 2) {
      return { emoji: "🍔", text: "Chose higher-footprint meals" };
    } else {
      return { emoji: "🥗", text: "Picked balanced meal options" };
    }
  };

  const getCommunityReflection = () => {
    const s = decisions.find(d => ["Local kirana store", "Order online", "Drive to the mall"].includes(d.choice));
    if (!s) return { emoji: "🏪", text: "Supported local communities" };
    if (s.choice === "Local kirana store") return { emoji: "🏪", text: "Supported local communities" };
    if (s.choice === "Order online") return { emoji: "📦", text: "Ordered delivery items online" };
    return { emoji: "🏬", text: "Visited major commercial mall" };
  };

  const getPoeticReflection = () => {
    if (narrative) return narrative;
    if (outcome === "eco") return "Nature responded with healthier habitats, cleaner water, and richer biodiversity.";
    if (outcome === "high") return "Nature faced heavy strain, leaving the ecosystem fragile and searching for breath.";
    return "Nature responded with steady healing, but the recovery remains fragile.";
  };

  // Share Message generation
  const generateShareMessage = () => {
    const transport = getTransportReflection();
    const food = getFoodReflection();
    const community = getCommunityReflection();
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://carbonverse.earth";
    
    return `🌱 I completed my CarbonVerse journey.

Today my choices helped shape a healthier future.

${transport.emoji} ${transport.text}
${food.emoji} ${food.text}
${community.emoji} ${community.text}

My Memory Garden became a living ecosystem filled with ${
      outcome === "eco" 
        ? "wildlife, clean water, and biodiversity" 
        : outcome === "moderate" 
          ? "budding plants and returning birds" 
          : "resilient vegetation striving to adapt"
    }.

Explore your own future:
${shareUrl}

#CarbonVerse
#ClimateAction
#Sustainability`;
  };

  // Handle Share Click
  const handleShareClick = (platform: "x" | "linkedin" | "facebook" | "instagram" | "copy") => {
    const message = generateShareMessage();
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://carbonverse.earth";
    
    if (platform === "copy") {
      navigator.clipboard.writeText(message);
      setCopied(true);
      setAlertText("Journey summary copied to clipboard!");
      setTimeout(() => {
        setCopied(false);
        setAlertText("");
      }, 3000);
      return;
    }

    if (platform === "instagram") {
      navigator.clipboard.writeText(message);
      setAlertText("Caption copied! Open Instagram to share.");
      setTimeout(() => setAlertText(""), 4000);
      return;
    }

    let url = "";
    if (platform === "x") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    } else if (platform === "linkedin") {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=450,resizable=yes");
    }
  };

  const transportRef = getTransportReflection();
  const foodRef = getFoodReflection();
  const communityRef = getCommunityReflection();

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        height: "100%",
        boxSizing: "border-box"
      }}
    >
      <style>{`
        @media (min-width: 1024px) {
          .garden-layout-grid {
            display: grid !important;
            grid-template-columns: 7fr 3fr !important;
            gap: 24px !important;
            flex-grow: 1 !important;
            height: 0 !important; /* Forces grid elements to obey container flex bounds */
            min-height: 0 !important;
          }
        }
        @media (max-width: 1023px) {
          .garden-layout-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
            height: auto !important;
          }
          .video-card-bezel {
            height: 380px !important;
          }
          .bento-card-stack {
            height: auto !important;
          }
        }
        @media (max-width: 480px) {
          .video-card-bezel {
            height: 240px !important;
          }
          .garden-header-container {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .play-again-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <motion.div
        className="garden-header-container"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <VerdOrb size={52} mood={outcome === "eco" ? "eco" : outcome === "high" ? "high" : "moderate"} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#2D5016", margin: 0, lineHeight: 1.1 }}>
              Your Memory Garden 🌱
            </h1>
            <p style={{ fontSize: 13, color: "#4A7C2F", margin: "3px 0 0 0", fontWeight: 600, lineHeight: 1.2 }}>
              Every choice you made helped nature flourish.
            </p>
          </div>
        </div>

        {/* Minimal Play Again CTA in Header */}
        <motion.button
          className="play-again-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { resetSession(); router.push("/"); }}
          style={{
            padding: "8px 16px",
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid #B8D4A8",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            color: "#2D5016",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
            boxShadow: "0 2px 10px rgba(45, 80, 22, 0.05)",
            transition: "transform 150ms ease-out"
          }}
        >
          Play Again ↺
        </motion.button>
      </motion.div>

      {/* BENTO LAYOUT */}
      <div className="garden-layout-grid">
        
        {/* LEFT COLUMN: Large Hero Video Card (70%) */}
        <motion.div
          className="video-card-bezel"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{
            background: "rgba(184, 212, 168, 0.15)", // Outer shell
            border: "1.5px solid rgba(184, 212, 168, 0.4)",
            borderRadius: 24,
            padding: 6,
            boxSizing: "border-box",
            height: "100%",
            position: "relative"
          }}
        >
          <div
            style={{
              borderRadius: 18,
              height: "100%",
              width: "100%",
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(184, 212, 168, 0.5)",
              boxShadow: "0 8px 32px rgba(45, 80, 22, 0.08)"
            }}
          >
            <video
              src={outcomeDetails.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Dark vignette overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle, transparent 40%, rgba(45,80,22,0.18) 100%)",
                pointerEvents: "none"
              }}
            />
            
            {/* Visual payoffs pill in corner */}
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(184, 212, 168, 0.6)",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: "#2D5016",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: outcome === "eco" ? "#4CAF50" : outcome === "high" ? "#FF6B6B" : "#F4A832" }} />
              Live Ecosystem Visualizer
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Stacked Bento Cards (30%) */}
        <div
          className="bento-card-stack"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            height: "100%",
            boxSizing: "border-box"
          }}
        >
          {/* Card 1: Future Outcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ flex: 1 }}
          >
            <DoubleBezelCard style={{ height: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B8F5E", marginBottom: 6 }}>
                  World Outcome
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2D5016", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 6 }}>
                  {outcomeDetails.title}
                </h2>
                <p style={{ fontSize: 13, color: "#4A7C2F", margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                  {outcomeDetails.desc}
                </p>
              </div>
            </DoubleBezelCard>
          </motion.div>

          {/* Card 2: Story Reflection Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.65, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ flex: 1.8 }}
          >
            <DoubleBezelCard style={{ height: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B8F5E", marginBottom: 12 }}>
                    Today's Story
                  </div>
                  
                  {totalDecisions === 0 ? (
                    <div style={{ padding: "10px 0", fontSize: 13, color: "#6B8F5E", fontStyle: "italic" }}>
                      No choices recorded in this run. Start a new chapter! 🌱
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#2D5016", fontWeight: 700 }}>
                        <span style={{ fontSize: 16 }}>{transportRef.emoji}</span>
                        <span>{transportRef.text}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#2D5016", fontWeight: 700 }}>
                        <span style={{ fontSize: 16 }}>{foodRef.emoji}</span>
                        <span>{foodRef.text}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#2D5016", fontWeight: 700 }}>
                        <span style={{ fontSize: 16 }}>{communityRef.emoji}</span>
                        <span>{communityRef.text}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  borderTop: "1px dashed rgba(184, 212, 168, 0.4)", 
                  paddingTop: 12, 
                  marginTop: 12
                }}>
                  {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <SkeletonLine width="90%" height={12} />
                      <SkeletonLine width="60%" height={12} />
                    </div>
                  ) : (
                    <p style={{ 
                      fontSize: 13, 
                      color: "#4A7C2F", 
                      fontStyle: "italic", 
                      fontWeight: 600,
                      lineHeight: 1.4,
                      margin: 0
                    }}>
                      {getPoeticReflection()}
                    </p>
                  )}
                </div>
              </div>
            </DoubleBezelCard>
          </motion.div>

          {/* Card 3: Share Garden Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.85, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ flex: 1.4 }}
          >
            <DoubleBezelCard style={{ height: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B8F5E", marginBottom: 10 }}>
                    Share Garden
                  </div>
                  
                  {/* Social Buttons Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, width: "100%" }}>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleShareClick("x")}
                      style={{
                        background: "rgba(255, 255, 255, 0.55)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(184, 212, 168, 0.5)",
                        borderRadius: 12,
                        padding: "10px",
                        color: "#2D5016",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(45, 80, 22, 0.04)"
                      }}
                      title="Share on X"
                    >
                      <XIcon />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleShareClick("linkedin")}
                      style={{
                        background: "rgba(255, 255, 255, 0.55)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(184, 212, 168, 0.5)",
                        borderRadius: 12,
                        padding: "10px",
                        color: "#2D5016",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(45, 80, 22, 0.04)"
                      }}
                      title="Share on LinkedIn"
                    >
                      <LinkedInIcon />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleShareClick("instagram")}
                      style={{
                        background: "rgba(255, 255, 255, 0.55)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(184, 212, 168, 0.5)",
                        borderRadius: 12,
                        padding: "10px",
                        color: "#2D5016",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(45, 80, 22, 0.04)"
                      }}
                      title="Copy for Instagram"
                    >
                      <InstagramIcon />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleShareClick("facebook")}
                      style={{
                        background: "rgba(255, 255, 255, 0.55)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(184, 212, 168, 0.5)",
                        borderRadius: 12,
                        padding: "10px",
                        color: "#2D5016",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(45, 80, 22, 0.04)"
                      }}
                      title="Share on Facebook"
                    >
                      <FacebookIcon />
                    </motion.button>
                  </div>
                </div>

                {/* Copy Link Button & Alert Area */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleShareClick("copy")}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#F4A832",
                      color: "white",
                      borderRadius: 14,
                      border: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                      boxShadow: "0 3px 10px rgba(244, 168, 50, 0.3)"
                    }}
                  >
                    <CopyIcon />
                    {copied ? "✓ Copied!" : "Copy Summary & Link"}
                  </motion.button>

                  <AnimatePresence>
                    {alertText && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          background: "rgba(74, 124, 47, 0.1)",
                          border: "1px solid rgba(74, 124, 47, 0.25)",
                          borderRadius: 10,
                          padding: "6px 10px",
                          fontSize: 11,
                          color: "#4A7C2F",
                          fontWeight: 700,
                          textAlign: "center"
                        }}
                      >
                        {alertText}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </DoubleBezelCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
