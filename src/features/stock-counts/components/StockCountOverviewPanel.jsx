import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CirclePlus,
  Clock3,
  RefreshCw,
  Search,
} from "lucide-react";


/* =========================================================
   HELPERS
========================================================= */

function getNumber(...values) {
  const value = values.find(
    (item) =>
      item !== undefined &&
      item !== null &&
      !Number.isNaN(Number(item))
  );

  return value !== undefined
    ? Number(value)
    : 0;
}


function normalizeStatus(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}


function formatTimeAgo(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diff =
    Date.now() - date.getTime();

  const minutes =
    Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"
      } ago`;
  }

  const days =
    Math.floor(hours / 24);

  return `${days} ${days === 1 ? "day" : "days"
    } ago`;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function StockCountOverviewPanel({
  overview,
  stockCounts = [],
  loading = false,
  onViewCalendar,
  onViewAllActivity,
}) {

  /* =======================================================
     STATUS TOTALS

     The fallback property names make the component tolerant
     until the exact /overview JSON shape is confirmed.
  ======================================================= */

  const STATUS_META = {
    completed: {
      label: "Completed",
      color: "#22c55e",
      dotClass: "bg-green-500",
    },
    pending_review: {
      label: "Pending Review",
      color: "#f59e0b",
      dotClass: "bg-amber-500",
    },
    in_progress: {
      label: "In Progress",
      color: "#3b82f6",
      dotClass: "bg-blue-500",
    },
    requested: {
      label: "Requested",
      color: "#8b5cf6",
      dotClass: "bg-violet-500",
    },
    draft: {
      label: "Draft",
      color: "#94a3b8",
      dotClass: "bg-slate-400",
    },
    cancelled: {
      label: "Cancelled",
      color: "#ef4444",
      dotClass: "bg-red-500",
    },
  };

  const breakdown = Array.isArray(overview?.breakdown)
    ? overview.breakdown
    : [];

  const statusItems = breakdown.map((item) => {
    const key = String(item.label ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    const meta = STATUS_META[key] ?? {
      label: item.label ?? "Unknown",
      color: "#94a3b8",
      dotClass: "bg-slate-400",
    };

    return {
      label: meta.label,
      value: Number(item.value ?? 0),
      color: meta.color,
      dotClass: meta.dotClass,
    };
  });

  const totalStatuses =
    statusItems.reduce(
      (sum, item) =>
        sum + item.value,
      0
    );


  /* =======================================================
     DYNAMIC DONUT CHART
  ======================================================= */

  let currentPercentage = 0;

  const donutSegments = statusItems.map(
    (item) => {
      const percentage =
        totalStatuses > 0
          ? (
            item.value /
            totalStatuses
          ) * 100
          : 0;

      const start =
        currentPercentage;

      const end =
        start + percentage;

      currentPercentage = end;

      return `${item.color} ${start}% ${end}%`;
    }
  );


  const donutBackground =
    totalStatuses > 0
      ? `conic-gradient(${donutSegments.join(
        ", "
      )})`
      : "#e2e8f0";


  /* =======================================================
     COUNT TYPE TOTALS

     These are derived from the actual stock-count rows returned
     by the API. This keeps the overview panel consistent with the
     table when the /stock-counts/overview response does not include
     count-type totals.
  ======================================================= */

  const countTypeTotals = stockCounts.reduce(
    (totals, count) => {
      const type = String(count?.count_type ?? "")
        .trim()
        .toLowerCase()
        .replace(/_/g, " ");

      if (type === "cycle count") {
        totals.cycleCount += 1;
      } else if (
        type === "full physical" ||
        type === "full physical count"
      ) {
        totals.fullPhysicalCount += 1;
      } else if (type === "spot check") {
        totals.spotCheck += 1;
      } else if (type === "recount") {
        totals.recount += 1;
      }

      return totals;
    },
    {
      cycleCount: 0,
      fullPhysicalCount: 0,
      spotCheck: 0,
      recount: 0,
    }
  );

  const cycleCount = countTypeTotals.cycleCount;
  const fullPhysicalCount = countTypeTotals.fullPhysicalCount;
  const spotCheck = countTypeTotals.spotCheck;
  const recount = countTypeTotals.recount;


  const countTypes = [
    {
      label: "Cycle Count",
      value: cycleCount,
      icon: RefreshCw,
      iconClass:
        "bg-blue-50 text-blue-600",
    },
    {
      label:
        "Full Physical Count",
      value: fullPhysicalCount,
      icon: CheckCircle2,
      iconClass:
        "bg-green-50 text-green-600",
    },
    {
      label: "Spot Check",
      value: spotCheck,
      icon: Search,
      iconClass:
        "bg-amber-50 text-amber-500",
    },
    {
      label: "Recount",
      value: recount,
      icon: CircleAlert,
      iconClass:
        "bg-red-50 text-red-500",
    },
  ];


  /* =======================================================
     RECENT ACTIVITY

     This uses actual records returned by listStockCounts().
  ======================================================= */

  const recentActivities =
    [...stockCounts]
      .sort((a, b) => {
        const aDate =
          new Date(
            a?.updated_at ??
            a?.created_at ??
            0
          ).getTime();

        const bDate =
          new Date(
            b?.updated_at ??
            b?.created_at ??
            0
          ).getTime();

        return bDate - aDate;
      })
      .slice(0, 4)
      .map((count) => {
        const status =
          normalizeStatus(
            count?.status
          );

        const countNumber =
          count?.count_number ??
          `SC-${count?.id ?? ""}`;

        /*
         * Determine whether this count
         * contains a variance.
         */
        const hasVariance =
          Array.isArray(count?.items) &&
          count.items.some(
            (item) =>
              Number(
                item?.variance_quantity ??
                0
              ) !== 0
          );


        if (hasVariance) {
          return {
            id: count.id,

            title:
              "Stock Count Variance",

            description:
              `${countNumber} has variance.`,

            time: formatTimeAgo(
              count?.updated_at ??
              count?.created_at
            ),

            icon: CircleAlert,

            iconClass:
              "bg-amber-50 text-amber-500",
          };
        }


        if (
          status === "approved" ||
          status === "completed"
        ) {
          return {
            id: count.id,

            title:
              "Stock Count Completed",

            description:
              `${countNumber} has been completed.`,

            time: formatTimeAgo(
              count?.completed_at ??
              count?.approved_at ??
              count?.updated_at
            ),

            icon: CheckCircle2,

            iconClass:
              "bg-green-50 text-green-600",
          };
        }


        if (
          status ===
          "pending review" ||
          status === "submitted"
        ) {
          return {
            id: count.id,

            title:
              "Stock Count Submitted",

            description:
              `${countNumber} submitted for review.`,

            time: formatTimeAgo(
              count?.updated_at
            ),

            icon: Clock3,

            iconClass:
              "bg-blue-50 text-blue-600",
          };
        }


        return {
          id: count.id,

          title:
            "New Stock Count Created",

          description:
            `${countNumber} has been created.`,

          time: formatTimeAgo(
            count?.created_at
          ),

          icon: CirclePlus,

          iconClass:
            "bg-violet-50 text-violet-500",
        };
      });


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <aside
      className="
        hidden
        xl:block
        w-[245px]
        shrink-0
        border-l
        border-slate-200
        bg-white
        pl-5
      "
    >

      {/* =================================================
          OVERVIEW
      ================================================= */}

      <section>

        <h2
          className="
            text-[14px]
            font-bold
            text-slate-800
          "
        >
          Stock Count Overview
        </h2>


        {/* ===============================================
            DONUT CHART
        =============================================== */}

        <div
          className="
            flex
            justify-center
            py-5
          "
        >

          {loading ? (
            <div
              className="
                h-[118px]
                w-[118px]
                rounded-full
                bg-slate-100
                animate-pulse
              "
            />
          ) : (
            <div
              className="
                relative
                h-[118px]
                w-[118px]
                rounded-full
              "
              style={{
                background:
                  donutBackground,
              }}
            >

              <div
                className="
                  absolute
                  inset-[24px]
                  rounded-full
                  bg-white
                "
              />

            </div>
          )}

        </div>


        {/* ===============================================
            STATUS LEGEND
        =============================================== */}

        <div className="space-y-2">

          {statusItems.map(
            (item) => {

              const percentage =
                totalStatuses > 0
                  ? (
                    (
                      item.value /
                      totalStatuses
                    ) *
                    100
                  ).toFixed(1)
                  : "0.0";


              return (
                <div
                  key={
                    item.label
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      min-w-0
                    "
                  >

                    <span
                      className={`
                        h-2
                        w-2
                        rounded-full
                        shrink-0
                        ${item.dotClass}
                      `}
                    />


                    <span
                      className="
                        text-[12px]
                        text-slate-600
                        truncate
                      "
                    >
                      {
                        item.label
                      }
                    </span>

                  </div>


                  {loading ? (
                    <div
                      className="
                        h-3
                        w-14
                        bg-slate-100
                        rounded
                        animate-pulse
                      "
                    />
                  ) : (
                    <span
                      className="
                        text-[11px]
                        text-slate-500
                        whitespace-nowrap
                      "
                    >
                      {item.value} (
                      {percentage}%)
                    </span>
                  )}

                </div>
              );
            }
          )}

        </div>

      </section>


      <div
        className="
          my-5
          border-t
          border-slate-100
        "
      />


      {/* =================================================
          COUNT TYPES
      ================================================= */}

      <section>

        <h3
          className="
            mb-3
            text-[13px]
            font-bold
            text-slate-800
          "
        >
          Count Types
        </h3>


        <div
          className="
            divide-y
            divide-slate-100
          "
        >

          {countTypes.map(
            (item) => {

              const ItemIcon =
                item.icon;


              return (
                <div
                  key={
                    item.label
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    py-3
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      min-w-0
                    "
                  >

                    <div
                      className={`
                        h-8
                        w-8
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        shrink-0
                        ${item.iconClass}
                      `}
                    >
                      <ItemIcon
                        size={16}
                      />
                    </div>


                    <span
                      className="
                        text-[12px]
                        text-slate-600
                        truncate
                      "
                    >
                      {
                        item.label
                      }
                    </span>

                  </div>


                  {loading ? (
                    <div
                      className="
                        h-4
                        w-5
                        bg-slate-100
                        rounded
                        animate-pulse
                      "
                    />
                  ) : (
                    <span
                      className="
                        text-[13px]
                        font-bold
                        text-slate-900
                      "
                    >
                      {
                        item.value
                      }
                    </span>
                  )}

                </div>
              );
            }
          )}

        </div>

      </section>


      <div
        className="
          my-5
          border-t
          border-slate-100
        "
      />


      {/* =================================================
          RECENT ACTIVITY
      ================================================= */}

      <section>

        <div
          className="
            mb-3
            flex
            items-center
            justify-between
          "
        >

          <h3
            className="
              text-[13px]
              font-bold
              text-slate-800
            "
          >
            Recent Activity
          </h3>


          <button
            type="button"
            onClick={
              onViewAllActivity
            }
            className="
              text-[11px]
              font-medium
              text-blue-600
              hover:text-blue-700
            "
          >
            View all
          </button>

        </div>


        <div
          className="
            divide-y
            divide-slate-100
          "
        >

          {loading ? (
            <>
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="
                      flex
                      gap-3
                      py-3
                    "
                  >

                    <div
                      className="
                        h-8
                        w-8
                        rounded-lg
                        bg-slate-100
                        animate-pulse
                      "
                    />

                    <div
                      className="
                        flex-1
                        space-y-2
                      "
                    >

                      <div
                        className="
                          h-3
                          w-24
                          rounded
                          bg-slate-100
                          animate-pulse
                        "
                      />

                      <div
                        className="
                          h-2
                          w-full
                          rounded
                          bg-slate-100
                          animate-pulse
                        "
                      />

                    </div>

                  </div>
                )
              )}
            </>
          ) : recentActivities.length >
            0 ? (

            recentActivities.map(
              (activity) => {

                const ActivityIcon =
                  activity.icon;


                return (
                  <div
                    key={
                      activity.id
                    }
                    className="
                      flex
                      gap-3
                      py-3
                    "
                  >

                    <div
                      className={`
                        h-8
                        w-8
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        shrink-0
                        ${activity.iconClass}
                      `}
                    >

                      <ActivityIcon
                        size={16}
                      />

                    </div>


                    <div
                      className="
                        min-w-0
                      "
                    >

                      <p
                        className="
                          text-[11px]
                          font-semibold
                          text-slate-800
                        "
                      >
                        {
                          activity.title
                        }
                      </p>


                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          leading-[14px]
                          text-slate-500
                        "
                      >
                        {
                          activity.description
                        }
                      </p>


                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          text-slate-400
                        "
                      >
                        {
                          activity.time
                        }
                      </p>

                    </div>

                  </div>
                );
              }
            )

          ) : (

            <p
              className="
                py-4
                text-[11px]
                text-slate-400
              "
            >
              No recent stock count activity.
            </p>

          )}

        </div>

      </section>


      {/* =================================================
          CALENDAR
      ================================================= */}

      <button
        type="button"
        onClick={
          onViewCalendar
        }
        className="
          mt-4
          h-9
          w-full
          flex
          items-center
          justify-center
          gap-2
          rounded-lg
          bg-blue-50
          text-[11px]
          font-semibold
          text-blue-600
          hover:bg-blue-100
          transition-colors
        "
      >

        <CalendarDays
          size={14}
        />

        View Count Calendar

      </button>

    </aside>
  );
}