export const PagBtn = ({ children, active, onClick, disabled }) => (
  <div
    onClick={!disabled ? onClick : undefined}
    style={{
      width: 30, height: 30,
      background: active ? "#4f6ef7" : "#fff",
      border: active ? "none" : "1px solid #e4e7ef",
      borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: active ? "#fff" : disabled ? "#c0c4d0" : "#1e2740",
      fontSize: 12.5, fontWeight: active ? 600 : 400,
      cursor: disabled ? "default" : "pointer", userSelect: "none",
    }}
  >{children}</div>
);