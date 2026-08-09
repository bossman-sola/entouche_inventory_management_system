import {
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
} from "lucide-react";


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
    "in progress": "In Progress",
    completed: "Completed",
    approved: "Approved",
    cancelled: "Cancelled",
    submitted: "Submitted",
    "pending review": "Pending Review",
  };

  return labels[normalized] ?? status ?? "-";
}


function getStatusClasses(status) {
  const normalized = normalizeStatus(status);

  const classes = {
    draft:
      "bg-slate-100 text-slate-600",

    "in progress":
      "bg-blue-50 text-blue-600",

    submitted:
      "bg-violet-100 text-violet-700",

    "pending review":
      "bg-amber-100 text-amber-700",

    completed:
      "bg-emerald-100 text-emerald-700",

    approved:
      "bg-blue-100 text-blue-700",

    cancelled:
      "bg-red-100 text-red-600",
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
      count.variance_quantity
    );
  }

  if (
    Array.isArray(count?.items)
  ) {
    return count.items.reduce(
      (sum, item) =>
        sum +
        Number(
          item?.variance_quantity ?? 0
        ),
      0
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

  const parsed =
    new Date(dateValue);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return {
      date: dateValue,
      time: "",
    };
  }

  return {
    date:
      parsed.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      ),

    time:
      parsed.toLocaleTimeString(
        "en-US",
        {
          hour: "numeric",
          minute: "2-digit",
        }
      ),
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
    (
      total === 0
        ? 0
        : (
            currentPage - 1
          ) *
            effectivePerPage +
          1
    );

  const to =
    meta?.to ??
    Math.min(
      currentPage *
        effectivePerPage,
      total
    );


  /* =======================================================
     PAGE NUMBERS
  ======================================================= */

  const pageNumbers = [];

  const startPage =
    Math.max(
      1,
      currentPage - 1
    );

  const endPage =
    Math.min(
      lastPage,
      startPage + 2
    );

  for (
    let i = startPage;
    i <= endPage;
    i += 1
  ) {
    pageNumbers.push(i);
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        mt-3
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
      "
    >

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-x-auto">

        <table
          className="
            w-full
            min-w-[1150px]
            border-collapse
          "
        >

          {/* ===============================================
              HEADER
          =============================================== */}

          <thead
            className="
              bg-slate-50
              border-b
              border-slate-200
            "
          >
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


          {/* ===============================================
              BODY
          =============================================== */}

          <tbody>

            {loading ? (

              Array.from({
                length: 6,
              }).map((_, index) => (

                <tr
                  key={index}
                  className="
                    border-b
                    border-slate-100
                    last:border-b-0
                  "
                >
                  {Array.from({
                    length: 10,
                  }).map(
                    (_, cellIndex) => (
                      <td
                        key={
                          cellIndex
                        }
                        className="
                          px-4
                          py-4
                        "
                      >
                        <div
                          className="
                            h-3
                            w-20
                            animate-pulse
                            rounded
                            bg-slate-100
                          "
                        />
                      </td>
                    )
                  )}
                </tr>

              ))

            ) : stockCounts.length === 0 ? (

              <tr>
                <td
                  colSpan={10}
                  className="
                    px-4
                    py-12
                    text-center
                    text-sm
                    text-slate-400
                  "
                >
                  No stock counts found.
                </td>
              </tr>

            ) : (

              stockCounts.map(
                (count) => {

                  const variance =
                    getVariance(
                      count
                    );

                  const formattedDate =
                    formatDate(
                      count?.count_date ??
                      count?.scheduled_date ??
                      count?.created_at
                    );

                  return (
                    <tr
                      key={count.id}
                      className="
                        border-b
                        border-slate-100
                        last:border-b-0
                        hover:bg-slate-50/60
                        transition-colors
                      "
                    >

                      {/* Count No */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            onView?.(
                              count
                            )
                          }
                          className="
                            text-[12px]
                            font-semibold
                            text-blue-600
                            hover:text-blue-700
                          "
                        >
                          {count?.count_number ??
                            `SC-${count.id}`}
                        </button>
                      </td>


                      {/* Warehouse */}
                      <td
                        className="
                          px-4
                          py-4
                          text-[12px]
                          text-slate-700
                        "
                      >
                        {getWarehouse(
                          count
                        )}
                      </td>


                      {/* Location */}
                      <td
                        className="
                          px-4
                          py-4
                          text-[12px]
                          text-slate-700
                        "
                      >
                        {getLocation(
                          count
                        )}
                      </td>


                      {/* Count Type */}
                      <td
                        className="
                          px-4
                          py-4
                          text-[12px]
                          text-slate-700
                        "
                      >
                        {getCountType(
                          count
                        )}
                      </td>


                      {/* Items */}
                      <td
                        className="
                          px-4
                          py-4
                          text-[12px]
                          text-slate-700
                        "
                      >
                        {getItemCount(
                          count
                        )}
                      </td>


                      {/* Variance */}
                      <td
                        className={`
                          px-4
                          py-4
                          text-[12px]
                          font-semibold
                          ${getVarianceClass(
                            variance
                          )}
                        `}
                      >
                        {formatVariance(
                          variance
                        )}
                      </td>


                      {/* Status */}
                      <td className="px-4 py-4">

                        <span
                          className={`
                            inline-flex
                            items-center
                            rounded-full
                            px-3
                            py-1
                            text-[10px]
                            font-semibold
                            whitespace-nowrap
                            ${getStatusClasses(
                              count?.status
                            )}
                          `}
                        >
                          {formatStatus(
                            count?.status
                          )}
                        </span>

                      </td>


                      {/* Counted By */}
                      <td
                        className="
                          px-4
                          py-4
                          text-[12px]
                          text-slate-700
                        "
                      >
                        {getCounter(
                          count
                        )}
                      </td>


                      {/* Date */}
                      <td
                        className="
                          px-4
                          py-4
                        "
                      >
                        <p
                          className="
                            text-[11px]
                            leading-[14px]
                            text-slate-500
                          "
                        >
                          {
                            formattedDate.date
                          }
                        </p>

                        {formattedDate.time && (
                          <p
                            className="
                              text-[10px]
                              leading-[13px]
                              text-slate-400
                            "
                          >
                            {
                              formattedDate.time
                            }
                          </p>
                        )}
                      </td>


                      {/* Actions */}
                      <td className="px-4 py-4">

                        <div
                          className="
                            flex
                            items-center
                            justify-center
                            gap-3
                          "
                        >

                          <button
                            type="button"
                            onClick={() =>
                              onView?.(
                                count
                              )
                            }
                            className="
                              text-slate-400
                              hover:text-blue-600
                              transition-colors
                            "
                            aria-label="View stock count"
                          >
                            <Eye
                              size={15}
                            />
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              onOpenActions?.(
                                count
                              )
                            }
                            className="
                              text-slate-400
                              hover:text-slate-700
                              transition-colors
                            "
                            aria-label="More actions"
                          >
                            <MoreHorizontal
                              size={16}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )

            )}

          </tbody>
        </table>

      </div>


      {/* =================================================
          FOOTER / PAGINATION
      ================================================= */}

      <div
        className="
          min-h-[48px]
          flex
          items-center
          justify-between
          gap-4
          border-t
          border-slate-100
          px-4
          py-2
        "
      >

        {/* Result count */}
        <p
          className="
            text-[11px]
            text-slate-500
          "
        >
          Showing {from} to {to} of{" "}
          {total} results
        </p>


        {/* Pagination */}
        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              items-center
              gap-1
            "
          >

            {/* Previous */}
            <button
              type="button"
              disabled={
                currentPage <= 1
              }
              onClick={() =>
                onPageChange?.(
                  currentPage - 1
                )
              }
              className="
                h-8
                w-8
                flex
                items-center
                justify-center
                rounded-md
                border
                border-slate-200
                bg-white
                text-slate-500

                hover:bg-slate-50

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronLeft
                size={15}
              />
            </button>


            {/* Pages */}
            {pageNumbers.map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() =>
                    onPageChange?.(
                      pageNumber
                    )
                  }
                  className={`
                    h-8
                    min-w-8
                    rounded-md
                    border
                    px-2
                    text-[11px]
                    font-medium
                    transition-colors

                    ${
                      pageNumber ===
                      currentPage
                        ? `
                          border-blue-600
                          bg-blue-600
                          text-white
                        `
                        : `
                          border-slate-200
                          bg-white
                          text-slate-600
                          hover:bg-slate-50
                        `
                    }
                  `}
                >
                  {pageNumber}
                </button>
              )
            )}


            {/* Ellipsis */}
            {lastPage >
              endPage + 1 && (
              <span
                className="
                  px-1
                  text-[11px]
                  text-slate-400
                "
              >
                ...
              </span>
            )}


            {/* Last page */}
            {lastPage >
              endPage && (
              <button
                type="button"
                onClick={() =>
                  onPageChange?.(
                    lastPage
                  )
                }
                className="
                  h-8
                  min-w-8
                  rounded-md
                  border
                  border-slate-200
                  bg-white
                  px-2
                  text-[11px]
                  font-medium
                  text-slate-600
                  hover:bg-slate-50
                "
              >
                {lastPage}
              </button>
            )}


            {/* Next */}
            <button
              type="button"
              disabled={
                currentPage >=
                lastPage
              }
              onClick={() =>
                onPageChange?.(
                  currentPage + 1
                )
              }
              className="
                h-8
                w-8
                flex
                items-center
                justify-center
                rounded-md
                border
                border-slate-200
                bg-white
                text-slate-500

                hover:bg-slate-50

                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronRight
                size={15}
              />
            </button>

          </div>


          {/* Rows per page */}
          <select
            value={
              effectivePerPage
            }
            onChange={(e) =>
              onPerPageChange?.(
                Number(
                  e.target.value
                )
              )
            }
            className="
              bg-transparent
              text-[11px]
              text-slate-600
              outline-none
            "
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

    </div>
  );
}