"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useSessionStore } from "@/lib/session-store";

export default function LandingWorld() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hillsRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const { worldState } = useSessionStore();
  const { planetMood } = worldState;

  let overlayColor = "rgba(0, 0, 0, 0)";
  if (planetMood === "Thriving") {
    overlayColor = "rgba(135, 206, 235, 0.25)";
  } else if (planetMood === "Under Stress") {
    overlayColor = "rgba(255, 165, 0, 0.15)";
  } else if (planetMood === "Recovering") {
    overlayColor = "rgba(144, 238, 144, 0.1)";
  }

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

        if (hillsRef.current) {
          gsap.to(hillsRef.current, {
            y: -mouseY * 8,
            duration: 1,
            ease: "power1.out",
          });
        }
        if (cloudsRef.current) {
          gsap.to(cloudsRef.current, {
            x: mouseX * 12,
            duration: 2,
            ease: "power1.out",
          });
        }
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
            #87CEEB 0%,
            #B8E0F7 20%,
            #FFE5A0 55%,
            #FFD580 75%,
            #FFF8E7 100%)`,
          zIndex: 1,
        }}
      />

      {/* ═══ LAYER 1.5 — Mood Tint ═══ */}
      <motion.div
        animate={{ backgroundColor: overlayColor }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none"
        }}
      />

      {/* ═══ LAYER 2 — Sun (Lottie) Centered and Offset Responsively ═══ */}
      <div
        style={{
          position: "absolute",
          top: "-12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 360,
          height: 360,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -8, 0],
          }}
          transition={{
            opacity: { delay: 0.5, duration: 1.2, ease: [0.23, 1, 0.32, 1] },
            scale: { delay: 0.5, duration: 1.2, ease: [0.23, 1, 0.32, 1] },
            y: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
            },
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <DotLottieReact
            src="/lottie/sun.json"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </motion.div>
      </div>

      {/* ═══ LAYER 3 — Clouds ═══ */}
      <div ref={cloudsRef} className="cv-clouds-layer" style={{ zIndex: 3 }}>
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
        ref={hillsRef}
        className="cv-hills-layer"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
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

      {/* ═══ NEW LAYER — Proportional Trees ═══ */}
      {[
        { left:"1%",  bottom:"20%", w:130, delay:0.2 },
        { left:"8%",  bottom:"26%", w:160, delay:0.5 },
        { left:"16%", bottom:"23%", w:140, delay:0.3 },
        { left:"24%", bottom:"28%", w:185, delay:0.7 },
        { left:"38%", bottom:"25%", w:145, delay:0.4 },
        { left:"48%", bottom:"22%", w:115, delay:0.9 },
        { left:"58%", bottom:"27%", w:170, delay:0.6 },
        { left:"68%", bottom:"24%", w:148, delay:0.8 },
        { left:"78%", bottom:"26%", w:163, delay:0.5 },
        { left:"86%", bottom:"21%", w:133, delay:0.3 },
        { left:"91%", bottom:"23%", w:120, delay:0.7 },
      ].map((tree, i) => (
        <motion.div
          key={`tree-${i}`}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: tree.delay,
            type: "spring",
            stiffness: 180,
            damping: 22,
          }}
          style={{
            position: "absolute",
            bottom: tree.bottom,
            left: tree.left,
            width: tree.w,
            aspectRatio: "250 / 300",
            zIndex: 6,
            pointerEvents: "none",
          }}
        >
          <DotLottieReact
            src="/lottie/tree.json"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </motion.div>
      ))}

      {/* ═══ LAYER 5 — Birds (Lottie) ═══ */}
      {[
        { id:1, src:"/lottie/bird1.json", size:90,  top:"28%",
          dir:"ltr", duration:20, delay:0,  yOffset:[0,-10,0] },
        { id:2, src:"/lottie/bird2.json", size:165, top:"18%",
          dir:"rtl", duration:24, delay:3,  yOffset:[6,-6,6] },
        { id:3, src:"/lottie/bird1.json", size:90,  top:"32%",
          dir:"ltr", duration:17, delay:7,  yOffset:[-5,8,-5] },
        { id:4, src:"/lottie/bird2.json", size:165, top:"22%",
          dir:"rtl", duration:21, delay:10, yOffset:[5,-10,5] },
        { id:5, src:"/lottie/bird1.json", size:90,  top:"25%",
          dir:"ltr", duration:26, delay:4,  yOffset:[0,6,0] },
        { id:6, src:"/lottie/bird2.json", size:165, top:"15%",
          dir:"rtl", duration:15, delay:12, yOffset:[-6,4,-6] },
        { id:7, src:"/lottie/bird1.json", size:95,  top:"20%",
          dir:"ltr", duration:22, delay:2,  yOffset:[0,-8,0] },
        { id:8, src:"/lottie/bird2.json", size:165, top:"12%",
          dir:"rtl", duration:18, delay:5,  yOffset:[4,-4,4] },
        { id:9, src:"/lottie/bird1.json", size:85,  top:"35%",
          dir:"ltr", duration:19, delay:8,  yOffset:[-4,6,-4] },
        { id:10, src:"/lottie/bird2.json", size:165, top:"26%",
          dir:"rtl", duration:25, delay:1,  yOffset:[5,-8,5] },
        { id:11, src:"/lottie/bird1.json", size:95,  top:"16%",
          dir:"ltr", duration:23, delay:11, yOffset:[0,5,0] },
        { id:12, src:"/lottie/bird2.json", size:165, top:"29%",
          dir:"rtl", duration:20, delay:6,  yOffset:[-5,5,-5] },
      ].map((bird) => {
        const isLeftToRight = bird.dir === "ltr";
        const getScaleX = (src: string, dir: string) => {
          const isBird2 = src.includes("bird2");
          const isLTR = dir === "ltr";
          if (isBird2) {
            return isLTR ? "scaleX(-1)" : "scaleX(1)";
          } else {
            return isLTR ? "scaleX(1)" : "scaleX(-1)";
          }
        };

        return (
          <motion.div
            key={`bird-${bird.id}`}
            style={{
              position: "absolute",
              top: bird.top,
              width: bird.size,
              height: bird.size,
              zIndex: 5,
            }}
            animate={{
              x: isLeftToRight ? ["-15vw", "115vw"] : ["115vw", "-15vw"],
              y: bird.yOffset,
            }}
            transition={{
              x: {
                duration: bird.duration,
                repeat: Infinity,
                ease: "linear",
                delay: bird.delay,
              },
              y: {
                duration: bird.duration / 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: bird.delay,
              },
            }}
          >
            <div style={{
              width: "100%",
              height: "100%",
              transform: getScaleX(bird.src, bird.dir),
            }}>
              <DotLottieReact
                src={bird.src}
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* FloatingLeaf removed — trees sway instead */}

      {/* ═══ LAYER 7 — Ground Overlay ═══ */}
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
