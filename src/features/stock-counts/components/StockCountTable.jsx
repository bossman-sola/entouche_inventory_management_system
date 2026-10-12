import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
} from "lucide-react";

import { RowActionsMenu } from "./RowActionsMenu";

/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(status) {
  return String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

function formatStatus(status) {
  const normalized = normalizeStatus(status);

  const labels = {
    draft: "Draft",
    requested: "Requested",
    "in progress": "In Progress",
    submitted: "Submitted",
    "pending review": "Pending Review",
    completed: "Completed",
    approved: "Approved",
    cancelled: "Cancelled",
  };

  return labels[normalized] ?? status ?? "-";
}

function getStatusClasses(status) {
  const normalized = normalizeStatus(status);

  const classes = {
    draft: "bg-slate-100 text-slate-600",
    requested: "bg-violet-100 text-violet-700",
    "in progress": "bg-blue-50 text-blue-600",
    submitted: "bg-violet-100 text-violet-700",
    "pending review":
      "bg-amber-100 text-amber-700",
    completed:
      "bg-emerald-100 text-emerald-700",
    approved: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-600",
  };

  return (
    classes[normalized] ??
    "bg-slate-100 text-slate-600"
  );
}

function getWarehouse(count) {
  return (
    count?.warehouse?.name ??
    count?.warehouse_name ??
    count?.warehouseName ??
    "-"
  );
}

function getLocation(count) {
  return (
    count?.location?.name ??
    count?.warehouse_location?.name ??
    count?.location_name ??
    count?.locationName ??
    "-"
  );
}

function getCountType(count) {
  return (
    count?.count_type ??
    count?.type ??
    "-"
  );
}

function getItemCount(count) {
  if (Array.isArray(count?.items)) {
    return count.items.length;
  }

  return (
    count?.items_count ??
    count?.item_count ??
    0
  );
}

function getVariance(count) {
  if (
    count?.variance !== undefined &&
    count?.variance !== null
  ) {
    return Number(count.variance);
  }

  if (
    count?.variance_quantity !== undefined &&
    count?.variance_quantity !== null
  ) {
    return Number(
      count.variance_quantity,
    );
  }

  if (Array.isArray(count?.items)) {
    return count.items.reduce(
      (sum, item) =>
        sum +
        Number(
          item?.variance_quantity ?? 0,
        ),
      0,
    );
  }

  return 0;
}

function formatVariance(value) {
  const variance = Number(value) || 0;

  if (variance > 0) {
    return `+${variance} PCS`;
  }

  if (variance < 0) {
    return `${variance} PCS`;
  }

  return "0 PCS";
}

function getVarianceClass(value) {
  const variance = Number(value) || 0;

  if (variance > 0) {
    return "text-green-600";
  }

  if (variance < 0) {
    return "text-red-500";
  }

  return "text-slate-500";
}

function getCounter(count) {
  return (
    count?.assigned_counter?.name ??
    count?.counter?.name ??
    count?.counted_by_user?.name ??
    count?.countedBy?.name ??
    count?.assigned_to_user?.name ??
    count?.assigned_user?.name ??
    count?.counted_by_name ??
    "-"
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return {
      date: "-",
      time: "",
    };
  }

  /*
   * count_date is a calendar/business date.
   * Do not timezone-shift it.
   */
  const datePart =
    String(dateValue).slice(0, 10);

  const [year, month, day] =
    datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return {
      date: String(dateValue),
      time: "",
    };
  }

  const formattedDate =
    new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    ).format(
      new Date(
        year,
        month - 1,
        day,
      ),
    );

  return {
    date: formattedDate,
    time: "",
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function StockCountTable({
  stockCounts = [],
  loading = false,
  meta,
  page = 1,
  onPageChange,
  perPage = 10,
  onPerPageChange,
  onView,
  onOpenActions,
}) {
  const [openMenu, setOpenMenu] =
    useState(null);

  const currentPage =
    meta?.current_page ??
    page ??
    1;

  const lastPage =
    meta?.last_page ??
    1;

  const total =
    meta?.total ??
    stockCounts.length;

  const effectivePerPage =
    meta?.per_page ??
    perPage ??
    10;

  const from =
    meta?.from ??
    (total === 0
      ? 0
      : (currentPage - 1) *
          effectivePerPage +
        1);

  const to =
    meta?.to ??
    Math.min(
      currentPage * effectivePerPage,
      total,
    );

  /* =======================================================
     PAGE NUMBERS
  ======================================================= */

  const pageNumbers = [];

  const startPage = Math.max(
    1,
    currentPage - 1,
  );

  const endPage = Math.min(
    lastPage,
    startPage + 2,
  );

  for (
    let i = startPage;
    i <= endPage;
    i += 1
  ) {
    pageNumbers.push(i);
  }

  /* =======================================================
     ACTION MENU
  ======================================================= */

  const handleMoreClick = (
    event,
    count,
  ) => {
    event.stopPropagation();

    const rect =
      event.currentTarget.getBoundingClientRect();

    setOpenMenu((current) => {
      if (
        current?.count?.id ===
        count.id
      ) {
        return null;
      }

      return {
        count,
        anchorRect: rect,
      };
    });
  };

  const handleAction = (
    action,
    count,
  ) => {
    setOpenMenu(null);

    onOpenActions?.(
      action,
      count,
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] border-collapse">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500">
                Count No.
              </th>

              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500">
                Warehouse
              </th>

              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500">
                Location
              </th>

              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500">
                Count Type
              </th>

              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500">
                Items
              </th>

              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500">
                Variance
              </th>

              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500">
                Counted By
              </th>

              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500">
                Date
              </th>

              <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({
                length: 6,
              }).map(
                (_, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    {Array.from({
                      length: 10,
                    }).map(
                      (
                        _,
                        cellIndex,
                      ) => (
                        <td
                          key={
                            cellIndex
                          }
                          className="px-4 py-4"
                        >
                          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                        </td>
                      ),
                    )}
                  </tr>
                ),
              )
            ) : stockCounts.length ===
              0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-12 text-center text-sm text-slate-400"
                >
                  No stock counts
                  found.
                </td>
              </tr>
            ) : (
              stockCounts.map(
                (count) => {
                  const variance =
                    getVariance(
                      count,
                    );

                  const formattedDate =
                    formatDate(
                      count?.count_date ??
                        count?.scheduled_date,
                    );

                  return (
                    <tr
                      key={count.id}
                      className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/60"
                    >
                      {/* Count No */}

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            onView?.(
                              count,
                            )
                          }
                          className="text-[12px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          {count?.count_number ??
                            `SC-${count.id}`}
                        </button>
                      </td>

                      {/* Warehouse */}

                      <td className="px-4 py-4 text-[12px] text-slate-700">
                        {getWarehouse(
                          count,
                        )}
                      </td>

                      {/* Location */}

                      <td className="px-4 py-4 text-[12px] text-slate-700">
                        {getLocation(
                          count,
                        )}
                      </td>

                      {/* Count Type */}

                      <td className="px-4 py-4 text-[12px] text-slate-700">
                        {getCountType(
                          count,
                        )}
                      </td>

                      {/* Items */}

                      <td className="px-4 py-4 text-[12px] text-slate-700">
                        {getItemCount(
                          count,
                        )}
                      </td>

                      {/* Variance */}

                      <td
                        className={`px-4 py-4 text-[12px] font-semibold ${getVarianceClass(
                          variance,
                        )}`}
                      >
                        {formatVariance(
                          variance,
                        )}
                      </td>

                      {/* Status */}

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold ${getStatusClasses(
                            count?.status,
                          )}`}
                        >
                          {formatStatus(
                            count?.status,
                          )}
                        </span>
                      </td>

                      {/* Counted By */}

                      <td className="px-4 py-4 text-[12px] text-slate-700">
                        {getCounter(
                          count,
                        )}
                      </td>

                      {/* Date */}

                      <td className="px-4 py-4">
                        <p className="text-[11px] leading-[14px] text-slate-500">
                          {
                            formattedDate.date
                          }
                        </p>
                      </td>

                      {/* Actions */}

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              onView?.(
                                count,
                              )
                            }
                            className="text-slate-400 transition-colors hover:text-blue-600"
                            aria-label={`View ${
                              count?.count_number ??
                              "stock count"
                            }`}
                          >
                            <Eye
                              size={
                                15
                              }
                            />
                          </button>

                          <button
                            type="button"
                            onClick={(
                              event,
                            ) =>
                              handleMoreClick(
                                event,
                                count,
                              )
                            }
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                              openMenu
                                ?.count
                                ?.id ===
                              count.id
                                ? "bg-slate-100 text-slate-700"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                            aria-label={`More actions for ${
                              count?.count_number ??
                              "stock count"
                            }`}
                            aria-haspopup="menu"
                            aria-expanded={
                              openMenu
                                ?.count
                                ?.id ===
                              count.id
                            }
                          >
                            <MoreHorizontal
                              size={
                                16
                              }
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                },
              )
            )}
          </tbody>
        </table>
      </div>

      {/* =================================================
          FOOTER / PAGINATION
      ================================================= */}

      <div className="flex min-h-[48px] items-center justify-between gap-4 border-t border-slate-100 px-4 py-2">
        <p className="text-[11px] text-slate-500">
          Showing {from} to {to}{" "}
          of {total} results
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={
                currentPage <= 1
              }
              onClick={() =>
                onPageChange?.(
                  currentPage - 1,
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft
                size={15}
              />
            </button>

            {pageNumbers.map(
              (pageNumber) => (
                <button
                  key={
                    pageNumber
                  }
                  type="button"
                  onClick={() =>
                    onPageChange?.(
                      pageNumber,
                    )
                  }
                  className={`h-8 min-w-8 rounded-md border px-2 text-[11px] font-medium transition-colors ${
                    pageNumber ===
                    currentPage
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {
                    pageNumber
                  }
                </button>
              ),
            )}

            {lastPage >
              endPage + 1 && (
              <span className="px-1 text-[11px] text-slate-400">
                ...
              </span>
            )}

            {lastPage >
              endPage && (
              <button
                type="button"
                onClick={() =>
                  onPageChange?.(
                    lastPage,
                  )
                }
                className="h-8 min-w-8 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
              >
                {lastPage}
              </button>
            )}

            <button
              type="button"
              disabled={
                currentPage >=
                lastPage
              }
              onClick={() =>
                onPageChange?.(
                  currentPage + 1,
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight
                size={15}
              />
            </button>
          </div>

          <select
            value={
              effectivePerPage
            }
            onChange={(event) =>
              onPerPageChange?.(
                Number(
                  event.target
                    .value,
                ),
              )
            }
            className="bg-transparent text-[11px] text-slate-600 outline-none"
          >
            <option value={10}>
              10 / page
            </option>

            <option value={20}>
              20 / page
            </option>

            <option value={50}>
              50 / page
            </option>
          </select>
        </div>
      </div>

      {/* =================================================
          ROW ACTIONS MENU
      ================================================= */}

      {openMenu && (
        <RowActionsMenu
          row={openMenu.count}
          anchorRect={
            openMenu.anchorRect
          }
          onAction={
            handleAction
          }
          onClose={() =>
            setOpenMenu(null)
          }
        />
      )}
    </div>
  );
}
