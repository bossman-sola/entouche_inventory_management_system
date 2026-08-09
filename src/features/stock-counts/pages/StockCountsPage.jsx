import { useState } from "react";

import { Icon } from "../components/icon.jsx";
import { icons } from "../components/icon.js";
import NewStockCountModal from "../components/NewStockCountModal.jsx";
import { useStockCounts } from "../hooks/useStockCounts.js";
import StockCountOverviewPanel from "../components/StockCountOverviewPanel.jsx";
import StockCountFilters from "../components/StockCountFilters.jsx";
import StockCountTable from "../components/StockCountTable.jsx";
import AdvancedStockCountFilters from "../components/AdvancedStockCountFilters.jsx";
import * as StockCountApi from "../api/StockCountApi.js";

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
    label,
    value,
    sub,
    subColor,
    icon,
    iconClass,
    loading,
}) => {
    return (
        <div
            className="
        bg-white
        border border-gray-200
        rounded-xl
        px-4 py-4
        min-h-[112px]
      "
        >
            {/* Icon */}
            <div
                className={`
          w-8 h-8
          rounded-lg
          flex items-center justify-center
          mb-3
          ${iconClass}
        `}
            >
                <Icon
                    d={icon}
                    size={17}
                    strokeWidth={1.8}
                />
            </div>

            {/* Label */}
            <p
                className="
          text-[12px]
          leading-[16px]
          font-medium
          text-slate-500
          mb-1
        "
            >
                {label}
            </p>

            {/* Value */}
            {loading ? (
                <div
                    className="
            h-7
            w-12
            bg-gray-100
            rounded
            animate-pulse
            mb-1
          "
                />
            ) : (
                <p
                    className="
            text-[22px]
            leading-[26px]
            font-bold
            text-slate-900
            mb-1
          "
                >
                    {value}
                </p>
            )}

            {/* Bottom text */}
            <p
                className={`
          text-[11px]
          leading-[15px]
          font-medium
          ${subColor}
        `}
            >
                {sub}
            </p>
        </div>
    );
};


/* =========================================================
   HELPER
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


/* =========================================================
   STOCK COUNTS PAGE
========================================================= */

