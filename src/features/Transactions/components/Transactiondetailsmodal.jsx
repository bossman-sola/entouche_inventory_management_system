import React, { useRef, useState } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  Package,
  Calendar,
  Warehouse as WarehouseIcon,
  Hash,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const currencyFmt = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMoney = (value) => `₦${currencyFmt.format(Number(value || 0))}`;

const formatQty = (value) => {
  const n = Number(value || 0);
  return Number.isInteger(n) ? n.toString() : n.toString().replace(/\.?0+$/, "");
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// "opening_balance" -> "Opening Balance"
const humanize = (value) =>
  (value || "")
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// Map raw transaction_type -> the label/prefix/badge shown in the UI.
const TYPE_META = {
  receipt: { label: "Receipt", prefix: "RCPT" },
  opening_balance: { label: "Opening Balance", prefix: "OPBL" },
  purchase: { label: "Receipt", prefix: "RCPT" },
  issue: { label: "Issue", prefix: "ISSU" },
  transfer: { label: "Transfer", prefix: "TRF" },
  adjustment: { label: "Adjustment", prefix: "ADJ" },
  return: { label: "Return", prefix: "RTN" },
};

const getTypeMeta = (transaction) => {
  const key = (transaction?.transaction_type || "").toLowerCase();
  return TYPE_META[key] || { label: humanize(key) || "Transaction", prefix: "TXN" };
};

// "App\\Models\\Asset" + 1 -> "Asset #1"
const formatReference = (transaction) => {
  if (!transaction?.reference_type) return "N/A";
  const parts = transaction.reference_type.split("\\");
  const model = parts[parts.length - 1];
  return transaction.reference_id ? `${model} #${transaction.reference_id}` : model;
};

const badgeToneByDirection = (direction) =>
  direction === "out"
    ? "bg-rose-50 text-rose-700"
    : "bg-emerald-50 text-emerald-700";

// Loads a UMD script once (skips if already present / already loading).
// This deliberately avoids `import("html2canvas")` / `import("jspdf")`:
// most bundlers (webpack, Vite) try to statically resolve dynamic imports
// at build time, so if those packages aren't installed the build itself
// breaks — which is why Download silently produced nothing before.
// Loading the UMD build from a CDN at click-time works regardless of
// whether the packages are installed locally.
const loadScriptOnce = (src, isReady) =>
  new Promise((resolve, reject) => {
    if (isReady()) return resolve();

    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error(`Failed to load ${src}`))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                       */
/* ------------------------------------------------------------------ */

function InfoCard({ icon: Icon, iconBg, iconColor, label, children }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 sm:p-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <div className="mt-0.5 font-semibold text-slate-900 leading-snug break-words">
          {children}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className={`font-medium ${muted ? "text-slate-700" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}

function TimelineItem({ dotBg, dotColor, title, subtitle, timestamp, isLast }) {
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-200" />
      )}
      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${dotBg}`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500 break-words">{subtitle}</p>
        <p className="text-xs text-slate-400 mt-1">{timestamp}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export function TransactionDetailsModal({
  transaction,
  open = true,
  onClose = () => {},
  onExpand = () => {},
  onViewRelated = () => {},
  onBack = () => {},
}) {
  const printableRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  if (!open || !transaction) return null;

  const typeMeta = getTypeMeta(transaction);
  const direction = transaction.direction;
  const item = transaction.item || {};
  const warehouse = transaction.warehouse || {};
  const location = transaction.location || {};
  const performer = transaction.performer || {};

  const quantity = formatQty(transaction.quantity);
  const unitCost = formatMoney(transaction.unit_cost);
  const totalValue = formatMoney(transaction.total_value);
  const subTotal = Number(transaction.total_value || 0);
  const grandTotal = subTotal; // tax + discount are 0 by default

  const referenceNo = `${typeMeta.prefix}-${String(transaction.id ?? "").padStart(
    6,
    "0"
  )}`;

  const movementFrom =
    direction === "out"
      ? { title: warehouse.name || "N/A", subtitle: location.name || "" }
      : { title: "—", subtitle: formatReference(transaction) || "N/A" };

  const movementTo =
    direction === "out"
      ? { title: "—", subtitle: "N/A" }
      : { title: location.name || "N/A", subtitle: warehouse.name || "" };

  const timeline = [
    {
      dotBg: "bg-emerald-100",
      dotColor: "bg-emerald-500",
      title: `${typeMeta.label} Created`,
      subtitle: performer.name || "System",
      timestamp: formatDateTime(transaction.created_at),
    },
    {
      dotBg: "bg-indigo-100",
      dotColor: "bg-indigo-500",
      title: "Item Recorded (1 item)",
      subtitle: `${quantity} ${item.unit_of_measure?.name || "PCS"} of ${
        item.name || "item"
      }`,
      timestamp: formatDateTime(transaction.created_at),
    },
    {
      dotBg: "bg-amber-100",
      dotColor: "bg-amber-500",
      title: `${typeMeta.label} Completed`,
      subtitle: `Stock balance updated: ${formatQty(
        transaction.balance_before
      )} → ${formatQty(transaction.balance_after)}`,
      timestamp: formatDateTime(transaction.updated_at || transaction.created_at),
    },
  ];

  const handleToggleMaximize = () => {
    setIsMaximized((prev) => !prev);
    onExpand();
  };

  const handleDownload = async () => {
    setDownloading(true);
    const el = printableRef.current;

    // Temporarily remove the scroll clipping so html2canvas captures the
    // FULL content, not just whatever is currently scrolled into view —
    // this is the main reason a captured PDF can come out blank/cut off.
    const prevStyle = el
      ? { overflow: el.style.overflow, maxHeight: el.style.maxHeight }
      : null;
    if (el) {
      el.style.overflow = "visible";
      el.style.maxHeight = "none";
    }

    try {
      await loadScriptOnce(
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
        () => !!window.html2canvas
      );
      await loadScriptOnce(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
        () => !!window.jspdf
      );

      if (!el) throw new Error("Nothing to capture");

      const canvas = await window.html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("Captured canvas was empty");
      }

      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "pt",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${transaction.transaction_number || "transaction"}.pdf`);
    } catch (err) {
      // Network blocked, CDN unreachable, or capture failed — fall back
      // to the browser's native "Save as PDF" print flow so Download
      // always produces something.
      console.warn("PDF export failed, falling back to print:", err);
      window.print();
    } finally {
      if (el && prevStyle) {
        el.style.overflow = prevStyle.overflow;
        el.style.maxHeight = prevStyle.maxHeight;
      }
      setDownloading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm overflow-y-auto print:static print:bg-white print:p-0 ${
        isMaximized ? "p-0" : "p-0 sm:p-4"
      }`}
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #txn-printable, #txn-printable * { visibility: visible; }
          #txn-printable { position: absolute; inset: 0; width: 100%; box-shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div
        id="txn-printable"
        ref={printableRef}
        className={`w-full bg-white shadow-2xl overflow-y-auto transition-all duration-150 ${
          isMaximized
            ? "h-screen max-w-none rounded-none"
            : "sm:max-w-5xl sm:rounded-2xl min-h-screen sm:min-h-0 sm:max-h-[92vh]"
        }`}
      >
        {/* ---------------- Header ---------------- */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 sm:px-8 py-5 sm:py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Transaction Details
          </h2>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs sm:text-sm font-semibold text-indigo-600">
              {transaction.transaction_number}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs sm:text-sm font-semibold ${badgeToneByDirection(
                direction
              )}`}
            >
              {typeMeta.label}
            </span>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="no-print inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Preparing…" : "Download"}
            </button>

            <button
              type="button"
              onClick={handleToggleMaximize}
              aria-label={isMaximized ? "Restore" : "Maximize"}
              className="no-print hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              {isMaximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="no-print inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ---------------- Body ---------------- */}
        <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Top info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard
              icon={FileText}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-500"
              label="Transaction Type"
            >
              {typeMeta.label}
            </InfoCard>

            <InfoCard
              icon={Calendar}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              label="Date & Time"
            >
              {formatDateTime(transaction.transaction_date)}
            </InfoCard>

            <InfoCard
              icon={WarehouseIcon}
              iconBg="bg-violet-50"
              iconColor="text-violet-500"
              label="Warehouse"
            >
              {warehouse.name || "N/A"}
            </InfoCard>

            <InfoCard
              icon={Hash}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-500"
              label="Reference No."
            >
              <span className="text-indigo-600">{referenceNo}</span>
            </InfoCard>

            <InfoCard
              icon={User}
              iconBg="bg-slate-100"
              iconColor="text-slate-500"
              label="Performed By"
            >
              <div>{performer.name || "N/A"}</div>
              {performer.email && (
                <div className="text-sm font-normal text-slate-500">
                  {performer.email}
                </div>
              )}
            </InfoCard>

            <InfoCard
              icon={MapPin}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              label="Location"
            >
              {location.name || "N/A"}
            </InfoCard>

            <InfoCard
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              label="Status"
            >
              Completed
            </InfoCard>

            <InfoCard
              icon={Clock}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              label="Created At"
            >
              {formatDateTime(transaction.created_at)}
            </InfoCard>

            <InfoCard
              icon={FileText}
              iconBg="bg-slate-100"
              iconColor="text-slate-500"
              label="Notes"
            >
              {transaction.remarks || "—"}
            </InfoCard>
          </div>

          {/* Item Information + Movement Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <div className="rounded-xl border border-slate-100 p-5 sm:p-6">
              <h3 className="font-bold text-slate-900 mb-4">Item Information</h3>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <Package className="h-7 w-7 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 break-words">
                    {item.name || "N/A"}
                  </p>
                  <p className="text-sm text-slate-500 break-words">
                    SKU: {item.sku || "N/A"} &nbsp;|&nbsp; Category:{" "}
                    {item.category?.name || "Uncategorized"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Unit: {item.unit_of_measure?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-slate-500 leading-tight">
                    Quantity Received
                  </p>
                  <p className="mt-1 font-bold text-slate-900">
                    {quantity}{" "}
                    <span className="text-emerald-600 text-sm font-semibold">
                      {item.unit_of_measure?.name || "PCS"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">Unit Cost</p>
                  <p className="mt-1 font-bold text-slate-900 break-words">
                    {unitCost}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500">Total Value</p>
                  <p className="mt-1 font-bold text-slate-900 break-words">
                    {totalValue}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-5 sm:p-6">
              <h3 className="font-bold text-slate-900 mb-6">Movement Details</h3>
              <div className="flex items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
                    <WarehouseIcon className="h-5 w-5 text-slate-300" />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">From</p>
                  <p className="font-bold text-slate-900">{movementFrom.title}</p>
                  <p className="text-sm text-slate-500">
                    {movementFrom.subtitle || "N/A"}
                  </p>
                </div>

                <div className="flex flex-1 items-center px-2">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="mx-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50">
                    <ArrowRight className="h-4 w-4 text-indigo-400" />
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="text-center sm:text-right">
                  <div className="ml-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                    <WarehouseIcon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">To</p>
                  <p className="font-bold text-slate-900">{movementTo.title}</p>
                  <p className="text-sm text-slate-500">
                    {movementTo.subtitle || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline + Transaction Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <div className="rounded-xl border border-slate-100 p-5 sm:p-6">
              <h3 className="font-bold text-slate-900 mb-5">Activity Timeline</h3>
              <div>
                {timeline.map((t, i) => (
                  <TimelineItem key={i} {...t} isLast={i === timeline.length - 1} />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-5 sm:p-6">
              <h3 className="font-bold text-slate-900 mb-3">Transaction Summary</h3>
              <SummaryRow label="Sub Total" value={formatMoney(subTotal)} muted />
              <SummaryRow label="Tax (0%)" value={formatMoney(0)} muted />
              <SummaryRow label="Discount" value={formatMoney(0)} muted />
              <div className="mt-4 flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-4">
                <span className="font-bold text-indigo-700">Grand Total</span>
                <span className="font-bold text-indigo-700 text-lg break-words">
                  {formatMoney(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Footer ---------------- */}
        <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 px-5 sm:px-8 py-5">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* <button
              type="button"
              onClick={onViewRelated}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
            >
              View Related Receipt
            </button> */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Preparing…" : "Download"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo wrapper (default export target for previewing in isolation)  */
/*  Remove this block once you wire the modal into your own app —     */
/*  it exists only so this file can be previewed standalone.          */
/* ------------------------------------------------------------------ */

const SAMPLE_TRANSACTION = {
  id: 4,
  transaction_number: "TXN-000004",
  item_id: 14,
  warehouse_id: 7,
  warehouse_location_id: 11,
  transaction_type: "opening_balance",
  direction: "in",
  quantity: "1.000",
  balance_before: "0.000",
  balance_after: "1.000",
  unit_cost: "1250.00",
  total_value: "1250.00",
  reference_type: "App\\Models\\Asset",
  reference_id: 1,
  remarks:
    "Opening balance from inventory import kaocqyxDH3775QhTO4RDUmKEb1gBGd6BjsafdhaT.csv",
  performed_by: 1,
  transaction_date: "2026-07-30T23:06:03.000000Z",
  created_at: "2026-07-30T23:06:03.000000Z",
  updated_at: "2026-07-30T23:06:03.000000Z",
  item: {
    id: 14,
    category_id: null,
    unit_of_measure_id: 3,
    supplier_id: null,
    sku: "ITM-000014",
    barcode: null,
    name: "Dell Latitude 5440 Laptop",
    manufacturer: "Dell",
    model_number: "Latitude 5440",
    item_type: "asset",
    brand: null,
    description: null,
    unit_cost: "0.00",
    selling_price: "0.00",
    reorder_level: "0.000",
    image_path: null,
    status: "active",
  },
  warehouse: {
    id: 7,
    name: "Side warehouse",
    code: "WH-004",
    address: "saint saviour rd",
    status: "active",
  },
  location: {
    id: 11,
    warehouse_id: 7,
    name: "Storage",
    code: "ABA183BD",
    type: "field",
    status: "active",
  },
  performer: {
    id: 1,
    name: "Ayomide Ajayi",
    email: "admin@inventory.local",
    phone: null,
    status: "active",
  },
};

export default function TransactionDetailsModalDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium"
        >
          Open Transaction Details
        </button>
      )}
      {open && (
        <TransactionDetailsModal
          transaction={SAMPLE_TRANSACTION}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}