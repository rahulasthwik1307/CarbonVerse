"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

interface VerdOrbProps {
  size?: number;
  className?: string;
  mood?: "eco" | "moderate" | "high" | null;
}

export default function VerdOrb({ size = 48, className = "", mood }: VerdOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Spring-based tilt toward mouse for the entire orb container
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 120, damping: 18 });
  const springRotateY = useSpring(rotateY, { stiffness: 120, damping: 18 });

  // Spring-based eye/pupil offset tracking mouse
  const eyeX = useMotionValue(0);
  const eyeY = useMotionValue(0);
  const springEyeX = useSpring(eyeX, { stiffness: 120, damping: 18 });
  const springEyeY = useSpring(eyeY, { stiffness: 120, damping: 18 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!orbRef.current) return;
    const rect = orbRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Tilt the whole orb toward cursor
    const deltaX = (e.clientX - centerX) / window.innerWidth;
    const deltaY = (e.clientY - centerY) / window.innerHeight;
    rotateX.set(-deltaY * 12);
    rotateY.set(deltaX * 12);

    // Eye tracking — much larger movement range
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      // Eyes move up to 6px in any direction
      const maxMove = 6;
      const factor = Math.min(1, distance / 300);
      eyeX.set((dx / distance) * maxMove * factor);
      eyeY.set((dy / distance) * maxMove * factor);
    } else {
      eyeX.set(0);
      eyeY.set(0);
    }
  }, [rotateX, rotateY, eyeX, eyeY]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Randomized blinking logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const scheduleBlink = () => {
      // Blink randomly every 3 to 7 seconds
      const delay = 3000 + Math.random() * 4000;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150); // duration of a blink
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, []);

  const [animState, setAnimState] = useState<any>({
    y: [0, -4, 0],
    scale: [1, 1.025, 1],
    opacity: 1,
    transition: { duration: 3.5, ease: "easeInOut", repeat: Infinity }
  });

  useEffect(() => {
    if (mood === "eco") {
      setAnimState({
        y: [0, -4, 0],
        scale: [1, 1.3, 1],
        opacity: 1,
        transition: { duration: 0.3, repeat: 2 }
      });
      setTimeout(() => setAnimState({
        y: [0, -4, 0], scale: [1, 1.025, 1], opacity: 1,
        transition: { duration: 3.5, ease: "easeInOut", repeat: Infinity }
      }), 900);
    } else if (mood === "high") {
      setAnimState({
        y: [0, -4, 0],
        scale: [1, 1.025, 1],
        opacity: 0.7,
        transition: { duration: 0.3 }
      });
      setTimeout(() => setAnimState({
        y: [0, -4, 0], scale: [1, 1.025, 1], opacity: 1,
        transition: { duration: 3.5, ease: "easeInOut", repeat: Infinity }
      }), 600);
    } else if (mood === "moderate") {
      setAnimState({
        y: [0, -8, 0],
        scale: [1, 1.025, 1],
        opacity: 1,
        transition: { duration: 0.3 }
      });
      setTimeout(() => setAnimState({
        y: [0, -4, 0], scale: [1, 1.025, 1], opacity: 1,
        transition: { duration: 3.5, ease: "easeInOut", repeat: Infinity }
      }), 300);
    }
  }, [mood]);

  const eyeSize = Math.max(4, size * 0.09);
  const eyeGap = size * 0.22;
  const leafSize = size * 0.3;

  return (
    <motion.div
      ref={orbRef}
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
        cursor: "pointer",
        rotateX: springRotateX,
        rotateY: springRotateY,
      }}
      whileHover={{ scale: 1.12, rotate: 4 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Main orb body with breathing and glow */}
      <motion.div
        animate={animState}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%,
            #A8E6A0 0%,
            #7BC67E 40%,
            #4A9B5E 80%,
            #2D7A45 100%)`,
          position: "relative",
          overflow: "visible",
        }}
        className="cv-verd-glow-effect"
      >
        {/* Inner glass highlight */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "20%",
            width: "30%",
            height: "30%",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.6)",
            filter: "blur(2px)",
          }}
        />

        {/* Eyebrows */}
        <motion.div
          style={{
            position: "absolute",
            top: "28%",
            left: "50%",
            display: "flex",
            gap: eyeGap * 1.1,
            transform: "translateX(-50%)",
            x: springEyeX,  // eyebrows follow eyes slightly
          }}
        >
          {/* Left eyebrow */}
          <motion.div
            style={{
              width: eyeSize * 1.6,
              height: Math.max(2, eyeSize * 0.25),
              backgroundColor: "#1A4A10",
              borderRadius: eyeSize,
              transformOrigin: "center",
            }}
            animate={{
              rotate: isHovered ? -12 : 0,  // raises on hover
              y: isHovered ? -2 : 0,
              scaleX: isBlinking ? 0.8 : 1,
            }}
            transition={{ duration: 0.2, ease: [0.23,1,0.32,1] }}
          />
          {/* Right eyebrow */}
          <motion.div
            style={{
              width: eyeSize * 1.6,
              height: Math.max(2, eyeSize * 0.25),
              backgroundColor: "#1A4A10",
              borderRadius: eyeSize,
              transformOrigin: "center",
            }}
            animate={{
              rotate: isHovered ? 12 : 0,  // raises on hover
              y: isHovered ? -2 : 0,
              scaleX: isBlinking ? 0.8 : 1,
            }}
            transition={{ duration: 0.2, ease: [0.23,1,0.32,1] }}
          />
        </motion.div>

        {/* Eyes & Pupils */}
        <motion.div
          style={{
            position: "absolute",
            top: "42%",
            left: "50%",
            display: "flex",
            gap: eyeGap,
            x: springEyeX,
            y: springEyeY,
            // Center the eyes group horizontally
            transform: "translateX(-50%)",
          }}
        >
          {/* Left Eye */}
          <motion.div
            style={{
              width: eyeSize,
              height: eyeSize,
              borderRadius: "50%",
              backgroundColor: "#1A4A10",
              transformOrigin: "center",
            }}
            animate={{
              scaleY: isBlinking ? 0.1 : 1,
              scaleX: isHovered ? 1.15 : 1,
            }}
            transition={{ duration: 0.12 }}
          />
          {/* Right Eye */}
          <motion.div
            style={{
              width: eyeSize,
              height: eyeSize,
              borderRadius: "50%",
              backgroundColor: "#1A4A10",
              transformOrigin: "center",
            }}
            animate={{
              scaleY: isBlinking ? 0.1 : 1,
              scaleX: isHovered ? 1.15 : 1,
            }}
            transition={{ duration: 0.12 }}
          />
        </motion.div>

        {/* Cheeks — visible on hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  bottom: "28%",
                  left: "12%",
                  width: eyeSize * 1.4,
                  height: eyeSize * 0.8,
                  borderRadius: "50%",
                  background: "rgba(255,150,150,0.35)",
                  filter: "blur(2px)",
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                style={{
                  position: "absolute",
                  bottom: "28%",
                  right: "12%",
                  width: eyeSize * 1.4,
                  height: eyeSize * 0.8,
                  borderRadius: "50%",
                  background: "rgba(255,150,150,0.35)",
                  filter: "blur(2px)",
                }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Leaf 1 — top-left */}
      <svg
        width={leafSize}
        height={leafSize}
        viewBox="0 0 24 24"
        fill="none"
        style={{
          position: "absolute",
          top: "-8%",
          left: "10%",
          ["--leaf-base-rotate" as string]: "-30deg",
          animation: "cv-leaf-sway 2s ease-in-out infinite",
          transformOrigin: "bottom center",
        }}
      >
        <path
          d="M12 2C12 2 4 8 4 14C4 18 7.5 22 12 22C12 22 12 14 12 2Z"
          fill="#4A7C2F"
          opacity={0.9}
        />
        <path
          d="M12 6C12 6 12 22 12 22"
          stroke="#2D5016"
          strokeWidth="0.8"
          opacity={0.5}
        />
      </svg>

      {/* Leaf 2 — top-right */}
      <svg
        width={leafSize}
        height={leafSize}
        viewBox="0 0 24 24"
        fill="none"
        style={{
          position: "absolute",
          top: "-10%",
          right: "8%",
          ["--leaf-base-rotate" as string]: "20deg",
          animation: "cv-leaf-sway 2s ease-in-out 0.5s infinite",
          transformOrigin: "bottom center",
        }}
      >
        <path
          d="M12 2C12 2 20 8 20 14C20 18 16.5 22 12 22C12 22 12 14 12 2Z"
          fill="#4A7C2F"
          opacity={0.9}
        />
        <path
          d="M12 6C12 6 12 22 12 22"
          stroke="#2D5016"
          strokeWidth="0.8"
          opacity={0.5}
        />
      </svg>
    </motion.div>
  );
}