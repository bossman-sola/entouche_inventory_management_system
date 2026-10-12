export default function FieldRow({ children, cols = "1fr 1fr 1fr" }) {
  return (
    <div
      className="st-fieldrow"
      style={{ display: "grid", gridTemplateColumns: cols, gap: 16, marginBottom: 16 }}
    >
      {children}
    </div>
  );
}
