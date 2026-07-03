export const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const SearchSm = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const CalIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const FilterIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth={2}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const ChevDown = ({ color = "#9aa1b4" }) => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const SortIcon = () => (
  <svg style={{ verticalAlign: "-2px", display: "inline" }} width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#9aa1b4" strokeWidth={2}>
    <polyline points="8 9 12 5 16 9" /><polyline points="16 15 12 19 8 15" />
  </svg>
);

export const DotsIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6b7591" strokeWidth={2}>
    <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);

export const DownloadIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#5c657a" strokeWidth={2}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const PlusIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ChevLeft = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const ChevRight = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const EyeIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#1e2740" strokeWidth={2}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);