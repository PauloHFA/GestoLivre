import React from "react";

export interface HeadCursorOverlayProps {
  x: number;
  y: number;
  progress: number; // 0.0 a 1.0
  active: boolean;
}

export const HeadCursorOverlay: React.FC<HeadCursorOverlayProps> = ({
  x,
  y,
  progress,
  active,
}) => {
  if (!active) return null;

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${x - 32}px, ${y - 32}px, 0)`,
      }}
      aria-hidden="true"
    >
      <svg width="64" height="64" className="overflow-visible">
        {/* Círculo base da mira */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="rgba(56, 189, 248, 0.2)"
          stroke="rgba(56, 189, 248, 0.4)"
          strokeWidth="3"
        />

        {/* Ponto central */}
        <circle cx="32" cy="32" r="4" fill="#38bdf8" />

        {/* Anel de progresso do Dwell Click */}
        {progress > 0 && (
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
          />
        )}
      </svg>
    </div>
  );
};
