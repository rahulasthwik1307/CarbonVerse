"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import FloatingLeaf from "@/components/ui/FloatingLeaf";

export default function LandingWorld() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const initGsap = async () => {
      const { gsap } = await import("gsap");

      const handleMouseMove = (e: MouseEvent) => {
        if (!mounted) return;
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const mouseX = (clientX / innerWidth - 0.5) * 2;
        const mouseY = (clientY / innerHeight - 0.5) * 2;

        gsap.to(".cv-hills-layer", {
          y: -mouseY * 8,
          duration: 1,
          ease: "power1.out",
        });
        gsap.to(".cv-clouds-layer", {
          x: mouseX * 12,
          duration: 2,
          ease: "power1.out",
        });
        gsap.to(".cv-trees-layer", {
          y: -mouseY * 14,
          duration: 1.2,
          ease: "power1.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    };

    const cleanup = initGsap();

    return () => {
      mounted = false;
      cleanup.then((fn) => fn?.());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {/* ═══ LAYER 1 — Sky Gradient ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg,
            #B8E0F7 0%,
            #D4EDDA 40%,
            #FFE5A0 75%,
            #FFF0C0 100%)`,
          zIndex: 1,
        }}
      />

      {/* ═══ LAYER 2 — Sun (Lottie) ═══ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 120,
          zIndex: 2,
        }}
      >
        <DotLottieReact
          src="/lottie/sun.json"
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </motion.div>

      {/* ═══ LAYER 3 — Clouds ═══ */}
      <div className="cv-clouds-layer" style={{ zIndex: 3 }}>
        <div
          style={{
            position: "absolute",
            top: "12%",
            left: "10%",
            width: 180,
            height: 70,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.7)",
            filter: "blur(15px)",
            animation: "cv-cloud-drift 18s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: "55%",
            width: 140,
            height: 55,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.7)",
            filter: "blur(15px)",
            animation: "cv-cloud-drift 24s ease-in-out 3s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "9%",
            right: "15%",
            width: 160,
            height: 65,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.7)",
            filter: "blur(15px)",
            animation: "cv-cloud-drift 20s ease-in-out 6s infinite",
          }}
        />
      </div>

      {/* ═══ LAYER 4 — Hills SVG ═══ */}
      <div
        className="cv-hills-layer"
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          zIndex: 4,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hills-background.svg"
          alt=""
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>

      {/* ═══ LAYER 5 — Trees (Lottie) ═══ */}
      <div className="cv-trees-layer" style={{ zIndex: 5 }}>
        {[
          { bottom: "28%", left: "8%", width: 80, delay: 0.2 },
          { bottom: "30%", left: "22%", width: 110, delay: 0.4 },
          { bottom: "28%", right: "18%", width: 90, delay: 0.6 },
          { bottom: "31%", right: "32%", width: 120, delay: 0.8 },
        ].map((tree, i) => (
          <motion.div
            key={`tree-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: tree.delay,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            style={{
              position: "absolute",
              bottom: tree.bottom,
              left: tree.left,
              right: tree.right,
              width: tree.width,
            }}
          >
            <DotLottieReact
              src="/lottie/tree.json"
              loop
              autoplay
              style={{ width: "100%", height: "auto" }}
            />
          </motion.div>
        ))}
      </div>

      {/* ═══ LAYER 6 — Birds (Lottie) ═══ */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 0.8 }}
        transition={{ delay: 2, duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
        style={{
          position: "absolute",
          top: "20%",
          right: "15%",
          width: 180,
          zIndex: 6,
        }}
      >
        <DotLottieReact
          src="/lottie/birds.json"
          loop
          autoplay
          style={{ width: "100%", height: "auto" }}
        />
      </motion.div>

      {/* ═══ LAYER 7 — Floating Leaves ═══ */}
      <FloatingLeaf top="15%" left="8%" size={60} delay={0} duration={10} />
      <FloatingLeaf top="35%" right="12%" size={50} delay={2} duration={11} />
      <FloatingLeaf top="55%" left="20%" size={45} delay={4} duration={9} />
      <FloatingLeaf top="25%" right="35%" size={55} delay={6} duration={12} />

      {/* ═══ LAYER 8 — Ground Overlay ═══ */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "30%",
          background: `linear-gradient(180deg,
            transparent 0%,
            rgba(200, 230, 160, 0.3) 50%,
            rgba(168, 216, 120, 0.5) 100%)`,
          zIndex: 7,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
