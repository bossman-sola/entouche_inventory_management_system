import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  Trash2,
  Printer,
  Check,
  MessageSquare,
  Info,
  ArrowLeft,
} from "lucide-react";

import {
  getStockCount,
  getStockCountVariance,
  searchStockCountItems,
} from "../api/StockCountApi.js";
import {
  apiFetchStockCountDetails,
  apiFetchLookups,
  apiUpdateStockCount,
  apiUpdateStockCountItem,
  apiRemoveStockCountItem,
  apiAddStockCountItem,
  apiTransitionStockCount,
  apiDeleteStockCount,
  apiExportStockCounts,
  apiDuplicateStockCount,
} from "../components/dataLayer.js";
import { cx, downloadBlob, printCountSheet } from "../components/utils.js";
import {
  StatusBadge,
  VarianceCell,
  StatCard,
  SkeletonRow,
  EmptyState,
} from "../components/Primitives.jsx";
import { RowActionsMenu } from "../components/RowActionsMenu.jsx";
import { AddItemsModal } from "../components/AddItemsModal.jsx";
import { ReasonModal } from "../components/ReasonModal.jsx";
import { NewStockCountModal } from "../components/NewStockCountModal.jsx";

const DETAIL_TABS = ["Items", "Summary", "Adjustments", "History", "Notes"];

