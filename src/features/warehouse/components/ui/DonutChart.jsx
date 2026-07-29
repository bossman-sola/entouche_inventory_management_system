export const DonutChart = ({ segments, total }) => {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 52;
  const innerR = 36;

  let cumulative = 0;
  const paths = segments.map((seg) => {
    const pct = seg.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const endAngle = (cumulative + pct) * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);
    const largeArc = pct > 0.5 ? 1 : 0;

    return (
      <path
        key={seg.label}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`}
        fill={seg.color}
        stroke="white"
        strokeWidth="2"
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" className="w-full max-w-[140px] h-auto shrink-0">
      {paths}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{total.toLocaleString()}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#6b7280">Total</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="9" fill="#6b7280">Quantity</text>
    </svg>
  );
};
