"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useSpring, useInView } from "framer-motion";
import VerdOrb from "@/components/ui/VerdOrb";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
interface BentoProps {
  storyState: "thriving" | "stable" | "stressed" | "damaged";
  yearlyTonnes: number;
  yearlyGreenTonnes: number;
  savedTonnes: number;
  highestImpact: { choice: string; carbonDelta: number; impactType: string } | null;
  lowestImpact: { choice: string; carbonDelta: number; impactType: string } | null;
  treesNeeded: number;
  carKm: number;
  homeDays: number;
  verdMessage: string;
  totalCarbonDelta: number;
}

/* ─────────────────────────────────────────────
   Floating Leaf SVG (ambient motion)
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   Animated Counter (spring-based count-up)
   ───────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const spring = useSpring(0, { stiffness: 60, damping: 20 });

  // Drive spring to target when in view
  if (isInView) {
    spring.set(value);
  }

  // Subscribe to spring updates and write to DOM
  spring.on("change", (v) => {
    if (ref.current) {
      ref.current.textContent = Math.round(v).toLocaleString() + suffix;
    }
  });

  return <span ref={ref}>0{suffix}</span>;
}

/* ─────────────────────────────────────────────
   Card wrapper (shared hover + reveal)
   ───────────────────────────────────────────── */
