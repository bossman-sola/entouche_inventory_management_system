import React from "react";

export function Donut({ segments, size = 128, strokeWidth = 16 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;
  const total = segments.reduce((s, seg) => s + seg.pct, 0);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      {total === 0 ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
        />
      ) : (
        segments.map((seg, i) => {
          const dash = (seg.pct / 100) * circumference;
          const circle = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offsetAcc}
              strokeLinecap="butt"
            />
          );
          offsetAcc += dash;
          return circle;
        })
      )}
    </svg>
  );
}
