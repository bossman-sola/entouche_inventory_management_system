export default function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#1e2740", marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 12.5, color: "#6b7591" }}>{sub}</div>
    </div>
  );
}
