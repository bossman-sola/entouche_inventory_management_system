export default function SettingsSelect({ value, onChange, options = [], disabled }) {
  const normalizedOptions = options.map((option) => {
    if (typeof option === "string" && /^[A-Z]{3} \(/.test(option)) {
      return { value: option.slice(0, 3), label: option };
    }
    return option;
  });

  const selectedValue = normalizedOptions.some(
    (option) => (typeof option === "string" ? option : option.value) === value,
  )
    ? value
    : typeof value === "string" && /^[A-Z]{3} \(/.test(value)
      ? value.slice(0, 3)
      : value;

  return (
    <div style={{ position: "relative" }}>
      <select
        value={selectedValue ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "9px 32px 9px 12px",
          border: "1px solid #e4e7ef",
          borderRadius: 8,
          fontSize: 13,
          fontFamily: "inherit",
          color: "#1e2740",
          outline: "none",
          appearance: "none",
          background: disabled ? "#f8f9fb" : "#fff",
          cursor: disabled ? "default" : "pointer",
          boxSizing: "border-box",
        }}
      >
        {normalizedOptions.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      <svg
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9aa1b4"
        strokeWidth="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
