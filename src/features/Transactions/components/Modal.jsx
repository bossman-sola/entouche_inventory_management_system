export const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} onClick={onClose} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", width: "100%", maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
};