export default function SaveButton({ onClick, saving }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        style={{
          padding: "10px 28px",
          background: saving ? "#9aabf5" : "#4f6ef7",
          border: "none",
          borderRadius: 8,
          fontSize: 13.5,
          fontWeight: 600,
          color: "#fff",
          cursor: saving ? "default" : "pointer",
          fontFamily: "inherit",
          transition: "background .15s",
        }}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
