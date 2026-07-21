import { useState } from "react";
import { Icon, icons, TYPE_COLORS } from "../../../lib/icons";

const PER_PAGE = 8;

export function ImportHistoryTable({ history }) {
  const [historyFilter, setHistoryFilter] = useState("");
  const [historyPage, setHistoryPage] = useState(1);

  const filteredHistory = historyFilter ? history.filter(h => h.type === historyFilter) : history;
  const historyPages = Math.max(1, Math.ceil(filteredHistory.length / PER_PAGE));
  const visibleHistory = filteredHistory.slice((historyPage - 1) * PER_PAGE, historyPage * PER_PAGE);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center items-stretch justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-800">Import History</h2>
          <p className="text-xs text-gray-500 mt-0.5">Real imports performed this session, written to the live API.</p>
        </div>
        <div className="relative">
          <select value={historyFilter} onChange={e => { setHistoryFilter(e.target.value); setHistoryPage(1); }} className="appearance-none w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-1.5 pr-7 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">All Types</option>
            <option>Items</option>
            <option>Users</option>
          </select>
          <Icon d={icons.chevronDown} size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Date & Time", "Type", "File Name", "Rec.", "OK", "Fail", "Status", "Imported By"].map(h => (
                <th key={h} className="py-2.5 px-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleHistory.length === 0 ? (
              <tr><td colSpan={8} className="py-10 px-3 text-center text-sm text-gray-400">No imports yet this session - run one above to see it here.</td></tr>
            ) : visibleHistory.map(h => (
              <tr key={h.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-3 whitespace-nowrap">
                  <p className="text-sm font-semibold text-gray-800">{h.date}</p>
                  <p className="text-xs text-gray-400">{h.time}</p>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${TYPE_COLORS[h.type] || "bg-gray-100 text-gray-600"}`}>{h.type}</span>
                </td>
                <td className="py-3 px-3 text-sm text-gray-600 max-w-[120px]">
                  <span className="truncate block" title={h.file}>{h.file}</span>
                </td>
                <td className="py-3 px-3 text-sm text-gray-700 font-medium">{h.rec}</td>
                <td className="py-3 px-3 text-sm font-semibold text-green-600">{h.ok}</td>
                <td className="py-3 px-3 text-sm font-semibold text-red-500">{h.fail || 0}</td>
                <td className="py-3 px-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${h.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{h.status}</span>
                </td>
                <td className="py-3 px-3 text-sm text-gray-600 whitespace-nowrap">{h.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-500 text-center sm:text-left">Showing {filteredHistory.length === 0 ? 0 : (historyPage - 1) * PER_PAGE + 1} to {Math.min(historyPage * PER_PAGE, filteredHistory.length)} of {filteredHistory.length} imports</p>
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">
            <Icon d={icons.chevronLeft} size={13} />
          </button>
          {Array.from({ length: historyPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setHistoryPage(n)} className={`w-7 h-7 text-sm rounded ${historyPage === n ? "bg-blue-600 text-white" : "border border-gray-200 hover:bg-gray-100 text-gray-700"}`}>{n}</button>
          ))}
          <button onClick={() => setHistoryPage(p => Math.min(historyPages, p + 1))} disabled={historyPage === historyPages} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-40">
            <Icon d={icons.chevronRight} size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}