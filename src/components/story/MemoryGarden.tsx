"use client";

import { useState, useEffect, memo } from "react";
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
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
    <path d="M6 2v20" />
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

// Reusable integrated Inner Bento Panel for secondary sections
const InnerBentoPanel = ({ children, style = {}, ...props }: any) => {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.65)", // Semi-transparent warm white
        border: "1.5px solid rgba(184, 212, 168, 0.35)",
        borderRadius: 16,
        padding: 20,
        boxSizing: "border-box",
        boxShadow: "0 2px 12px rgba(45, 80, 22, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Stable memoized video component to prevent re-creation and stuttering
const GardenVideo = memo(({ src, onLoadedData, onError }: { src: string; onLoadedData?: () => void; onError?: () => void }) => {
  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      onLoadedData={onLoadedData}
      onCanPlayThrough={onLoadedData}
      onError={onError}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block"
      }}
    />
  );
});
GardenVideo.displayName = "GardenVideo";

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

const outcomeCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
      delay: 0.45
    }
  },
  hover: { 
    y: -4, 
    boxShadow: "0 16px 40px rgba(45, 80, 22, 0.18)",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  }
};

const storyCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
      delay: 0.65
    }
  },
  hover: { 
    y: -4, 
    boxShadow: "0 12px 30px rgba(45, 80, 22, 0.12)",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  }
};

const shareCardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1] as const,
      delay: 0.8
    }
  },
  hover: { 
    y: -4, 
    boxShadow: "0 12px 30px rgba(45, 80, 22, 0.12)",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  }
};

function getDecisionMoment(choice: string): string {
  const norm = choice.toLowerCase().trim();

  // Chapter 1:
  // - Plant-based meal / Local dhaba / Delivery burger -> breakfast
  if (
    norm.includes("plant") ||
    norm.includes("dhaba") ||
    norm.includes("burger")
  ) {
    return "breakfast";
  }

  // - Walk or cycle / Take the metro / Book a cab -> commute
  if (
    norm.includes("walk") ||
    norm.includes("cycle") ||
    norm.includes("metro") ||
    norm.includes("cab")
  ) {
    return "commute";
  }

  // - Home-cooked tiffin / Office canteen / Food delivery app -> lunch
  if (
    norm.includes("tiffin") ||
    norm.includes("canteen") ||
    norm.includes("delivery app")
  ) {
    return "lunch";
  }

  // Chapter 2:
  // - Local kirana store / Order online / Drive to the mall -> shopping
  if (
    norm.includes("kirana") ||
    norm.includes("online") ||
    norm.includes("mall")
  ) {
    return "shopping";
  }

  // - Cook at home / Order vegetarian / Order meat dish -> dinner
  if (
    norm.includes("cook") ||
    norm.includes("vegetarian") ||
    norm.includes("meat")
  ) {
    return "dinner";
  }

  // - Read a book / Watch a documentary / Game all night / Read or meditate / Stream a show -> wind-down
  if (
    norm.includes("book") ||
    norm.includes("documentary") ||
    norm.includes("game") ||
    norm.includes("read") ||
    norm.includes("meditate") ||
    norm.includes("stream") ||
    norm.includes("show")
  ) {
    return "wind-down";
  }

  // Default fallback (Never return 'food' or 'other')
  return "wind-down";
}

