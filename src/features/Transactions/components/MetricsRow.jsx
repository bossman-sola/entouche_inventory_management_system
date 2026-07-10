import React from "react";
import { MetricCard } from "./MetricCard.jsx";

// The five summary cards at the top of the Transactions page.
export const MetricsRow = ({ loading, totalTxns, totalReceipts, totalTransfers, totalAdj, pendingCount, onPendingClick }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
    <MetricCard iconBg="#eef2ff"
      icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={2}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
      label="Total Transactions" value={loading ? "…" : totalTxns} sub="All time" />
    <MetricCard iconBg="#e6faf3"
      icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#22c27e" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
      label="Receipts" value={loading ? "…" : totalReceipts} sub="All time" />
    <MetricCard iconBg="#eef2ff"
      icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth={2}><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>}
      label="Transfers" value={loading ? "…" : totalTransfers} sub="All time" />
    <MetricCard iconBg="#fff7ed"
      icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
      label="Adjustments" value={loading ? "…" : totalAdj} sub="All time" />
    <MetricCard iconBg="#f5f3ff"
      icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth={2}><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
      label="Pending" value={loading ? "…" : pendingCount}
      sub="View pending" subAccent onClick={onPendingClick} />
  </div>
);

export default MetricsRow;