export function StockCountDetails({ countId, onBack, onOpenDetails }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Items");
  const [detailMenuOpen, setDetailMenuOpen] = useState(false);

  const [itemSearch, setItemSearch] = useState("");
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [itemSearchResults, setItemSearchResults] = useState([]);
  const [reasonModal, setReasonModal] = useState(null); // { action }

  const [lookups, setLookups] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [variance, setVariance] = useState(null);
  const [varianceLoading, setVarianceLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const refresh = useCallback(async () => {
    const res = await apiFetchStockCountDetails(countId);
    setData(res);
    return res;
  }, [countId]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiFetchStockCountDetails(countId).then((res) => {
      if (alive) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [countId]);

  useEffect(() => {
    apiFetchLookups().then(setLookups);
  }, []);

  useEffect(() => {
    if (tab !== "Summary" || variance) return;
    let alive = true;
    setVarianceLoading(true);
    getStockCountVariance(countId)
      .then((res) => {
        if (alive) setVariance(res);
      })
      .catch(() => {
        if (alive) setVariance({ items: [] });
      })
      .finally(() => {
        if (alive) setVarianceLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [tab, countId, variance]);

  const header = data?.header;
  const stats = data?.stats;
  const items = data?.items || [];
  const activity = data?.activity || [];

  const filteredItems = items.filter((it) => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      it.name?.toLowerCase().includes(q) ||
      it.sku?.toLowerCase().includes(q) ||
      it.barcode?.toLowerCase().includes(q)
    );
  });

  const addedItemIds = new Set(
    items.map((it) => it.itemId ?? it.item_id).filter(Boolean),
  );

  const saveCountedQty = async (item, rawValue) => {
    if (rawValue === "" || Number(rawValue) === Number(item.countedQty)) return;
    try {
      await apiUpdateStockCountItem(countId, item.id, {
        counted_quantity: Number(rawValue),
      });
      refresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Couldn't save that quantity.");
      refresh(); // reset the input back to the last saved value
    }
  };

  const removeCountItem = async (item) => {
    if (!window.confirm(`Remove ${item.name} from this count?`)) return;
    try {
      await apiRemoveStockCountItem(countId, item.id);
      refresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Couldn't remove that item.");
    }
  };

  const searchItemsToAdd = async (q) => {
    try {
      const results = await searchStockCountItems({ search: q });
      setItemSearchResults(results || []);
    } catch (err) {
      setItemSearchResults([]);
    }
  };

  const addSelectedItem = async (catalogItem) => {
    try {
      await apiAddStockCountItem(countId, { item_id: catalogItem.id });
      refresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Couldn't add that item.");
    }
  };

  const runTransition = async (action, extra) => {
    try {
      await apiTransitionStockCount(countId, action, extra);
      refresh();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "That action couldn't be completed. Please try again.",
      );
    }
  };

  // Mirrors StockCountsList's openEditCount/handleSave — pulls the raw
  // backend record (not the display-mapped header) so the form's selects
  // preselect correctly, then saves via the same update endpoint.
  const openEdit = async () => {
    const sc = await getStockCount(countId);
    if (!sc) return;
    setEditForm({
      warehouse: sc.warehouse_id,
      location: sc.warehouse_location_id || "",
      countType: sc.count_type || "",
      priority: sc.priority
        ? sc.priority[0].toUpperCase() + sc.priority.slice(1)
        : "Medium",
      scheduledDate: (sc.count_date || "").slice(0, 10),
      startTime: sc.start_time || "",
      assignedCounter: sc.counted_by || "",
      notes: sc.notes || "",
    });
    setEditOpen(true);
  };

  const handleEditSave = async (form) => {
    try {
      await apiUpdateStockCount(countId, form);
      setEditOpen(false);
      refresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Couldn't save those changes.");
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] px-8 py-6">
      <div className="mb-4 flex items-center gap-1.5 text-sm text-gray-400">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 hover:text-gray-600"
        >
          <ArrowLeft size={14} /> Stock Counts
        </button>
        <span>/</span>
        <span className="text-gray-600">{header?.countNo || countId}</span>
        <span>/</span>
        <span className="text-gray-600">Details</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              Stock Count Details
            </h1>
            <StatusBadge status={header?.status || "Draft"} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-medium text-blue-600">
              {header?.countNo || "–"}
            </span>{" "}
            • {header?.countType || "–"}
          </p>
        </div>
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => printCountSheet(header, items)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Printer size={15} /> Print Count Sheet
          </button>
          <button
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setDetailMenuOpen((o) => !o);
            }}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            More Actions <ChevronDown size={14} />
          </button>
          {detailMenuOpen && header && (
            <RowActionsMenu
              anchorEl={anchorEl}
              row={{
                id: countId,
                countNo: header.countNo,
                rawStatus: header.rawStatus,
              }}
              onClose={() => setDetailMenuOpen(false)}
              onView={() => setTab("Items")}
              onEdit={openEdit}
              onContinue={() => setTab("Items")}
              onDelete={async (r) => {
                if (
                  !window.confirm(
                    `Delete stock count ${r.countNo}? This cannot be undone.`,
                  )
                )
                  return;
                try {
                  await apiDeleteStockCount(r.id);
                  onBack();
                } catch (err) {
                  alert(
                    err?.response?.data?.message ||
                      "Couldn't delete this stock count.",
                  );
                }
              }}
              onPrint={() => printCountSheet(header, items)}
              onDuplicate={async (r) => {
                try {
                  const copy = await apiDuplicateStockCount(r.id);
                  if (copy?.id && onOpenDetails) onOpenDetails(copy.id);
                  else if (copy?.id) onBack(); // no navigate prop wired up — fall back to the list, where it'll show
                } catch (err) {
                  alert(
                    err?.response?.data?.message ||
                      "Couldn't duplicate this stock count.",
                  );
                }
              }}
              onSubmit={() => runTransition("submit")}
              onCancel={() => {
                if (
                  !window.confirm(
                    `Cancel stock count ${header.countNo}? This cannot be undone.`,
                  )
                )
                  return;
                runTransition("cancel");
              }}
              onApprove={() => runTransition("approve")}
              onReject={() => setReasonModal({ action: "reject" })}
              onRequestRecount={() =>
                setReasonModal({ action: "request-recount" })
              }
              onExportPdf={async () => {
                const blob = await apiExportStockCounts({ ids: [countId] });
                downloadBlob(blob, `${header?.countNo || countId}.xlsx`);
              }}
            />
          )}
          {(header?.rawStatus === "draft" ||
            header?.rawStatus === "in_progress") && (
            <button
              onClick={() => runTransition("submit")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Submit Count
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-4">
        <StatCard
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Items"
          value={stats?.totalItems}
          footer={stats ? `${stats.totalItems} to count` : undefined}
          footerColor="text-gray-400"
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Counted Items"
          value={stats?.countedItems}
          footer={stats ? `${stats.countedPct}%` : undefined}
          footerColor="text-gray-400"
        />
        <StatCard
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Uncounted Items"
          value={stats?.uncountedItems}
          footer={stats ? `${stats.uncountedPct}%` : undefined}
          footerColor="text-gray-400"
        />
        <StatCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          label="Total Variance"
          value={
            stats?.totalVariance != null
              ? `${stats.totalVariance} PCS`
              : undefined
          }
          footer={
            stats?.totalVariancePct != null
              ? `${stats.totalVariancePct}%`
              : undefined
          }
          footerColor="text-red-400"
        />
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
            <SlidersHorizontal size={18} className="text-violet-600" />
          </div>
          <p className="text-sm text-gray-500">Progress</p>
          <p className="mt-1 text-[28px] font-semibold leading-none text-gray-900">
            {stats?.progressPct != null ? `${stats.progressPct}%` : "–"}
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${stats?.progressPct || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-8">
        <div className="flex-1">
          <div className="flex gap-6 border-b border-gray-200">
            {DETAIL_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cx(
                  "-mb-px border-b-2 px-1 pb-3 text-sm font-medium",
                  tab === t
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700",
                )}
              >
                {t}
                {t === "Items" && ` (${stats?.totalItems ?? 0})`}
              </button>
            ))}
          </div>

          {tab === "Items" && (
            <div className="mt-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-72">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="Search items by name, SKU, or barcode..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAddItemsOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Plus size={14} /> Add Items
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3">Item Details</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">System Qty</th>
                      <th className="px-4 py-3">Counted Qty</th>
                      <th className="px-4 py-3">Variance</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonRow key={i} cols={7} />
                      ))
                    ) : filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState
                            title={
                              itemSearch
                                ? "No items match your search"
                                : "No items in this count yet"
                            }
                            description={
                              itemSearch
                                ? "Try a different name, SKU, or barcode."
                                : "Add items manually to get started."
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((it) => (
                        <tr
                          key={it.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">
                              {it.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              SKU: {it.sku} • Barcode: {it.barcode}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {it.location}
                            <br />
                            <span className="text-xs text-gray-400">
                              {it.shelf}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {it.systemQty} PCS
                          </td>
                          <td className="px-4 py-3">
                            <input
                              defaultValue={it.countedQty ?? ""}
                              placeholder="Enter qty"
                              onBlur={(e) => saveCountedQty(it, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.target.blur();
                              }}
                              className="w-24 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <VarianceCell value={it.variance} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 text-gray-400">
                              <MessageSquare
                                size={15}
                                className="cursor-pointer hover:text-gray-600"
                              />
                              <Trash2
                                size={15}
                                className="cursor-pointer hover:text-red-500"
                                onClick={() => removeCountItem(it)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "Summary" && (
            <div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">System Qty</th>
                    <th className="px-4 py-3">Counted Qty</th>
                    <th className="px-4 py-3">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {varianceLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonRow key={i} cols={4} />
                    ))
                  ) : (variance?.items || []).length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <EmptyState
                          title="No variance data yet"
                          description="Variance breakdown appears once items have been counted."
                        />
                      </td>
                    </tr>
                  ) : (
                    (variance?.items || []).map((v) => (
                      <tr
                        key={v.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-4 py-3">
                          {v.item?.name || v.name || "-"}
                        </td>
                        <td className="px-4 py-3">{v.system_quantity}</td>
                        <td className="px-4 py-3">{v.counted_quantity}</td>
                        <td className="px-4 py-3">
                          <VarianceCell
                            value={Number(v.variance_quantity ?? 0)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab !== "Items" && tab !== "Summary" && (
            <div className="mt-5 rounded-xl border border-gray-200 bg-white">
              <EmptyState
                title={`No ${tab.toLowerCase()} yet`}
                description={`${tab} will show up here once available.`}
              />
            </div>
          )}
        </div>

        <aside className="w-75 shrink-0 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-[15px] font-semibold text-gray-900">
              Stock Count Information
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Warehouse", header?.warehouse],
                ["Location", header?.location],
                ["Count Type", header?.countType],
                ["Count Scope", header?.countScope],
                ["Priority", header?.priority],
                ["Scheduled Date", header?.scheduledDate],
                ["Started Time", header?.startedTime],
                ["Assigned Counter", header?.assignedCounter],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-medium text-gray-900">{v || "–"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-gray-900">
                Count Activity
              </h3>
              <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                View all
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-full animate-pulse rounded bg-gray-100"
                  />
                ))
              ) : activity.length === 0 ? (
                <p className="text-sm text-gray-400">No activity yet.</p>
              ) : (
                activity.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className={cx(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        a.done
                          ? "bg-emerald-50 text-emerald-500"
                          : "bg-gray-100 text-gray-300",
                      )}
                    >
                      <Check size={13} />
                    </div>
                    <div>
                      <p
                        className={cx(
                          "text-sm font-medium",
                          a.done ? "text-gray-900" : "text-gray-400",
                        )}
                      >
                        {a.title}
                      </p>
                      {a.detail && (
                        <p className="text-sm text-gray-500">{a.detail}</p>
                      )}
                      {a.time && (
                        <p className="mt-0.5 text-xs text-gray-400">{a.time}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 rounded-xl bg-blue-50 p-4">
            <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-semibold text-blue-700">Next Step</p>
              <p className="mt-0.5 text-sm text-blue-700">
                Review all counted items, add any adjustments if needed, and
                submit the count for review.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <AddItemsModal
        open={addItemsOpen}
        onClose={() => setAddItemsOpen(false)}
        onSearch={searchItemsToAdd}
        results={itemSearchResults}
        addedIds={addedItemIds}
        onAdd={addSelectedItem}
      />

      <NewStockCountModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        lookups={lookups}
        initialForm={editForm}
        isEditing
        onSave={handleEditSave}
      />

      <ReasonModal
        open={!!reasonModal}
        title={
          reasonModal?.action === "reject"
            ? "Reject Stock Count"
            : "Request Recount"
        }
        label={
          reasonModal?.action === "reject"
            ? "Rejection reason"
            : "Recount reason (optional)"
        }
        required={reasonModal?.action === "reject"}
        onClose={() => setReasonModal(null)}
        onSubmit={async (reason) => {
          const action = reasonModal.action;
          setReasonModal(null);
          await runTransition(action, { reason });
        }}
      />
    </div>
  );
}