export default function MemoryGarden() {
  const router = useRouter();
  const {
    decisions, profile, worldState, totalCarbonDelta, resetSession,
    storyCompleted, gardenOutcome, setGardenOutcome, memoryBook,
    addStoryToMemoryBook, storySessionId
  } = useSessionStore();

  // Check if user has a valid completed story
  const hasCompletedStory = storyCompleted || decisions.length > 0;

  const ecoCount = decisions.filter(d => d.impactType === "eco").length;
  const highCount = decisions.filter(d => d.impactType === "high").length;
  const totalDecisions = decisions.length;
  const moderateCount = totalDecisions - ecoCount - highCount;

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

  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoReady(false);
  }, [outcome]);

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

  // Narrative fetch — use cache if available (for back-navigation)
  useEffect(() => {
    if (!hasCompletedStory) {
      setLoading(false);
      return;
    }
    // Use cached narrative if available (back-navigation)
    if (gardenOutcome?.narrative) {
      setNarrative(gardenOutcome.narrative);
      setLoading(false);
      return;
    }
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
        // Cache the narrative for back-navigation
        setGardenOutcome({ narrative: data.narrative, outcome });
      } catch (e) {
        // Poetic fallback on error
        setNarrative("");
      } finally {
        setLoading(false);
      }
    };
    fetchNarrative();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome, hasCompletedStory]);

  // Video safety timeout — prevent infinite loader
  useEffect(() => {
    if (!hasCompletedStory) return;
    const safetyTimeout = setTimeout(() => {
      if (!videoReady) {
        setVideoFailed(true);
        setVideoReady(true);
      }
    }, 8000);
    return () => clearTimeout(safetyTimeout);
  }, [hasCompletedStory, videoReady]);

  // Save Completed Story to Memory Book once on Garden page load
  useEffect(() => {
    if (hasCompletedStory) {
      console.log(
        "MEMORY STORY",
        decisions.map(d => ({
          choice: d.choice,
          moment: getDecisionMoment(d.choice)
        }))
      );
      addStoryToMemoryBook({
        chapterNumber: 2,
        decisions: decisions.map(d => ({
          moment: getDecisionMoment(d.choice),
          choice: d.choice,
          impactType: d.impactType,
          carbonKg: d.carbonDelta,
        })),
        totalCarbonKg: totalCarbonDelta,
        planetMood: worldState.planetMood,
        storySessionId: storySessionId
      });
    }
  }, [hasCompletedStory, decisions, totalCarbonDelta, worldState.planetMood, storySessionId, addStoryToMemoryBook]);

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

  const transportRef = getTransportReflection();
  const foodRef = getFoodReflection();
  const communityRef = getCommunityReflection();

  // Share Message generation (Standard text shared on social & copied)
  const generateStoryMessage = () => {
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://carbonverse.earth";
    
    return `🌱 My CarbonVerse Journey

World Outcome: ${outcomeDetails.title}

Today's Choices:
${transportRef.emoji} ${transportRef.text}
${foodRef.emoji} ${foodRef.text}
${communityRef.emoji} ${communityRef.text}

Every choice shapes the future.

Explore your own future:
${shareUrl}

#CarbonVerse
#ClimateAction
#FutureChoices`;
  };

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowJourneyModal(false);
        setShowInstagramModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle Share Click with fallbacks
  const handleShareClick = (platform: "x" | "linkedin" | "facebook" | "instagram") => {
    const storyText = generateStoryMessage();
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://carbonverse.earth";
    
    if (platform === "instagram") {
      setShowInstagramModal(true);
      return;
    }

    if (platform === "linkedin") {
      // Copy to clipboard first
      navigator.clipboard.writeText(storyText);
      setAlertText("Story copied. Paste into LinkedIn and click Post.");
      setTimeout(() => setAlertText(""), 4000);
      
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    if (platform === "facebook") {
      // Copy to clipboard first
      navigator.clipboard.writeText(storyText);
      setAlertText("Story copied. Paste into Facebook and click Post.");
      setTimeout(() => setAlertText(""), 4000);
      
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    if (platform === "x") {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(storyText)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
  };

  // ── EMPTY STATE: No story completed ──
  if (!hasCompletedStory) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(184, 212, 168, 0.6)",
            boxShadow: "0 12px 40px rgba(45, 80, 22, 0.12)",
            borderRadius: 32,
            padding: "48px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <VerdOrb size={80} mood="eco" />
          </motion.div>

          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#2D5016",
            margin: "24px 0 8px 0",
            lineHeight: 1.2,
          }}>
            🌱 Your Memory Garden Awaits
          </h1>

          <p style={{
            fontSize: 16,
            color: "#4A7C2F",
            fontWeight: 500,
            lineHeight: 1.6,
            margin: "0 0 8px 0",
          }}>
            Every meaningful choice plants a seed.
          </p>
          <p style={{
            fontSize: 14,
            color: "#6B8F5E",
            fontWeight: 500,
            fontStyle: "italic",
            lineHeight: 1.5,
            margin: "0 0 28px 0",
          }}>
            Complete a story to grow a living garden filled with the memories you create.
          </p>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/story")}
            style={{
              padding: "14px 32px",
              background: "#F4A832",
              color: "#2D5016",
              borderRadius: 16,
              fontWeight: 800,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              boxShadow: "0 4px 18px rgba(244,168,50,0.35)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {memoryBook.stories.length > 0 ? "🌱 Play Another Story" : "Start Your Story"}
            <span style={{ fontSize: 18 }}>→</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <DoubleBezelCard
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "auto",
        height: "auto",
        boxSizing: "border-box"
      }}
      innerStyle={{
        padding: 24,
        gap: 20,
        boxShadow: "0 8px 30px rgba(45, 80, 22, 0.08)"
      }}
    >
      <style>{`
        @media (min-width: 1024px) {
          .garden-header-container {
            display: grid !important;
            grid-template-columns: 72fr 28fr !important;
            gap: 20px !important;
            width: 100% !important;
            align-items: center !important;
          }
          .garden-layout-grid {
            display: grid !important;
            grid-template-columns: 72fr 28fr !important;
            gap: 20px !important;
            width: 100% !important;
          }
        }
        @media (max-width: 1023px) {
          .garden-header-container {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
          .play-again-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .garden-layout-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
            width: 100% !important;
          }
          .bento-card-stack {
            height: auto !important;
          }
          .share-section-container {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 20px !important;
            text-align: center !important;
          }
          .share-actions-row {
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
            gap: 20px !important;
          }
          .social-buttons-grid {
            justify-content: center !important;
            width: 100% !important;
          }
          .journey-button-container {
            width: 100% !important;
            align-items: center !important;
          }
          .journey-button-container button {
            width: 100% !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <div
        className="garden-header-container"
        style={{
          width: "100%",
          boxSizing: "border-box",
          paddingBottom: 20,
          borderBottom: "1px solid rgba(184, 212, 168, 0.35)"
        }}
      >
        {/* Left column above Video */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <VerdOrb size={52} mood={outcome === "eco" ? "eco" : outcome === "high" ? "high" : "moderate"} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#2D5016", margin: 0, lineHeight: 1.1 }}>
              Your Memory Garden 🌱
            </h1>
            <p style={{ fontSize: 13, color: "#4A7C2F", margin: "3px 0 0 0", fontWeight: 600, lineHeight: 1.2 }}>
              Every choice you made helped nature flourish.
            </p>
            
            {/* ELEGANT SUMMARY CHIPS WITH EMPHASIZED DOMINANT OUTCOME CHIP FIRST */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}>
              {/* FINAL OUTCOME CHIP (Dominant, Larger, First in row, Subtle Glow) */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 12px",
                background: outcome === "eco" ? "rgba(76, 175, 80, 0.22)" : outcome === "high" ? "rgba(255, 107, 107, 0.22)" : "rgba(244, 168, 50, 0.22)",
                border: `1.5px solid ${outcome === "eco" ? "rgba(76, 175, 80, 0.6)" : outcome === "high" ? "rgba(255, 107, 107, 0.6)" : "rgba(244, 168, 50, 0.6)"}`,
                borderRadius: 14,
                fontSize: 12.5,
                fontWeight: 800,
                color: "#2D5016",
                boxShadow: outcome === "eco" ? "0 0 12px rgba(76, 175, 80, 0.25)" : outcome === "high" ? "0 0 12px rgba(255, 107, 107, 0.25)" : "0 0 12px rgba(244, 168, 50, 0.25)",
                marginRight: 4
              }}>
                {outcome === "eco" ? "🌍" : outcome === "high" ? "🌫️" : "🌱"} {outcomeDetails.title.replace(/^[^\w\s]*/, "").trim()}
              </div>

              {ecoCount > 0 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  background: "rgba(76, 175, 80, 0.08)",
                  border: "1px solid rgba(76, 175, 80, 0.25)",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2D5016"
                }}>
                  🌱 {ecoCount} Eco Choice{ecoCount !== 1 ? "s" : ""}
                </div>
              )}
              {moderateCount > 0 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  background: "rgba(244, 168, 50, 0.08)",
                  border: "1px solid rgba(244, 168, 50, 0.25)",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2D5016"
                }}>
                  ⚖️ {moderateCount} Moderate Choice{moderateCount !== 1 ? "s" : ""}
                </div>
              )}
              {highCount > 0 && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  background: "rgba(255, 107, 107, 0.08)",
                  border: "1px solid rgba(255, 107, 107, 0.25)",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2D5016"
                }}>
                  🌫️ {highCount} High Choice{highCount !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column above Bento Stack (Perfect vertical alignment with World Outcome card + Upgraded animations) */}
        <div style={{ display: "flex", width: "100%", height: "100%", justifyContent: "flex-end", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {/* Secondary: Logout button */}
          <motion.button
            whileHover={{ 
              scale: 1.03,
              background: "rgba(255, 255, 255, 0.95)",
              borderColor: "#B8D4A8",
              color: "#2D5016"
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("carbonverse-session-storage");
                sessionStorage.removeItem("carbonverse-session-storage");
                window.location.href = "/";
              }
            }}
            style={{
              padding: "10px 18px",
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(12px)",
              border: "1.5px dashed rgba(184, 212, 168, 0.6)",
              borderRadius: 14,
              fontSize: 13.5,
              fontWeight: 700,
              color: "#6B8F5E",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 150ms ease-out"
            }}
          >
            <span>🚪</span>
            Logout
          </motion.button>

          <motion.button
            className="play-again-btn"
            whileHover={{ 
              scale: 1.03,
              boxShadow: "0 6px 18px rgba(74, 124, 47, 0.12), 0 0 10px rgba(184, 212, 168, 0.4)",
              background: "rgba(255, 255, 255, 0.95)",
              borderColor: "#4CAF50"
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { resetSession(); router.push("/story"); }}
            style={{
              padding: "10px 18px",
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid #B8D4A8",
              borderRadius: 14,
              fontSize: 13.5,
              fontWeight: 800,
              color: "#2D5016",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              maxWidth: 295,
              boxShadow: "0 3px 10px rgba(45, 80, 22, 0.06)",
              transition: "border-color 150ms ease-out, background-color 150ms ease-out"
            }}
          >
            <motion.span
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              style={{ display: "inline-block" }}
            >
              🌱
            </motion.span>
            Play Another Story
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{ display: "inline-block", fontSize: 13, fontWeight: 900 }}
            >
              ↺
            </motion.span>
          </motion.button>
        </div>
      </div>

      {/* BENTO LAYOUT */}
      <div className="garden-layout-grid">
        
        {/* LEFT COLUMN: Large Hero Video Card (72%) */}
        <motion.div
          className="video-card-bezel"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            border: "1.5px solid rgba(184, 212, 168, 0.35)",
            borderRadius: 20,
            padding: 6,
            boxSizing: "border-box",
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              borderRadius: 14,
              height: "100%",
              width: "100%",
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(184, 212, 168, 0.4)",
              boxShadow: "0 6px 20px rgba(45, 80, 22, 0.05)"
            }}
          >
            <GardenVideo
              src={outcomeDetails.videoUrl}
              onLoadedData={() => setVideoReady(true)}
              onError={() => { setVideoFailed(true); setVideoReady(true); }}
            />
            
            <AnimatePresence>
              {!videoReady && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, #FFF8E7 0%, #E8F5E3 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    zIndex: 10,
                    boxSizing: "border-box"
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ marginBottom: 12 }}
                  >
                    <VerdOrb size={48} mood={outcome === "eco" ? "eco" : outcome === "high" ? "high" : "moderate"} />
                  </motion.div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2D5016", margin: "0 0 4px 0", textAlign: "center" }}>
                    🌱 Growing Your Memory Garden
                  </h3>
                  <p style={{ fontSize: 12, color: "#4A7C2F", margin: 0, textAlign: "center", fontStyle: "italic", fontWeight: 500 }}>
                    "Every choice planted a seed. Nature is taking shape..."
                  </p>
                  {/* Elegant loading animation */}
                  <div style={{ width: 120, height: 4, background: "rgba(184, 212, 168, 0.3)", borderRadius: 2, marginTop: 12, overflow: "hidden", position: "relative" }}>
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      style={{ width: "100%", height: "100%", background: "#4CAF50", borderRadius: 2 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                top: 14,
                left: 14,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(184, 212, 168, 0.5)",
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

        {/* RIGHT COLUMN: Stacked Bento Cards (28%) */}
        <div
          className="bento-card-stack"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            height: "100%",
            boxSizing: "border-box"
          }}
        >
          {/* Card 1: Future Outcome Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={outcomeCardVariants}
            style={{ 
              flex: 1,
              background: "linear-gradient(135deg, #F0FAF0 0%, #D8ECD0 100%)",
              border: "1.5px solid rgba(76, 175, 80, 0.35)",
              borderRadius: 16,
              padding: 20,
              boxSizing: "border-box",
              boxShadow: "0 8px 30px rgba(45, 80, 22, 0.12)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B8F5E", marginBottom: 6 }}>
                World Outcome
              </div>
              <div style={{ position: "relative", width: "fit-content" }}>
                {/* Subtle glow behind title area */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "140%",
                  height: "140%",
                  background: "radial-gradient(circle, rgba(244, 168, 50, 0.22) 0%, transparent 70%)",
                  filter: "blur(6px)",
                  pointerEvents: "none",
                  zIndex: 0
                }} />
                <h2 style={{ position: "relative", zIndex: 1, fontSize: 18, fontWeight: 800, color: "#2D5016", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 6 }}>
                  {outcomeDetails.title}
                </h2>
              </div>
              <p style={{ fontSize: 13, color: "#4A7C2F", margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                {outcomeDetails.desc}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Story Reflection Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            whileHover="hover"
            variants={storyCardVariants}
            style={{ 
              flex: 1.5,
              background: "linear-gradient(135deg, #FFF8E7 0%, #FFF3D6 100%)",
              border: "1.5px solid rgba(184, 212, 168, 0.35)",
              borderRadius: 16,
              padding: 20,
              boxSizing: "border-box",
              boxShadow: "0 4px 20px rgba(45, 80, 22, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B8F5E", marginBottom: 12 }}>
                  Today's Story
                </div>
                
                {totalDecisions === 0 ? (
                  <div style={{ padding: "10px 0", fontSize: 13, color: "#6B8F5E", fontStyle: "italic" }}>
                    Your choices are being planted. Start a new chapter! 🌱
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
          </motion.div>
        </div>
      </div>

      {/* SHARE SECTION */}
      <motion.div
        className="share-section-container"
        initial="hidden"
        animate="visible"
        whileHover="hover"
        variants={shareCardVariants}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1.5px solid rgba(184, 212, 168, 0.55)",
          borderRadius: 20,
          padding: "24px 20px",
          width: "100%",
          boxSizing: "border-box",
          boxShadow: "0 4px 20px rgba(45, 80, 22, 0.05)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B8F5E" }}>
            Share Garden
          </span>
          <span style={{ fontSize: 13, color: "#1C3A13", fontWeight: 700, letterSpacing: "-0.01em" }}>
            A better future started with small choices. Pass it forward. 🌱
          </span>
        </div>

        <div className="share-actions-row" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Social Buttons Group */}
          <div className="social-buttons-grid" style={{ display: "flex", gap: 8 }}>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleShareClick("x")}
              style={{
                background: "rgba(255, 255, 255, 0.75)",
                border: "1px solid rgba(184, 212, 168, 0.5)",
                borderRadius: 12,
                width: 38,
                height: 38,
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
                background: "rgba(255, 255, 255, 0.75)",
                border: "1px solid rgba(184, 212, 168, 0.5)",
                borderRadius: 12,
                width: 38,
                height: 38,
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
                background: "rgba(255, 255, 255, 0.75)",
                border: "1px solid rgba(184, 212, 168, 0.5)",
                borderRadius: 12,
                width: 38,
                height: 38,
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
                background: "rgba(255, 255, 255, 0.75)",
                border: "1px solid rgba(184, 212, 168, 0.5)",
                borderRadius: 12,
                width: 38,
                height: 38,
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

          {/* Primary View Journey Action */}
          <div className="journey-button-container" style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", position: "relative" }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowJourneyModal(true)}
              style={{
                padding: "10px 20px",
                background: "#F4A832",
                color: "white",
                borderRadius: 14,
                border: "none",
                fontWeight: 800,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                boxShadow: "0 3px 12px rgba(244, 168, 50, 0.3)"
              }}
            >
              📖 View My Journey
            </motion.button>

            <AnimatePresence>
              {alertText && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    top: "100%",
                    marginTop: 6,
                    right: 0,
                    background: "rgba(74, 124, 47, 0.95)",
                    border: "1px solid rgba(184, 212, 168, 0.8)",
                    borderRadius: 10,
                    padding: "6px 12px",
                    fontSize: 11,
                    color: "white",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(45, 80, 22, 0.1)",
                    zIndex: 10,
                    whiteSpace: "nowrap"
                  }}
                >
                  {alertText}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* STORY REVEAL MODAL */}
      <AnimatePresence>
        {showJourneyModal && (
          <div
            onClick={() => setShowJourneyModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(45, 80, 22, 0.4)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: 16
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                border: "2px solid #B8D4A8",
                borderRadius: 24,
                boxShadow: "0 20px 50px rgba(45, 80, 22, 0.15)",
                padding: 28,
                maxWidth: 500,
                width: "100%",
                boxSizing: "border-box",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 20
              }}
            >
              {/* Close X Button */}
              <button
                onClick={() => setShowJourneyModal(false)}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  color: "#6B8F5E",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B8F5E" }}>
                  📖 Your CarbonVerse Story
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2D5016", margin: 0 }}>
                  World Outcome
                </h2>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#2D5016",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: outcome === "eco" ? "rgba(76, 175, 80, 0.08)" : outcome === "high" ? "rgba(255, 107, 107, 0.08)" : "rgba(244, 168, 50, 0.08)",
                  padding: "6px 12px",
                  borderRadius: 12,
                  width: "fit-content",
                  border: `1px solid ${outcome === "eco" ? "rgba(76, 175, 80, 0.2)" : outcome === "high" ? "rgba(255, 107, 107, 0.2)" : "rgba(244, 168, 50, 0.2)"}`
                }}>
                  {outcomeDetails.title}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B8F5E" }}>
                  Today's Choices
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#2D5016", fontWeight: 700 }}>
                    <span style={{ fontSize: 18 }}>{transportRef.emoji}</span>
                    <span>{transportRef.text}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#2D5016", fontWeight: 700 }}>
                    <span style={{ fontSize: 18 }}>{foodRef.emoji}</span>
                    <span>{foodRef.text}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#2D5016", fontWeight: 700 }}>
                    <span style={{ fontSize: 18 }}>{communityRef.emoji}</span>
                    <span>{communityRef.text}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B8F5E" }}>
                  Reflection
                </span>
                <p style={{
                  fontSize: 14,
                  color: "#4A7C2F",
                  fontStyle: "italic",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  margin: 0,
                  background: "rgba(184, 212, 168, 0.05)",
                  padding: 12,
                  borderRadius: 12,
                  borderLeft: "3px solid #B8D4A8"
                }}>
                  {getPoeticReflection()}
                </p>
              </div>

              <p style={{ fontSize: 13, color: "#6B8F5E", fontWeight: 600, textAlign: "center", margin: "10px 0 0 0" }}>
                Small choices shape the future we leave behind.
              </p>

              <div style={{ display: "flex", gap: 12, marginTop: 10, position: "relative" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigator.clipboard.writeText(generateStoryMessage());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#F4A832",
                    color: "white",
                    borderRadius: 14,
                    border: "none",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 3px 10px rgba(244, 168, 50, 0.25)"
                  }}
                >
                  <CopyIcon />
                  {copied ? "✓ Copied!" : "Copy Story"}
                </motion.button>
                
                <button
                  onClick={() => setShowJourneyModal(false)}
                  style={{
                    padding: "12px 24px",
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1.5px solid #B8D4A8",
                    borderRadius: 14,
                    color: "#2D5016",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>

                <AnimatePresence>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: "absolute",
                        bottom: "115%",
                        left: 0,
                        right: 0,
                        background: "rgba(74, 124, 47, 0.95)",
                        border: "1px solid rgba(184, 212, 168, 0.8)",
                        borderRadius: 10,
                        padding: "6px 12px",
                        fontSize: 11,
                        color: "white",
                        fontWeight: 700,
                        textAlign: "center",
                        boxShadow: "0 4px 12px rgba(45, 80, 22, 0.1)",
                        zIndex: 110
                      }}
                    >
                      Journey story copied to clipboard!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSTAGRAM SHARE MODAL */}
      <AnimatePresence>
        {showInstagramModal && (
          <div
            onClick={() => setShowInstagramModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(45, 80, 22, 0.4)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: 16
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                border: "2px solid #B8D4A8",
                borderRadius: 24,
                boxShadow: "0 20px 50px rgba(45, 80, 22, 0.15)",
                padding: 28,
                maxWidth: 500,
                width: "100%",
                boxSizing: "border-box",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 20
              }}
            >
              {/* Close X Button */}
              <button
                onClick={() => setShowInstagramModal(false)}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  color: "#6B8F5E",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B8F5E" }}>
                  📸 Share to Instagram
                </span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2D5016", margin: 0 }}>
                  Instagram Caption
                </h2>
                <p style={{ fontSize: 13, color: "#4A7C2F", margin: 0, fontWeight: 600 }}>
                  Paste this caption into Instagram when creating your post.
                </p>
              </div>

              <div style={{ position: "relative", width: "100%" }}>
                <textarea
                  readOnly
                  value={generateStoryMessage()}
                  style={{
                    width: "100%",
                    height: 160,
                    background: "rgba(184, 212, 168, 0.05)",
                    border: "1px solid rgba(184, 212, 168, 0.5)",
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 12.5,
                    color: "#2D5016",
                    fontFamily: "inherit",
                    resize: "none",
                    outline: "none",
                    lineHeight: 1.4
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, position: "relative" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigator.clipboard.writeText(generateStoryMessage());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#F4A832",
                    color: "white",
                    borderRadius: 14,
                    border: "none",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 3px 10px rgba(244, 168, 50, 0.25)"
                  }}
                >
                  <CopyIcon />
                  {copied ? "✓ Copied!" : "Copy Caption"}
                </motion.button>
                
                <button
                  onClick={() => setShowInstagramModal(false)}
                  style={{
                    padding: "12px 24px",
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1.5px solid #B8D4A8",
                    borderRadius: 14,
                    color: "#2D5016",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>

                <AnimatePresence>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: "absolute",
                        bottom: "115%",
                        left: 0,
                        right: 0,
                        background: "rgba(74, 124, 47, 0.95)",
                        border: "1px solid rgba(184, 212, 168, 0.8)",
                        borderRadius: 10,
                        padding: "6px 12px",
                        fontSize: 11,
                        color: "white",
                        fontWeight: 700,
                        textAlign: "center",
                        boxShadow: "0 4px 12px rgba(45, 80, 22, 0.1)",
                        zIndex: 110
                      }}
                    >
                      Caption copied to clipboard!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DoubleBezelCard>
  );
}