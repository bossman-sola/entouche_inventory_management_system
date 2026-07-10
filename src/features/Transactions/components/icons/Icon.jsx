import React from "react";

// Generic path-based icon — pass any `d` from constants.js's iconPaths.
export const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default Icon;