function BentoCard({
  children,
  index,
  gridArea,
  style,
}: {
  children: React.ReactNode;
  index: number;
  gridArea: string;
  style?: React.CSSProperties;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.23, 1, 0.32, 1],
      }}
      whileHover={{
        y: -3,
        boxShadow: "0 10px 32px rgba(45,80,22,0.14)",
        transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
      }}
      style={{
        gridArea,
        background: "#FFFFFF",
        border: "1px solid #B8D4A8",
        borderRadius: 20,
        padding: "12px 14px",
        boxShadow: "0 3px 18px rgba(45,80,22,0.07)",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Category insight for Card 5
   ───────────────────────────────────────────── */
function getCategoryInsight(decisions: Array<{ carbonDelta: number; impactType: string; choice: string }>): string {
  if (decisions.length === 0) return "Every choice tells a story about your future.";

  const foodKeywords = ["burger", "delivery", "canteen", "tiffin", "cook", "restaurant", "dhaba", "biryani", "pizza", "meal", "breakfast", "lunch", "dinner", "food", "eat"];
  const transportKeywords = ["car", "cab", "auto", "metro", "walk", "cycle", "bus", "bike", "drive", "uber", "ola", "commute", "flight"];
  const energyKeywords = ["ac", "fan", "stream", "netflix", "gaming", "electricity", "power", "light", "charge"];

  let foodCarbon = 0;
  let transportCarbon = 0;
  let energyCarbon = 0;

  for (const d of decisions) {
    const lower = d.choice.toLowerCase();
    if (foodKeywords.some((k) => lower.includes(k))) foodCarbon += d.carbonDelta;
    else if (transportKeywords.some((k) => lower.includes(k))) transportCarbon += d.carbonDelta;
    else if (energyKeywords.some((k) => lower.includes(k))) energyCarbon += d.carbonDelta;
  }

  const maxCategory = Math.max(foodCarbon, transportCarbon, energyCarbon);

  if (maxCategory === foodCarbon && foodCarbon > 0) {
    return "Food created nearly half of your footprint. That is where your future can improve fastest.";
  }
  if (maxCategory === transportCarbon && transportCarbon > 0) {
    return "Your commute carries the heaviest weight. A single transport swap could rewrite your story.";
  }
  if (maxCategory === energyCarbon && energyCarbon > 0) {
    return "Energy choices shape your invisible footprint. Small habit shifts create the biggest ripples.";
  }

  return "Your choices paint a complex picture. The path forward starts with the patterns you notice.";
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
export default function FutureStoryBento({
  storyState,
  yearlyTonnes,
  yearlyGreenTonnes,
  savedTonnes,
  highestImpact,
  lowestImpact,
  treesNeeded,
  carKm,
  homeDays,
  verdMessage,
  totalCarbonDelta,
}: BentoProps) {
  const { decisions } = require("@/lib/session-store").useSessionStore();
  const categoryInsight = getCategoryInsight(decisions);
  const shouldReduce = useReducedMotion();

  // State colors for Card 2
  const userStateColor =
    storyState === "thriving"
      ? "#2D7A1F"
      : storyState === "stable"
        ? "#8B6914"
        : storyState === "stressed"
          ? "#A0701A"
          : "#A0401A";

  const userStateLabel =
    storyState === "thriving"
      ? "Thriving Ecosystem"
      : storyState === "stable"
        ? "Balanced Ecosystem"
        : storyState === "stressed"
          ? "Under Visible Strain"
          : "A Damaged Landscape";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
        height: "100%",
        paddingBottom: 14,
        boxSizing: "border-box",
      }}
    >
      {/* ── Bento Grid — 2-col vertical layout for narrow sidebar ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateAreas: `
            "diff diff"
            "snap ripple"
            "snap hero"
            "verd verd"
          `,
          gridTemplateRows: "auto 1fr 1fr auto",
          gap: 10,
          height: "100%",
        }}
        className="bento-grid-sidebar"
      >
        {/* ───── Card 1: Future Difference (Full Width) ───── */}
        <BentoCard index={0} gridArea="diff" style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 8,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🌎 Future Difference
          </div>

          <div style={{ display: "flex", gap: 16, width: "100%", alignItems: "center" }}>
            {/* Your future */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  fontWeight: 700,
                  color: userStateColor,
                  background: `${userStateColor}12`,
                  padding: "2px 8px",
                  borderRadius: 999,
                  marginBottom: 4,
                }}
              >
                Your Future
              </div>
              <div style={{ fontSize: 11, color: userStateColor, fontWeight: 600 }}>
                {userStateLabel}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: userStateColor, lineHeight: 1.1, marginTop: 2 }}>
                {yearlyTonnes.toFixed(1)}{" "}
                <span style={{ fontSize: 10, fontWeight: 600, color: "#6B8F5E" }}>t</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, background: "rgba(184,212,168,0.4)", height: 40 }} />

            {/* Greener future */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#2D7A1F",
                  background: "rgba(76,175,80,0.1)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  marginBottom: 4,
                }}
              >
                Greener Future
              </div>
              <div style={{ fontSize: 11, color: "#2D7A1F", fontWeight: 600 }}>
                Thriving Ecosystem
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#2D7A1F", lineHeight: 1.1, marginTop: 2 }}>
                {yearlyGreenTonnes.toFixed(1)}{" "}
                <span style={{ fontSize: 10, fontWeight: 600, color: "#6B8F5E" }}>t</span>
              </div>
            </div>
          </div>

          {/* Visual comparison bar */}
          <div style={{
            marginTop: 4,
            height: 6,
            borderRadius: 3,
            background: "rgba(184,212,168,0.2)",
            overflow: "hidden",
            position: "relative",
          }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.min(95,
                Math.abs(yearlyTonnes) /
                (Math.abs(yearlyTonnes) +
                 Math.abs(yearlyGreenTonnes)) * 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              style={{
                height: "100%",
                background: userStateColor,
                borderRadius: 3,
              }}
            />
          </div>

          {/* Savings badge */}
          {savedTonnes > 0 && (
            <div
              style={{
                background: "rgba(244,168,50,0.12)",
                color: "#8B6914",
                borderRadius: 10,
                padding: "4px 8px",
                fontSize: 11,
                fontWeight: 700,
                textAlign: "center",
                marginTop: 2,
              }}
            >
              {savedTonnes.toFixed(1)}t difference
            </div>
          )}
        </BentoCard>

        {/* ───── Card 2: Verd's Observation (Full Width Bottom) ───── */}
        <BentoCard
          index={1}
          gridArea="verd"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            borderLeft: "3px solid #F4A832",
            background: "rgba(255, 248, 231, 0.3)",
          }}
        >
          <motion.div
            animate={shouldReduce ? {} : { y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ flexShrink: 0 }}
          >
            <VerdOrb size={36} mood={totalCarbonDelta < 0 ? "eco" : totalCarbonDelta > 10 ? "high" : "moderate"} />
          </motion.div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
              🌿 Verd&apos;s Observation
            </div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                fontStyle: "italic",
                color: "#2D5016",
                lineHeight: 1.4,
                margin: 0,
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            >
              &ldquo;{categoryInsight}&rdquo;
            </p>
          </div>
        </BentoCard>

        {/* ───── Card 3: Biggest Ripple ───── */}
        <BentoCard
          index={2}
          gridArea="ripple"
          style={{
            borderLeft: "3px solid #FF6B6B",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            ⚠️ Biggest Ripple
          </div>

          {highestImpact ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#A0401A", lineHeight: 1.2 }}>
                {highestImpact.choice}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B6B" }}>
                +{highestImpact.carbonDelta} kg CO₂
              </div>
              <div style={{ fontSize: 10, color: "#6B8F5E", fontStyle: "italic", lineHeight: 1.3 }}>
                The choice that changed your future most.
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "#6B8F5E", fontStyle: "italic" }}>
              No high-impact choices — well done!
            </div>
          )}
        </BentoCard>

        {/* ───── Card 4: Future Hero ───── */}
        <BentoCard
          index={3}
          gridArea="hero"
          style={{
            borderLeft: "3px solid #4CAF50",
            background: "#F0FAF0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: "#2D7A1F", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🌱 Future Hero
          </div>

          {lowestImpact ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#2D7A1F", lineHeight: 1.2 }}>
                {lowestImpact.choice}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4CAF50" }}>
                {lowestImpact.carbonDelta <= 0
                  ? `Saved ${Math.abs(lowestImpact.carbonDelta)} kg CO₂`
                  : `+${lowestImpact.carbonDelta} kg CO₂`}
              </div>
              <div style={{ fontSize: 10, color: "#4A7C2F", fontStyle: "italic", lineHeight: 1.3 }}>
                This decision slowed future damage.
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "#4A7C2F", fontStyle: "italic" }}>
              Every choice shapes the story.
            </div>
          )}
        </BentoCard>

        {/* ───── Card 5: Future Snapshot (Left Column, Tall) ───── */}
        <BentoCard index={4} gridArea="snap" style={{ 
          background: "#FFF8E7", 
          padding: "16px",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            🌳 Future Snapshot
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
            }}
            className="snapshot-grid-sidebar"
          >
            {/* Trees */}
            <div className="snap-item">
              <div
                style={{
                  fontSize: "clamp(26px, 3.2vw, 36px)",
                  fontWeight: 900,
                  color: "#2D5016",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              >
                <AnimatedNumber value={treesNeeded} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B8F5E", marginTop: 4 }}>
                Trees
              </div>
              <div style={{ fontSize: 10, color: "#6B8F5E", fontStyle: "italic", marginTop: 1, lineHeight: 1.2 }}>
                absorbs yearly CO₂
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(184,212,168,0.4)", margin: "12px 0" }} className="snap-divider" />

            {/* Driving */}
            <div className="snap-item">
              <div
                style={{
                  fontSize: "clamp(26px, 3.2vw, 36px)",
                  fontWeight: 900,
                  color: "#4A9B8E",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              >
                <AnimatedNumber value={carKm} suffix="" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B8F5E", marginTop: 4 }}>
                km Driving
              </div>
              <div style={{ fontSize: 10, color: "#6B8F5E", fontStyle: "italic", marginTop: 1, lineHeight: 1.2 }}>
                equivalent distance
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(184,212,168,0.4)", margin: "12px 0" }} className="snap-divider" />

            {/* Home Energy */}
            <div className="snap-item">
              <div
                style={{
                  fontSize: "clamp(26px, 3.2vw, 36px)",
                  fontWeight: 900,
                  color: "#F4A832",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              >
                <AnimatedNumber value={homeDays} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B8F5E", marginTop: 4 }}>
                Days Energy
              </div>
              <div style={{ fontSize: 10, color: "#6B8F5E", fontStyle: "italic", marginTop: 1, lineHeight: 1.2 }}>
                powering a home
              </div>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* ── Responsive Overrides ── */}
      <style>{`
        @media (max-width: 1024px) {
          .bento-grid-sidebar {
            height: auto !important;
            grid-template-rows: auto !important;
          }
        }

        @media (max-width: 768px) {
          .bento-grid-sidebar {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto !important;
            grid-template-areas:
              "diff diff"
              "snap snap"
              "ripple hero"
              "verd verd" !important;
          }
          .snapshot-grid-sidebar {
            flex-direction: row !important;
            align-items: center;
          }
          .snap-item {
            flex: 1;
            text-align: center;
          }
          .snap-divider {
            width: 1px !important;
            height: 40px !important;
            margin: 0 16px !important;
          }
        }

        @media (max-width: 480px) {
          .bento-grid-sidebar {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
            grid-template-areas:
              "diff"
              "ripple"
              "hero"
              "snap"
              "verd" !important;
          }
          .snapshot-grid-sidebar {
            flex-direction: column !important;
            align-items: stretch;
          }
          .snap-item {
            flex: none;
            text-align: left;
          }
          .snap-divider {
            width: 100% !important;
            height: 1px !important;
            margin: 12px 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
