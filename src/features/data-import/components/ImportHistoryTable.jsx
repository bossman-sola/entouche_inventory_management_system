import { Icon, icons, TYPE_COLORS } from "../../../lib/icons";

const PER_PAGE_OPTIONS = [8, 12, 20];

export function ImportHistoryTable({
  history,
  meta,
  loading,
  error,
  page,
  onPageChange,
  perPage,
  onPerPageChange,
  filter,
  onFilterChange,
}) {
  const totalRecords = meta?.total ?? history.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / (perPage || 8)));
  const startRecord = totalRecords === 0 ? 0 : (page - 1) * (perPage || 8) + 1;
  const endRecord = Math.min(page * (perPage || 8), totalRecords);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center items-stretch justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-800">Import History</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Import records loaded from the live API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => onFilterChange?.(e.target.value)}
              className="appearance-none w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Types</option>
              <option value="Items">Items</option>
              <option value="Inventory">Inventory</option>
              <option value="Users">Users</option>
            </select>

            <Icon
              d={icons.chevronDown}
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={perPage}
              onChange={(e) => {
                onPerPageChange?.(Number(e.target.value));
                onPageChange?.(1);
              }}
              className="appearance-none border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}/page
                </option>
              ))}
            </select>
            <Icon
              d={icons.chevronDown}
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Date & Time",
                "Type",
                "File Name",
                "Rec.",
                "OK",
                "Fail",
                "Imported By",
              ].map((h) => (
                <th
                  key={h}
                  className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 px-3 text-center text-sm text-gray-400">
                  Loading imports...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 px-3 text-center text-sm text-gray-400">
                  No imports found.
                </td>
              </tr>
            ) : (
              history.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 px-3 whitespace-nowrap">
                    <p className="text-sm font-semibold text-gray-800">{h.date}</p>
                    <p className="text-xs text-gray-400">{h.time}</p>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                        TYPE_COLORS[h.type] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {h.type}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-sm text-gray-600 max-w-[120px]">
                    <span className="truncate block" title={h.file}>
                      {h.file}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-sm text-gray-700 font-medium">
                    {h.rec}
                  </td>

                  <td className="py-3 px-3 text-sm font-semibold text-green-600">
                    {h.ok}
                  </td>

                  <td className="py-3 px-3 text-sm font-semibold text-red-500">
                    {h.fail || 0}
                  </td>

                  <td className="py-3 px-3 text-sm text-gray-600 whitespace-nowrap">
                    {h.by}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-500 text-center sm:text-left">
          {totalRecords === 0 ? (
            "No imports"
          ) : (
            `Showing ${startRecord} to ${endRecord} of ${totalRecords} imports`
          )}
        </p>

        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40"
          >
            <Icon d={icons.chevronLeft} size={13} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => onPageChange?.(n)}
              className={`w-7 h-7 text-sm rounded ${
                page === n
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 hover:bg-gray-100 text-gray-700"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40"
          >
            <Icon d={icons.chevronRight} size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}