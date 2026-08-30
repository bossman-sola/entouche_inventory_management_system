export default function SettingsInput({ value, onChange, readOnly, placeholder }) {
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "9px 12px",
        border: "1px solid #e4e7ef",
        borderRadius: 8,
        fontSize: 13,
        fontFamily: "inherit",
        color: "#1e2740",
        outline: "none",
        background: readOnly ? "#f8f9fb" : "#fff",
        boxSizing: "border-box",
        transition: "border .15s",
      }}
      onFocus={(e) => {
        if (!readOnly) e.target.style.borderColor = "#4f6ef7";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#e4e7ef";
      }}
    />
  );
}
