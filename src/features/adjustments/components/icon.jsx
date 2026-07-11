export const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);