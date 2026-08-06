import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";

import { getStockCount, getStockCountCalendar } from "../api/StockCountApi.js";
import {
  apiFetchOverview,
  apiFetchStockCounts,
  apiFetchLookups,
  apiFetchStockCountDetails,
  apiCreateStockCount,
  apiUpdateStockCount,
  apiDeleteStockCount,
  apiDuplicateStockCount,
  apiTransitionStockCount,
  apiExportStockCounts,
} from "../components/dataLayer.js";
import { cx, downloadBlob, printCountSheet } from "../components/utils.js";
import { STATUSES } from "../components/constants.js";
import {
  StatCard,
  StatusBadge,
  VarianceCell,
  SkeletonRow,
  EmptyState,
} from "../components/Primitives.jsx";
import { StockCountOverview } from "../components/StockCountOverview.jsx";
import { ExportDropdown } from "../components/ExportDropdown.jsx";
import { RowActionsMenu } from "../components/RowActionsMenu.jsx";
import { AdvancedFiltersModal } from "../components/AdvancedFiltersModal.jsx";
import { NewStockCountModal } from "../components/NewStockCountModal.jsx";
import { StockCountCalendarModal } from "../components/StockCountCalendarModal.jsx";
import { ReasonModal } from "../components/ReasonModal.jsx";

