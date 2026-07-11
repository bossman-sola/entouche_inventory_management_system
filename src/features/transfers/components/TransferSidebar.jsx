import { Icon, icons } from "./icons.jsx";

export default function TransferSidebar({ transfers, pendingCount, totalQty, onNewTransfer }) {
  return (
    <div className="w-full lg:w-72 shrink-0 space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button onClick={onNewTransfer} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 border border-dashed border-blue-300 text-blue-600 transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Icon d={icons.plus} size={13} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">New Transfer</p>
              <p className="text-xs text-blue-400">Create a new inventory transfer</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 border border-gray-200 transition-colors group">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <Icon d={icons.clock} size={13} className="text-orange-500" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-800">Pending Transfers</p>
                <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{pendingCount}</span>
              </div>
              <p className="text-xs text-gray-400">View drafts &amp; awaiting approval</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Icon d={icons.template} size={13} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Transfer Templates</p>
              <p className="text-xs text-gray-400">Manage transfer templates</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Transfer Summary</h3>
        <div className="space-y-3">
          {[
            { label: "Total Transfers", value: String(transfers.length) },
            { label: "Quantity Transferred", value: totalQty.toLocaleString() },
            { label: "Pending Transfers", value: pendingCount, valueClass: "text-orange-500" },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-600">{s.label}</span>
              <span className={`text-sm font-semibold ${s.valueClass || "text-gray-900"}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon d={icons.book} size={15} className="text-blue-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Help &amp; Guidelines</h3>
        </div>
        <p className="text-xs font-medium text-gray-700 mb-1">Learn how transfers work</p>
        <p className="text-xs text-gray-500 mb-3">A transfer moves items between locations: draft → submit → approve → complete (stock moves on complete).</p>
      </div>
    </div>
  );
}