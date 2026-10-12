export default function Field({ label, children }) {
  return (
    <div style={{ minWidth: 0 }}>
      <label style={{ fontSize: 12, color: "#6b7591", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
