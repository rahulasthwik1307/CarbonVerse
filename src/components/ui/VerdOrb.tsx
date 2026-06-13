"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface VerdOrbProps {
  size?: number;
  className?: string;
}

export default function VerdOrb({ size = 48, className = "" }: VerdOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Spring-based tilt toward mouse
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!orbRef.current) return;
      const rect = orbRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / 200;
      const deltaY = (e.clientY - centerY) / 200;
      rotateX.set(-deltaY * 8);
      rotateY.set(deltaX * 8);
    },
    [rotateX, rotateY]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const eyeSize = Math.max(3, size * 0.07);
  const eyeGap = size * 0.18;
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
      whileHover={{ scale: 1.15, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Main orb body */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%,
            #A8E6A0 0%,
            #7BC67E 40%,
            #4A9B5E 80%,
            #2D7A45 100%)`,
          animation: "cv-float 3s ease-in-out infinite, cv-verd-pulse 2s ease-in-out infinite",
          position: "relative",
          overflow: "visible",
        }}
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

        {/* Eyes */}
        <div
          style={{
            position: "absolute",
            top: "42%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: eyeGap,
          }}
        >
          <motion.div
            style={{
              width: eyeSize,
              height: eyeSize,
              borderRadius: "50%",
              backgroundColor: "#1A4A10",
            }}
            animate={{ scale: isHovered ? 1.2 : 1 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          />
          <motion.div
            style={{
              width: eyeSize,
              height: eyeSize,
              borderRadius: "50%",
              backgroundColor: "#1A4A10",
            }}
            animate={{ scale: isHovered ? 1.2 : 1 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
      </div>

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
