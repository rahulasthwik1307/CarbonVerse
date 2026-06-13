"use client";

interface FloatingLeafProps {
  top: string;
  left?: string;
  right?: string;
  size?: number;
  delay?: number;
  duration?: number;
}

export default function FloatingLeaf({
  top,
  left,
  right,
  size = 50,
  delay = 0,
  duration = 10,
}: FloatingLeafProps) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        width: size,
        height: size,
        animation: `cv-leaf-fall ${duration}s ease-in-out ${delay}s infinite`,
        pointerEvents: "none",
        zIndex: 6,
      }}
    >
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        fill="none"
        style={{
          animation: `cv-leaf-drift ${duration * 0.6}s ease-in-out ${delay}s infinite`,
        }}
      >
        <path
          d="M20 4C20 4 8 14 8 24C8 30 13 36 20 36C27 36 32 30 32 24C32 14 20 4 20 4Z"
          fill="#6AAB45"
          opacity={0.8}
        />
        <path
          d="M20 10L20 32"
          stroke="#4A7C2F"
          strokeWidth="1"
          opacity={0.5}
        />
        <path
          d="M20 16L14 21M20 20L26 24M20 24L15 28"
          stroke="#4A7C2F"
          strokeWidth="0.6"
          opacity={0.4}
        />
      </svg>
    </div>
  );
}
