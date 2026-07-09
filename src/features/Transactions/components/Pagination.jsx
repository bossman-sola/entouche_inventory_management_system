import React from "react";
import { PagBtn } from "./PagBtn.jsx";
import { ChevLeft, ChevRight, ChevDown } from "./icons/SmallIcons.jsx";

export const Pagination = ({ page, pages, perPage, totalCount, onPageChange }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #e4e7ef", flexWrap: "wrap", gap: 10 }}>
    <span style={{ fontSize: 12, color: "#6b7591" }}>
      Showing {totalCount === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, totalCount)} of {totalCount} transactions
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <PagBtn disabled={page === 1} onClick={() => onPageChange(Math.max(1, page - 1))}><ChevLeft /></PagBtn>
      {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
        <PagBtn key={n} active={page === n} onClick={() => onPageChange(n)}>{n}</PagBtn>
      ))}
      {pages > 5 && <span style={{ color: "#9aa1b4", fontSize: 12 }}>…</span>}
      <PagBtn disabled={page === pages} onClick={() => onPageChange(Math.min(pages, page + 1))}><ChevRight /></PagBtn>
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1px solid #e4e7ef", borderRadius: 6, fontSize: 12, cursor: "pointer", marginLeft: 8 }}>
        10 / page <ChevDown />
      </div>
    </div>
  </div>
);

export default Pagination;