export function StockCountsList({ onOpenDetails }) {
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [rowsLoading, setRowsLoading] = useState(true);

  const [lookups, setLookups] = useState(null);

  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [newCountOpen, setNewCountOpen] = useState(false);
  const [newCountInitialForm, setNewCountInitialForm] = useState(null);
  const [editingCountId, setEditingCountId] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [openMenuRowId, setOpenMenuRowId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [reasonModal, setReasonModal] = useState(null); // { action, row }

  const closeRowMenu = useCallback(() => {
    setOpenMenuRowId(null);
    setMenuAnchor(null);
  }, []);

  const loadOverview = useCallback(() => {
    setOverviewLoading(true);
    apiFetchOverview().then((res) => {
      setOverview(res);
      setOverviewLoading(false);
    });
  }, []);

  const loadRows = useCallback(() => {
    setRowsLoading(true);
    apiFetchStockCounts({
      search,
      warehouse,
      location,
      status,
      page,
      pageSize,
      ...advancedFilters,
    }).then((res) => {
      setRows(res?.rows || []);
      setTotal(res?.total || 0);
      setRowsLoading(false);
    });
  }, [search, warehouse, location, status, page, pageSize, advancedFilters]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);
  useEffect(() => {
    loadRows();
  }, [loadRows]);
  useEffect(() => {
    apiFetchLookups().then(setLookups);
  }, []);

  // GET /stock-counts/calendar?month=&year= — real endpoint, now actually called.
  useEffect(() => {
    if (!calendarOpen) return;
    let alive = true;
    setCalendarLoading(true);
    getStockCountCalendar(
      calendarMonth.getMonth() + 1,
      calendarMonth.getFullYear(),
    )
      .then((res) => {
        if (!alive) return;
        const events = (res?.events || res || []).map((ev) => ({
          id: ev.id,
          date: ev.count_date || ev.date,
          type: ev.count_type || ev.type || "Cycle Count",
          time: ev.start_time || ev.time || "",
          location: ev.location?.name || ev.location || "-",
          location_id: ev.warehouse_location_id ?? ev.location_id,
        }));
        setCalendarEvents(events);
      })
      .catch(() => {
        if (alive) setCalendarEvents([]);
      })
      .finally(() => {
        if (alive) setCalendarLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [calendarOpen, calendarMonth]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const closeCountModal = () => {
    setNewCountOpen(false);
    setNewCountInitialForm(null);
    setEditingCountId(null);
  };

  const openNewCount = (initialForm = null) => {
    setEditingCountId(null);
    setNewCountInitialForm(initialForm);
    setNewCountOpen(true);
  };

  const openEditCount = async (row) => {
    let sc;
    try {
      sc = await getStockCount(row.id);
    } catch (err) {
      alert("Couldn't load this stock count for editing.");
      return;
    }
    if (!sc) return;
    setEditingCountId(sc.id);
    setNewCountInitialForm({
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
    setNewCountOpen(true);
  };

  const handleSave = async (form) => {
    if (editingCountId) {
      await apiUpdateStockCount(editingCountId, form);
    } else {
      await apiCreateStockCount(form);
    }
    closeCountModal();
    loadRows();
    loadOverview();
  };

  const handleExport = async (options) => {
    const params = {
      ...options,
      search,
      warehouse,
      location,
      status,
    };
    if (options.scope === "current") {
      params.page = page;
      params.per_page = pageSize;
    }

    const blob = await apiExportStockCounts(params);
    const ext = options.format === "csv" ? "csv" : "xlsx";
    const filename = `stock_counts_${options.scope || "current"}.${ext}`;
    downloadBlob(blob, filename);
  };

  const rowAction = (fn) => async (row) => {
    try {
      await fn(row);
      loadRows();
      loadOverview();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "That action couldn't be completed. Please try again.",
      );
    }
  };

  return (
    <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Stock Counts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage physical stock counts across your warehouses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDropdown onExport={handleExport} />
          <button
            onClick={() => openNewCount(null)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={15} /> New Stock Count
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={FileText}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              label="Total Stock Counts"
              value={overview?.totalStockCounts}
              footer={overview?.totalDelta}
              footerColor="text-emerald-600"
            />
            <StatCard
              icon={Clock}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              label="Pending Review"
              value={overview?.pendingReview}
              footer="View counts"
              footerColor="text-amber-600"
            />
            <StatCard
              icon={AlertTriangle}
              iconBg="bg-red-50"
              iconColor="text-red-500"
              label="Variances Found"
              value={overview?.variancesFound}
              footer="View counts"
              footerColor="text-red-500"
            />
            <StatCard
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              label="Completed Counts"
              value={overview?.completedCounts}
              footer={overview?.completedDelta}
              footerColor="text-emerald-600"
            />
          </div>

          <div className="mt-5 rounded-xl border border-gray-200 bg-white">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 p-4">
              <div className="relative w-full sm:w-72">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search stock count number..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400">
                    WAREHOUSE
                  </p>
                  <div className="relative">
                    <select
                      value={warehouse}
                      onChange={(e) => {
                        setWarehouse(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none"
                    >
                      <option value="">All Warehouses</option>
                      {(lookups?.warehouses || []).map((w) => (
                        <option key={w.value} value={w.value}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400">
                    LOCATION
                  </p>
                  <div className="relative">
                    <select
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none"
                    >
                      <option value="">All Locations</option>
                      {(lookups?.locations || []).map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400">
                    STATUS
                  </p>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none"
                    >
                      <option value="">All Statuses</option>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <SlidersHorizontal size={14} /> Filters
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500">
                    <th className="px-4 py-3">Count No.</th>
                    <th className="px-4 py-3">Warehouse</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Count Type</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Variance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Counted By</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rowsLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonRow key={i} cols={10} />
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={10}>
                        <EmptyState
                          title="No stock counts found"
                          description="Try adjusting your search or filters, or create a new stock count to get started."
                        />
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-50 text-sm hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onOpenDetails(row.id)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {row.countNo}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {row.warehouse}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {row.location}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {row.countType}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{row.items}</td>
                        <td className="px-4 py-3">
                          <VarianceCell value={row.variance} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {row.countedBy}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {row.date}
                          <br />
                          <span className="text-xs">{row.time}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 text-gray-400">
                            <Eye
                              size={16}
                              className="cursor-pointer hover:text-gray-600"
                              onClick={() => onOpenDetails(row.id)}
                            />
                            <MoreVertical
                              size={16}
                              className="cursor-pointer hover:text-gray-600"
                              onClick={(e) => {
                                setOpenMenuRowId(row.id);
                                setMenuAnchor(e.currentTarget);
                              }}
                            />
                          </div>
                          {openMenuRowId === row.id && (
                            <RowActionsMenu
                              row={row}
                              anchorEl={menuAnchor}
                              onClose={closeRowMenu}
                              onView={() => onOpenDetails(row.id)}
                              onEdit={() => openEditCount(row)}
                              onContinue={() => onOpenDetails(row.id)}
                              onDelete={rowAction((r) => {
                                if (
                                  !window.confirm(
                                    `Delete stock count ${r.countNo}? This cannot be undone.`,
                                  )
                                )
                                  return Promise.resolve();
                                return apiDeleteStockCount(r.id);
                              })}
                              onPrint={async (r) => {
                                try {
                                  const details =
                                    await apiFetchStockCountDetails(r.id);
                                  if (details)
                                    printCountSheet(
                                      details.header,
                                      details.items,
                                    );
                                } catch (err) {
                                  alert("Couldn't load this count to print.");
                                }
                              }}
                              onDuplicate={rowAction((r) =>
                                apiDuplicateStockCount(r.id),
                              )}
                              onSubmit={rowAction((r) =>
                                apiTransitionStockCount(r.id, "submit"),
                              )}
                              onCancel={rowAction((r) => {
                                if (
                                  !window.confirm(
                                    `Cancel stock count ${r.countNo}? This cannot be undone.`,
                                  )
                                )
                                  return Promise.resolve();
                                return apiTransitionStockCount(r.id, "cancel");
                              })}
                              onApprove={rowAction((r) =>
                                apiTransitionStockCount(r.id, "approve"),
                              )}
                              onReject={(r) => {
                                closeRowMenu();
                                setReasonModal({ action: "reject", row: r });
                              }}
                              onRequestRecount={(r) => {
                                closeRowMenu();
                                setReasonModal({
                                  action: "request-recount",
                                  row: r,
                                });
                              }}
                              onExportPdf={async () => {
                                try {
                                  const blob = await apiExportStockCounts({
                                    format: "xlsx",
                                    ids: [row.id],
                                  });
                                  downloadBlob(blob, `${row.countNo}.xlsx`);
                                } catch (err) {
                                  alert("Couldn't export this stock count.");
                                }
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">
                {total === 0
                  ? "Showing 0 results"
                  : `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, total)} of ${total} results`}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cx(
                        "h-8 w-8 rounded-lg text-sm font-medium",
                        page === p
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 3 && (
                  <span className="px-1 text-gray-400">...</span>
                )}
                {totalPages > 3 && (
                  <button
                    onClick={() => setPage(totalPages)}
                    className={cx(
                      "h-8 w-8 rounded-lg text-sm font-medium",
                      page === totalPages
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    {totalPages}
                  </button>
                )}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
                <div className="relative ml-2">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 focus:outline-none"
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <StockCountOverview
          overview={overview}
          loading={overviewLoading}
          onOpenCalendar={() => setCalendarOpen(true)}
        />
      </div>

      <AdvancedFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={advancedFilters}
        onApply={(f) => {
          setAdvancedFilters(f);
          setPage(1);
        }}
      />

      <NewStockCountModal
        open={newCountOpen}
        onClose={closeCountModal}
        lookups={lookups}
        initialForm={newCountInitialForm}
        isEditing={!!editingCountId}
        onSave={handleSave}
      />

      <StockCountCalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        monthDate={calendarMonth}
        onMonthChange={setCalendarMonth}
        events={calendarEvents}
        loading={calendarLoading}
        locations={lookups?.locations || []}
        onNewCount={(initialForm) => {
          setCalendarOpen(false);
          openNewCount(initialForm);
        }}
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
          const { action, row } = reasonModal;
          setReasonModal(null);
          try {
            await apiTransitionStockCount(row.id, action, { reason });
            loadRows();
            loadOverview();
          } catch (err) {
            alert(
              err?.response?.data?.message ||
                "That action couldn't be completed. Please try again.",
            );
          }
        }}
      />
    </div>
  );
}