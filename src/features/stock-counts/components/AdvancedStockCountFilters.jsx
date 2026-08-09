import { useState } from "react";
import {
    ArrowRight,
    CalendarDays,
    X,
} from "lucide-react";

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "pending_review", label: "Pending Review" },
    { value: "approved", label: "Approved" },
    { value: "completed", label: "Completed" },
];

const COUNT_TYPE_OPTIONS = [
    { value: "Cycle Count", label: "Cycle Count" },
    { value: "Spot Check", label: "Spot Check" },
    { value: "Full Physical", label: "Full Physical" },
    { value: "Recount", label: "Recount" },
];

export default function AdvancedStockCountFilters({
    open,
    onClose,
    filters,
    onApply,
    onReset,
}) {
    if (!open) return null;

    return (
        <AdvancedStockCountFiltersContent
            onClose={onClose}
            filters={filters}
            onApply={onApply}
            onReset={onReset}
        />
    );
}

function AdvancedStockCountFiltersContent({
    onClose,
    filters,
    onApply,
    onReset,
}) {
    const [statuses, setStatuses] = useState(
        filters?.statuses ?? []
    );

    const [countTypes, setCountTypes] = useState(
        filters?.countTypes ?? []
    );

    const [variance, setVariance] = useState(
        filters?.variance ?? ""
    );

    const [startDate, setStartDate] = useState(
        filters?.startDate ?? ""
    );

    const [endDate, setEndDate] = useState(
        filters?.endDate ?? ""
    );

    function toggleStatus(value) {
        setStatuses((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
        );
    }

    function toggleCountType(value) {
        setCountTypes((current) =>
            current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value]
        );
    }

    function handleReset() {
        setStatuses([]);
        setCountTypes([]);
        setVariance("");
        setStartDate("");
        setEndDate("");

        onReset?.();
    }

    function handleApply() {
        onApply?.({
            statuses,
            countTypes,
            variance,
            startDate,
            endDate,
        });

        onClose?.();
    }

    return (
        <div
            className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/45
      p-4
    "
        >
            <div
                className="
        w-full
        max-w-[440px]

        max-h-[86vh]
        overflow-hidden

        rounded-2xl
        bg-white
        shadow-2xl
      "
            >
                {/* Header */}
                <div
                    className="
          flex
          items-center
          justify-between
          border-b
          border-slate-100
          px-6
          py-5
        "
                >
                    <h2 className="text-[20px] font-bold text-slate-800">
                        Advanced Filters
                    </h2>

                   <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-slate-400
            hover:bg-slate-50
            hover:text-slate-600
          "
        >
          <X size={20} />
        </button>
                </div>

                {/* Body */}
                <div className="
              max-h-[65vh]
          overflow-y-auto
          px-6
          py-5">

                    {/* Status */}
                    <section>
                        <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wide text-slate-700">
                            Status
                        </h3>

                        <div className="space-y-3">
                            {STATUS_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex cursor-pointer items-center gap-3"
                                >
                                    <input
                                        type="checkbox"
                                        checked={statuses.includes(option.value)}
                                        onChange={() => toggleStatus(option.value)}
                                        className="
                      h-5
                      w-5
                      rounded
                      border-slate-300
                      accent-blue-600
                    "
                                    />

                                    <span className="text-[16px] text-slate-700">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>

                    <div className="my-6 border-t border-slate-100" />

                    {/* Count Type */}
                    <section>
                        <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wide text-slate-700">
                            Count Type
                        </h3>

                        <div className="space-y-3">
                            {COUNT_TYPE_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex cursor-pointer items-center gap-3"
                                >
                                    <input
                                        type="checkbox"
                                        checked={countTypes.includes(option.value)}
                                        onChange={() => toggleCountType(option.value)}
                                        className="
                      h-5
                      w-5
                      rounded
                      border-slate-300
                      accent-blue-600
                    "
                                    />

                                    <span className="text-[16px] text-slate-700">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>

                    <div className="my-6 border-t border-slate-100" />

                    {/* Variance */}
                    <section>
                        <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wide text-slate-700">
                            Variance
                        </h3>

                        <div className="space-y-3">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="radio"
                                    name="variance"
                                    value="matches"
                                    checked={variance === "matches"}
                                    onChange={(e) => setVariance(e.target.value)}
                                    className="h-5 w-5 accent-blue-600"
                                />

                                <span className="text-[16px] text-slate-700">
                                    Matches Only
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="radio"
                                    name="variance"
                                    value="variance"
                                    checked={variance === "variance"}
                                    onChange={(e) => setVariance(e.target.value)}
                                    className="h-5 w-5 accent-blue-600"
                                />

                                <span className="text-[16px] text-slate-700">
                                    Variance Only
                                </span>
                            </label>
                        </div>
                    </section>

                    <div className="my-6 border-t border-slate-100" />

                    {/* Date Range */}
                    <section>
                        <h3 className="mb-4 text-[14px] font-bold uppercase tracking-wide text-slate-700">
                            Date Range
                        </h3>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">

                            <div className="relative">
                                <CalendarDays
                                    size={17}
                                    className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                                />

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-10
                    pr-3
                    text-[13px]
                    text-slate-700
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                                />
                            </div>

                            <ArrowRight
                                size={18}
                                className="text-slate-400"
                            />

                            <div className="relative">
                                <CalendarDays
                                    size={17}
                                    className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                                />

                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-10
                    pr-3
                    text-[13px]
                    text-slate-700
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  "
                                />
                            </div>
                        </div>
                    </section>
                </div>

               {/* Footer */}
      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-slate-100
          px-6
          py-4
        "
      >
        <button
          type="button"
          onClick={handleReset}
          className="
            h-10
            rounded-xl
            border
            border-slate-200
            bg-white
            px-6
            text-[14px]
            font-semibold
            text-slate-700
            hover:bg-slate-50
          "
        >
          Reset
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="
            h-10
            rounded-xl
            bg-blue-600
            px-9
            text-[14px]
            font-semibold
            text-white
            hover:bg-blue-700
          "
        >
          Apply
        </button>
      </div>
    </div>
  </div>
    );
}