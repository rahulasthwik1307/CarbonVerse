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
function FloatingLeaf({
  delay,
  x,
  y,
  size,
  rotation,
}: {
  delay: number;
  x: string;
  y: string;
  size: number;
  rotation: number;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        opacity: 0.18,
      }}
      aria-hidden="true"
      animate={
        shouldReduce
          ? {}
          : {
              y: [0, -10, 2, -6, 0],
              rotate: [rotation, rotation + 8, rotation - 5, rotation + 3, rotation],
            }
      }
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <path
        d="M12 2C6.5 2 2 6.5 2 12c2-2 5-3 8-3 1 0 2 .2 2 .2S9 14 6 17c4-1 8-4 10-8 1-2 1.5-4 1.5-5.5C17.5 3 15 2 12 2z"
        fill="#6AAB45"
      />
      <path
        d="M12 2c0 4 1 8 3 11"
        stroke="#4A7C2F"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

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
   Narrative texts for Card 1
   ───────────────────────────────────────────── */
function getStoryNarrative(storyState: string, totalCarbonDelta: number): { title: string; prose: string } {
  switch (storyState) {
    case "thriving":
      return {
        title: "One Year Later…",
        prose: `The city breathes easy now.\n\nBirds returned to streets you walk every morning. Your daily choices saved ${Math.abs(totalCarbonDelta)} kg of CO₂ — and the world noticed.`,
      };
    case "stable":
      return {
        title: "One Year Later…",
        prose: "The seasons still turn in their ancient rhythm.\n\nThe parks hold their green, but the summers feel a shade longer. The future is still yours to write.",
      };
    case "stressed":
      return {
        title: "One Year Later…",
        prose: "The city still stands green,\nbut summers arrive earlier now.\n\nThe future is still recoverable — but it's waiting for your next chapter.",
      };
    case "damaged":
      return {
        title: "One Year Later…",
        prose: "The landscape has changed.\n\nDust settles where grass once grew. But even damaged worlds can heal. Every chapter is a chance to rewrite.",
      };
    default:
      return { title: "One Year Later…", prose: "" };
  }
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
  const shouldReduce = useReducedMotion();

  const narrative = getStoryNarrative(storyState, totalCarbonDelta);
  const categoryInsight = getCategoryInsight(decisions);

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
      }}
    >
      {/* ── Bento Grid — 2-col vertical layout for narrow sidebar ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateAreas: `
            "story story"
            "diff ripple"
            "hero verd"
            "snap snap"
          `,
          gap: 10,
        }}
        className="bento-grid-sidebar"
      >
        {/* ───── Card 1: One Year Later (largest — full width) ───── */}
        <BentoCard index={0} gridArea="story" style={{
          background: "#FFF8E7",
          minHeight: 140,
          padding: "16px 18px",
        }}>
          {/* Floating leaves */}
          <FloatingLeaf delay={0} x="80%" y="10%" size={18} rotation={-15} />
          <FloatingLeaf delay={1.5} x="88%" y="50%" size={14} rotation={10} />
          <FloatingLeaf delay={3} x="72%" y="78%" size={16} rotation={-8} />

          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#6B8F5E",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            📖 Chapter Complete
          </div>

          <h3
            style={{
              fontSize: "clamp(20px, 2.5vw, 26px)",
              fontWeight: 800,
              color: "#2D5016",
              letterSpacing: "-0.02em",
              margin: "0 0 6px 0",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              lineHeight: 1.1,
            }}
          >
            {narrative.title}
          </h3>

          <p
            style={{
              fontSize: "clamp(13px, 1.4vw, 15px)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "#2D5016",
              lineHeight: 1.7,
              margin: 0,
              maxWidth: "90%",
              whiteSpace: "pre-line",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {narrative.prose}
          </p>
        </BentoCard>

        {/* ───── Card 2: Future Difference ───── */}
        <BentoCard index={1} gridArea="diff" style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 8,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            🌎 Future Difference
          </div>

          {/* Your future */}
          <div>
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
            <div style={{ fontSize: 20, fontWeight: 800, color: userStateColor, lineHeight: 1.1, marginTop: 2 }}>
              {yearlyTonnes.toFixed(1)}{" "}
              <span style={{ fontSize: 10, fontWeight: 600, color: "#6B8F5E" }}>t</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(184,212,168,0.4)", width: "100%" }} />

          {/* Greener future */}
          <div>
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
            <div style={{ fontSize: 20, fontWeight: 800, color: "#2D7A1F", lineHeight: 1.1, marginTop: 2 }}>
              {yearlyGreenTonnes.toFixed(1)}{" "}
              <span style={{ fontSize: 10, fontWeight: 600, color: "#6B8F5E" }}>t</span>
            </div>
          </div>

          {/* Visual comparison bar */}
          <div style={{
            marginTop: 6,
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
              }}
            >
              {savedTonnes.toFixed(1)}t difference
            </div>
          )}
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
              <div style={{ fontSize: 15, fontWeight: 800, color: "#A0401A", lineHeight: 1.2 }}>
                {highestImpact.choice}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FF6B6B" }}>
                +{highestImpact.carbonDelta} kg CO₂
              </div>
              <div style={{ fontSize: 11, color: "#6B8F5E", fontStyle: "italic", lineHeight: 1.4 }}>
                The choice that changed your future most.
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#6B8F5E", fontStyle: "italic" }}>
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
              <div style={{ fontSize: 15, fontWeight: 800, color: "#2D7A1F", lineHeight: 1.2 }}>
                {lowestImpact.choice}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#4CAF50" }}>
                {lowestImpact.carbonDelta <= 0
                  ? `Saved ${Math.abs(lowestImpact.carbonDelta)} kg CO₂`
                  : `+${lowestImpact.carbonDelta} kg CO₂`}
              </div>
              <div style={{ fontSize: 11, color: "#4A7C2F", fontStyle: "italic", lineHeight: 1.4 }}>
                This decision slowed future damage.
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#4A7C2F", fontStyle: "italic" }}>
              Every choice shapes the story.
            </div>
          )}
        </BentoCard>

        {/* ───── Card 5: Verd's Observation ───── */}
        <BentoCard
          index={4}
          gridArea="verd"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderLeft: "3px solid #F4A832",
          }}
        >
          <motion.div
            animate={shouldReduce ? {} : { y: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ flexShrink: 0 }}
          >
            <VerdOrb size={32} mood={totalCarbonDelta < 0 ? "eco" : totalCarbonDelta > 10 ? "high" : "moderate"} />
          </motion.div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              🌿 Verd's Observation
            </div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 400,
                fontStyle: "italic",
                color: "#2D5016",
                lineHeight: 1.5,
                margin: 0,
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            >
              &ldquo;{categoryInsight}&rdquo;
            </p>
          </div>
        </BentoCard>

        {/* ───── Card 6: Future Snapshot (full width) ───── */}
        <BentoCard index={5} gridArea="snap" style={{ background: "#FFF8E7", padding: "14px 16px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            🌳 Future Snapshot
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              textAlign: "center",
            }}
            className="snapshot-grid-sidebar"
          >
            {/* Trees */}
            <div>
              <div
                style={{
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                  fontWeight: 900,
                  color: "#2D5016",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              >
                <AnimatedNumber value={treesNeeded} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B8F5E", marginTop: 3 }}>
                Trees
              </div>
              <div style={{ fontSize: 10, color: "#6B8F5E", fontStyle: "italic", marginTop: 1 }}>
                to absorb yearly carbon
              </div>
            </div>

            {/* Driving */}
            <div style={{ borderLeft: "1px solid rgba(184,212,168,0.4)", borderRight: "1px solid rgba(184,212,168,0.4)", paddingLeft: 8, paddingRight: 8 }}>
              <div
                style={{
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                  fontWeight: 900,
                  color: "#4A9B8E",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              >
                <AnimatedNumber value={carKm} suffix="" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B8F5E", marginTop: 3 }}>
                km Driving
              </div>
              <div style={{ fontSize: 10, color: "#6B8F5E", fontStyle: "italic", marginTop: 1 }}>
                equivalent distance
              </div>
            </div>

            {/* Home Energy */}
            <div>
              <div
                style={{
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                  fontWeight: 900,
                  color: "#F4A832",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              >
                <AnimatedNumber value={homeDays} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B8F5E", marginTop: 3 }}>
                Days Energy
              </div>
              <div style={{ fontSize: 10, color: "#6B8F5E", fontStyle: "italic", marginTop: 1 }}>
                powering a home
              </div>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* ── Responsive Overrides ── */}
      <style>{`
        @media (max-width: 768px) {
          .bento-grid-sidebar {
            grid-template-columns: 1fr 1fr !important;
            grid-template-areas:
              "story story"
              "diff diff"
              "ripple hero"
              "verd verd"
              "snap snap" !important;
          }
        }

        @media (max-width: 480px) {
          .bento-grid-sidebar {
            grid-template-columns: 1fr !important;
            grid-template-areas:
              "story"
              "diff"
              "ripple"
              "hero"
              "verd"
              "snap" !important;
          }
          .snapshot-grid-sidebar {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .snapshot-grid-sidebar > div {
            border-left: none !important;
            border-right: none !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            border-bottom: 1px solid rgba(184,212,168,0.3);
            padding-bottom: 12px;
          }
          .snapshot-grid-sidebar > div:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}
