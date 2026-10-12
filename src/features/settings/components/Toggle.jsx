export default function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      aria-pressed={Boolean(value)}
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: value ? "#4f6ef7" : "#d1d5e0",
        cursor: "pointer",
        position: "relative",
        transition: "background .2s",
        flexShrink: 0,
        border: "none",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: value ? 20 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left .2s",
        }}
      />
    </button>
  );
}
