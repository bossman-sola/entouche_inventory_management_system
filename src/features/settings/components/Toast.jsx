export default function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1e2740",
        color: "#fff",
        padding: "10px 22px",
        borderRadius: 9,
        fontSize: 13,
        fontWeight: 500,
        zIndex: 99999,
        whiteSpace: "nowrap",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        maxWidth: "calc(100vw - 32px)",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {msg}
    </div>
  );
}
