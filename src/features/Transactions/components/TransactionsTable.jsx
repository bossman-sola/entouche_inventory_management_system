import React from "react";
import { SortIcon } from "./icons/SmallIcons.jsx";
import { TransactionRow } from "./TransactionRow.jsx";
import { Pagination } from "./Pagination.jsx";

const COLUMNS = ["ID","Date & Time","Type","Item","From","To","Qty","Unit Cost (₦)","Total (₦)","User","Status","Actions"];

export const TransactionsTable = ({
  loading, visible, totalCount,
  page, pages, perPage, onPageChange,
  openMenuId, onToggleMenu,
  emptyMessage,
}) => (
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
          {loading ? (
            <tr><td colSpan={12} style={{ padding: "40px 20px", textAlign: "center", color: "#9aa1b4", fontSize: 12.5 }}>Loading transactions…</td></tr>
          ) : visible.length === 0 ? (
            <tr><td colSpan={12} style={{ padding: "40px 20px", textAlign: "center", color: "#9aa1b4", fontSize: 12.5 }}>
              {emptyMessage}
            </td></tr>
          ) : visible.map(t => (
            <TransactionRow key={t.id} t={t} isMenuOpen={openMenuId === t.id} onToggleMenu={onToggleMenu} />
          ))}
        </tbody>
      </table>
    </div>

    <Pagination page={page} pages={pages} perPage={perPage} totalCount={totalCount} onPageChange={onPageChange} />
  </div>
);

export default TransactionsTable;