export default function StockCountsPage() {
    const [modalOpen, setModalOpen] = useState(false);

    const {
        stockCounts = [],
        meta,
        overview,
        lookups,
        loading,
        error,
        reload,
    } = useStockCounts();

    const [search, setSearch] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");


    /* =======================================================
       LOOKUPS FOR MODAL
    ======================================================= */

    const warehouses =
        lookups?.warehouses ?? [];

    const locations =
        lookups?.locations ??
        lookups?.warehouse_locations ??
        [];

    const users =
        lookups?.users ??
        lookups?.counters ??
        [];

    const warehouseOptions = warehouses.map((warehouse) => ({
        value: String(warehouse.id),
        label: warehouse.name,
    }));

    const locationOptions = locations
        .filter((location) => {
            if (!warehouseFilter) {
                return true;
            }

            const warehouseId =
                location.warehouse_id ??
                location.warehouseId ??
                location.warehouse?.id;

            return (
                String(warehouseId) ===
                String(warehouseFilter)
            );
        })
        .map((location) => ({
            value: String(location.id),
            label: location.name,
        }));

    const statusOptions = [
        {
            value: "draft",
            label: "Draft",
        },
        {
            value: "in_progress",
            label: "In Progress",
        },
        {
            value: "completed",
            label: "Completed",
        },
        {
            value: "approved",
            label: "Approved",
        },
        {
            value: "cancelled",
            label: "Cancelled",
        },
    ];

    /* =======================================================
       SUMMARY CARD VALUES
    ======================================================= */

    /*
     * Total should come from the server/pagination metadata,
     * not stockCounts.length because stockCounts may only
     * contain the current page.
     */
    const totalStockCounts = getNumber(
        overview?.total_stock_counts,
        overview?.total,
        meta?.total,
        stockCounts.length
    );


    /*
     * Submitted counts move to "completed" before approval,
     * so completed can represent counts waiting for review
     * depending on the overview response from the backend.
     */
    const pendingReview = getNumber(
        overview?.pending_review,
        overview?.pending_review_count,
        overview?.completed_pending_approval,
        overview?.completed
    );


    const variancesFound = getNumber(
        overview?.variances_found,
        overview?.variance_count,
        overview?.counts_with_variance,
        overview?.total_variances
    );


    /*
     * Once approved, the stock count workflow is finished.
     * Prefer approved count if supplied by the overview API.
     */
    const completedCounts = getNumber(
        overview?.approved,
        overview?.approved_count,
        overview?.completed_counts
    );


    /* =======================================================
       MONTHLY CARD SUBTEXT
    ======================================================= */

    const totalThisMonth = getNumber(
        overview?.created_this_month,
        overview?.this_month,
        overview?.total_this_month
    );

    const completedThisMonth = getNumber(
        overview?.approved_this_month,
        overview?.completed_this_month
    );

    /* =======================================================
         ADVANCED FILTERS
     ======================================================= */
    const [advancedFiltersOpen, setAdvancedFiltersOpen] =
        useState(false);

    const [advancedFilters, setAdvancedFilters] = useState({
        statuses: [],
        countTypes: [],
        variance: "",
        startDate: "",
        endDate: "",
    });

    const [exporting, setExporting] = useState(false);

    /* =======================================================
       EXPORT HANDLER
    ======================================================= */

    async function handleExport() {
        if (!stockCounts.length || exporting) {
            return;
        }

        try {
            setExporting(true);

            const ids = stockCounts.map(
                (count) => count.id
            );

            const blob =
                await StockCountApi.exportStockCounts({
                    format: "xlsx",
                    ids,
                });

            const url =
                window.URL.createObjectURL(blob);

            const anchor =
                document.createElement("a");

            anchor.href = url;

            anchor.download =
                `stock-counts-${new Date()
                    .toISOString()
                    .slice(0, 10)}.xlsx`;

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error(
                "Failed to export stock counts:",
                err
            );
        } finally {
            setExporting(false);
        }
    }

    /* =======================================================
       RENDER
    ======================================================= */

    return (
        <>
            <div className="flex w-full min-h-full gap-4">

                {/* Main Content */}
                <main className="flex-1 min-w-0">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Stock Counts
                            </h1>

                            <p className="text-xs text-slate-500 mt-0.5">
                                Create and manage physical stock counts across your warehouses.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={exporting || stockCounts.length === 0}
                                className="
    h-9
    px-4
    flex
    items-center
    justify-center
    gap-2
    bg-white
    border
    border-gray-200
    rounded-lg
    text-xs
    font-medium
    text-slate-700
    hover:bg-gray-50
    transition-colors
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
                            >
                                <Icon
                                    d={icons.download}
                                    size={14}
                                />

                                {exporting
                                    ? "Exporting..."
                                    : "Export"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setModalOpen(true)}
                                className="
                h-9 px-4
                flex items-center justify-center gap-2
                bg-blue-600
                hover:bg-blue-700
                text-white
                rounded-lg
                text-xs
                font-semibold
                transition-colors
                whitespace-nowrap
              "
                            >
                                <Icon
                                    d={icons.plus}
                                    size={14}
                                    strokeWidth={2}
                                />

                                New Stock Count
                            </button>
                        </div>
                    </div>


                    {/* Summary Cards */}
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                        <StatCard
                            label="Total Stock Counts"
                            value={totalStockCounts}
                            sub={
                                totalThisMonth > 0
                                    ? `+ ${totalThisMonth} this month`
                                    : "All time"
                            }
                            subColor="text-blue-600"
                            icon={icons.stockCount}
                            iconClass="bg-blue-50 text-blue-600"
                            loading={loading}
                        />

                        <StatCard
                            label="Pending Review"
                            value={pendingReview}
                            sub="View counts"
                            subColor="text-amber-500"
                            icon={icons.clock}
                            iconClass="bg-amber-50 text-amber-500"
                            loading={loading}
                        />

                        <StatCard
                            label="Variances Found"
                            value={variancesFound}
                            sub="View counts"
                            subColor="text-red-500"
                            icon={icons.warning}
                            iconClass="bg-red-50 text-red-500"
                            loading={loading}
                        />

                        <StatCard
                            label="Completed Counts"
                            value={completedCounts}
                            sub={
                                completedThisMonth > 0
                                    ? `+ ${completedThisMonth} this month`
                                    : "All time"
                            }
                            subColor="text-green-600"
                            icon={icons.checkCircle}
                            iconClass="bg-green-50 text-green-600"
                            loading={loading}
                        />
                    </div>


                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Search / filters / table later */}

                    <StockCountFilters
                        search={search}
                        onSearchChange={setSearch}

                        warehouse={warehouseFilter}
                        onWarehouseChange={(value) => {
                            setWarehouseFilter(value);
                            setLocationFilter("");
                        }}
                        warehouseOptions={warehouseOptions}

                        location={locationFilter}
                        onLocationChange={setLocationFilter}
                        locationOptions={locationOptions}

                        status={statusFilter}
                        onStatusChange={setStatusFilter}
                        statusOptions={statusOptions}

                        onOpenFilters={() => {
                            setAdvancedFiltersOpen(true);

                        }}
                    />

                    <StockCountTable
                        stockCounts={stockCounts}
                        meta={meta}
                        loading={loading}

                        page={meta?.current_page ?? 1}

                        onPageChange={(newPage) => {
                            reload({
                                page: newPage,
                                search: search || undefined,
                                warehouse_id:
                                    warehouseFilter || undefined,
                                warehouse_location_id:
                                    locationFilter || undefined,
                                status:
                                    statusFilter || undefined,
                            });
                        }}

                        perPage={meta?.per_page ?? 10}

                        onPerPageChange={(newPerPage) => {
                            reload({
                                page: 1,
                                per_page: newPerPage,
                                search: search || undefined,
                                warehouse_id:
                                    warehouseFilter || undefined,
                                warehouse_location_id:
                                    locationFilter || undefined,
                                status:
                                    statusFilter || undefined,
                            });
                        }}

                        onView={(count) => {
                            console.log(
                                "View stock count:",
                                count
                            );
                        }}

                        onOpenActions={(count) => {
                            console.log(
                                "Open actions:",
                                count
                            );
                        }}
                    />

                </main>

                {/* Right Side Panel */}
                <StockCountOverviewPanel
                    overview={overview}
                    stockCounts={stockCounts}
                    loading={loading}
                    onViewCalendar={() => {
                        console.log("Open stock count calendar");
                    }}
                    onViewAllActivity={() => {
                        console.log("View all stock count activity");
                    }}
                />

            </div>

            <AdvancedStockCountFilters
                open={advancedFiltersOpen}

                onClose={() =>
                    setAdvancedFiltersOpen(false)
                }

                filters={advancedFilters}

                onApply={(filters) => {
                    setAdvancedFilters(filters);

                    reload({
                        page: 1,

                        search:
                            search || undefined,

                        warehouse_id:
                            warehouseFilter || undefined,

                        warehouse_location_id:
                            locationFilter || undefined,

                        status:
                            statusFilter || undefined,

                        statuses:
                            filters.statuses.length
                                ? filters.statuses
                                : undefined,

                        count_types:
                            filters.countTypes.length
                                ? filters.countTypes
                                : undefined,

                        variance:
                            filters.variance || undefined,

                        start_date:
                            filters.startDate || undefined,

                        end_date:
                            filters.endDate || undefined,
                    });
                }}

                onReset={() => {
                    const resetFilters = {
                        statuses: [],
                        countTypes: [],
                        variance: "",
                        startDate: "",
                        endDate: "",
                    };

                    setAdvancedFilters(resetFilters);

                    reload({
                        page: 1,

                        search:
                            search || undefined,

                        warehouse_id:
                            warehouseFilter || undefined,

                        warehouse_location_id:
                            locationFilter || undefined,

                        status:
                            statusFilter || undefined,
                    });
                }}
            />

            <NewStockCountModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={() => {
                    setModalOpen(false);
                    reload();
                }}
                warehouses={warehouses}
                warehousesLoading={loading}
                locations={locations}
                locationsLoading={loading}
                users={users}
                usersLoading={loading}
            />
        </>
    );

}