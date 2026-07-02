import { SortIcon, DotsIcon, EyeIcon, ChevLeft, ChevRight, ChevDown } from "./icons.jsx";
import { PagBtn } from "./PagBtn.jsx";
import { txTypeStyle, statusStyle } from "../constants/transactionsData.js";

const COLUMNS = ["ID","Date & Time","Type","Item","From","To","Qty","Unit Cost (₦)","Total (₦)","User","Status","Actions"];

export const TransactionsTable = ({
  transactions,
  page, perPage, totalFiltered,
  onPageChange,
  openMenuId, onToggleMenu,
}) => {
  const pages = Math.max(1, Math.ceil(totalFiltered / perPage));

  return (
    <div style={{ background: "#fff", border: "1px solid #e4e7ef", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e4e7ef", background: "#f8f9fb" }}>
              {COLUMNS.map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: "#6b7591", fontWeight: 500, whiteSpace: "nowrap", fontSize: 12 }}>
                  {!["Type","Actions","Status"].includes(h) ? <>{h} <SortIcon /></> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={COLUMNS.length} style={{ padding: "40px 20px", textAlign: "center", color: "#9aa1b4", fontSize: 12.5 }}>No transactions to show yet.</td></tr>
            ) : transactions.map(t => {
              const ts = txTypeStyle[t.type] || {};
              const ss = statusStyle[t.status] || {};
              return (
                <tr key={t.id}
                  style={{ borderBottom: "1px solid #f4f6fb", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                >
                  <td style={{ padding: "12px 14px", fontWeight: 500, color: "#4f6ef7", whiteSpace: "nowrap", cursor: "pointer" }}>{t.id}</td>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ color: "#1e2740" }}>{t.date}</div>
                    <div style={{ color: "#9aa1b4", fontSize: 11.5 }}>{t.time}</div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: ts.bg, color: ts.color, padding: "3px 10px", borderRadius: 5, fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap" }}>{t.type}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ color: "#1e2740", whiteSpace: "nowrap" }}>{t.item}</div>
                    <div style={{ color: "#9aa1b4", fontSize: 11.5 }}>{t.sku}</div>
                  </td>
                  <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.from}</td>
                  <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.to}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 500, color: t.qty < 0 ? "#c0392b" : "#1e2740" }}>{t.qty}</td>
                  <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.unitCost.toLocaleString()}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: t.total < 0 ? "#c0392b" : "#1e2740", whiteSpace: "nowrap" }}>{t.total.toLocaleString()}</td>
                  <td style={{ padding: "12px 14px", color: "#6b7591", whiteSpace: "nowrap" }}>{t.user}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: ss.bg, color: ss.color, padding: "3px 10px", borderRadius: 5, fontSize: 11.5, fontWeight: 500 }}>{t.status}</span>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center", position: "relative" }}>
                    <div
                      onClick={e => { e.stopPropagation(); onToggleMenu(t.id); }}
                      style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 6, margin: "0 auto", transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <DotsIcon />
                    </div>
                    {openMenuId === t.id && (
                      <div onClick={e => e.stopPropagation()} style={{ position: "absolute", right: 8, top: 32, zIndex: 50, background: "#fff", border: "1px solid #e4e7ef", borderRadius: 8, boxShadow: "0 8px 24px rgba(20,25,50,0.14)", minWidth: 150, padding: 4, textAlign: "left" }}>
                        <div onClick={() => onToggleMenu(null)}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12.5, color: "#1e2740", fontWeight: 500 }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f4f6fb"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <EyeIcon /> View Details
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #e4e7ef", flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontSize: 12, color: "#6b7591" }}>
          Showing {totalFiltered === 0 ? 0 : (page-1)*perPage+1} to {Math.min(page*perPage, totalFiltered)} of {totalFiltered} transactions
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <PagBtn disabled={page===1}     onClick={() => onPageChange(Math.max(1, page-1))}><ChevLeft /></PagBtn>
          {Array.from({ length: Math.min(pages,5) }, (_,i) => i+1).map(n => (
            <PagBtn key={n} active={page===n} onClick={() => onPageChange(n)}>{n}</PagBtn>
          ))}
          {pages > 5 && <span style={{ color: "#9aa1b4", fontSize: 12 }}>…</span>}
          <PagBtn disabled={page===pages} onClick={() => onPageChange(Math.min(pages, page+1))}><ChevRight /></PagBtn>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, cursor: "pointer", marginLeft: 8 }}>
            10 / page <ChevDown />
          </div>
        </div>
      </div>
    </div>
  );
};