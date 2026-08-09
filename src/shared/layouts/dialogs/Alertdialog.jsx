import React, { useState } from "react";
import { AlertTriangle, AlertCircle, MapPin, Info, Paperclip, Clock, History, PencilLine, ShoppingCart, ArrowLeftRight } from "lucide-react";
import DialogShell from "./DialogShell";
import { InfoField, Pill, StatBox, DialogButton, Banner } from "./primitives";

const LOCATION_STATUS_TONE = {
  "Out of Stock": "gray",
  "Low Stock": "orange",
  "Reorder Level": "orange",
  "In Stock": "green",
};

const TABS = ["Inventory by Location", "Item Information", "Recent Transactions", "Attachments"];
const AlertDialog = ({
  isOpen,
  onClose,
  variant = "low_stock",
  item = {},
  locations = [],
  stats = {},
  transactions = [],
  attachments = [],
  onCreateReceipt,
  onTransferStock,
  onAdjustStock,
  onViewStockHistory,
}) => {
  const [tab, setTab] = useState(TABS[0]);
  if (!isOpen) return null;

  const isReorder = variant === "reorder";
  const accent = isReorder
    ? { icon: AlertCircle, iconBg: "bg-orange-100", iconFg: "text-orange-500", titleColor: "text-orange-500", banner: "orange" }
    : { icon: AlertTriangle, iconBg: "bg-red-100", iconFg: "text-red-500", titleColor: "text-red-500", banner: "orange" };

  const title = isReorder ? "Reorder Level Reached" : "Low Stock Alert";
  const subtitle = isReorder
    ? "This item has reached its reorder level and needs replenishment."
    : "This item has fallen below its reorder level.";
  const bannerText = isReorder
    ? `Current stock (${stats.totalAvailable ?? "—"} ${item.unit || ""}) has reached the reorder level (${stats.reorderLevel ?? "—"} ${item.unit || ""}).`
    : `Available stock (${stats.totalAvailable ?? "—"} ${item.unit || ""}) is below the reorder level (${stats.reorderLevel ?? "—"} ${item.unit || ""}).`;
  const bannerSub = isReorder ? "Replenish stock to avoid running out." : "Take action to avoid stockout.";

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={accent.icon}
      iconBg={accent.iconBg}
      iconFg={accent.iconFg}
      titleColor={accent.titleColor}
      title={title}
      subtitle={subtitle}
      maxWidth="max-w-[780px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        <>
          <DialogButton icon={History} variant="outline" onClick={onViewStockHistory}>View Stock History</DialogButton>
          <DialogButton icon={PencilLine} variant="outline" onClick={onAdjustStock}>Adjust Stock</DialogButton>
          <DialogButton icon={ShoppingCart} variant="orange" onClick={onCreateReceipt}>Create Receipt</DialogButton>
        </>
      }
    >
      {/* Item summary */}
      <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
        <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-400 font-bold text-lg">{(item.name || "?").charAt(0)}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[16px] font-bold text-[#1E2740]">{item.name || "—"}</span>
            <Pill tone="green">{item.status || "Active"}</Pill>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 mt-3">
            <InfoField label="SKU" value={item.sku} />
            <InfoField label="Category" value={item.category} />
            <InfoField label="Brand" value={item.brand} />
            <InfoField label="Unit" value={item.unit} />
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <InfoField label="Current Stock" value={`${stats.totalAvailable ?? "—"} ${item.unit || ""}`} valueClassName={isReorder ? "text-orange-500 text-[18px]" : "text-red-500 text-[18px]"} />
          <div className="mt-2"><InfoField label="Reorder Level" value={`${stats.reorderLevel ?? "—"} ${item.unit || ""}`} /></div>
          <div className="mt-2"><InfoField label="Lead Time" value={stats.leadTimeDays != null ? `${stats.leadTimeDays} days` : "—"} /></div>
        </div>
      </div>

      {/* Banner */}
      <Banner tone={accent.banner} className="my-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-semibold">{bannerText}</div>
          <div>{bannerSub}</div>
        </div>
        <DialogButton icon={ShoppingCart} variant="orange" onClick={onCreateReceipt}>Create Receipt</DialogButton>
      </Banner>
      {!isReorder && (
        <button onClick={onTransferStock} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-indigo-600 hover:text-indigo-700 mb-4 -mt-2">
          <ArrowLeftRight size={13} /> Transfer Stock
        </button>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-5 border-b border-gray-100 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2.5 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
              tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t === "Attachments" ? `Attachments (${attachments.length})` : t}
          </button>
        ))}
      </div>

      {tab === "Inventory by Location" && (
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[11.5px] font-semibold">
                <th className="text-left px-4 py-2.5">Location</th>
                <th className="text-left px-4 py-2.5">On Hand</th>
                <th className="text-left px-4 py-2.5">Reserved</th>
                <th className="text-left px-4 py-2.5">Available</th>
                <th className="text-left px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">No location data available.</td></tr>
              ) : locations.map((loc, i) => (
                <tr key={i} className={`border-t border-gray-100 ${loc.status === "Low Stock" || loc.status === "Reorder Level" ? "bg-orange-50/60" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#1E2740]">{loc.name}</div>
                    <div className="text-[11px] text-gray-400">{loc.zone}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#1E2740]">{loc.onHand}</td>
                  <td className="px-4 py-3 text-gray-500">{loc.reserved}</td>
                  <td className="px-4 py-3 font-semibold text-[#1E2740]">{loc.available}</td>
                  <td className="px-4 py-3"><Pill tone={LOCATION_STATUS_TONE[loc.status] || "gray"}>{loc.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Item Information" && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-5">
          <InfoField label="Description" value={item.description || "No description provided."} />
          <InfoField label="Weight" value={item.weight} />
          <InfoField label="Dimensions" value={item.dimensions} />
          <InfoField label="Supplier" value={item.supplier} />
        </div>
      )}

      {tab === "Recent Transactions" && (
        <div className="mb-5">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-400 text-[13px] py-8">No recent transactions for this item.</div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {transactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 text-[13px]">
                  <span className="font-medium text-[#1E2740]">{t.label}</span>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span>{t.date}</span>
                    <span className={`font-semibold ${String(t.qty).startsWith("-") ? "text-red-500" : "text-green-600"}`}>{t.qty}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Attachments" && (
        <div className="mb-5">
          {attachments.length === 0 ? (
            <div className="text-center text-gray-400 text-[13px] py-8">No attachments on this item.</div>
          ) : (
            <div className="space-y-2">
              {attachments.map((a, i) => (
                <a key={i} href={a.url} className="flex items-center gap-2 text-[13px] text-indigo-600 font-medium hover:underline">
                  <Paperclip size={13} /> {a.name}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom stat strip */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
        <StatBox icon={AlertTriangle} tone={isReorder ? "orange" : "red"} label="Total Available" value={`${stats.totalAvailable ?? "—"} ${item.unit || ""}`} sub="Across all locations" />
        <StatBox icon={Clock} tone="indigo" label="Reorder Level" value={`${stats.reorderLevel ?? "—"} ${item.unit || ""}`} sub="Set for this item" />
        {isReorder ? (
          <>
            <StatBox icon={Clock} tone="indigo" label="Lead Time" value={stats.leadTimeDays != null ? `${stats.leadTimeDays} Days` : "—"} sub="To receive stock" />
            <StatBox icon={Info} tone="green" label="Status" value="Reorder Required" sub="Needs replenishment" />
          </>
        ) : (
          <StatBox icon={Info} tone="green" label="Shortage" value={`${stats.shortage ?? "—"} ${item.unit || ""}`} sub="To reach reorder level" />
        )}
      </div>
    </DialogShell>
  );
};

export default AlertDialog;