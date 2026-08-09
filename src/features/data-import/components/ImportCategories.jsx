import { Icon, icons } from "../../../lib/icons";
import { REQUIRED_COLUMNS, CREATABLE_TYPES } from "../../../lib/validation";

export function ImportCategories({ itemsTotal, usersTotal, history, onNewImportClick }) {
  const lastImportOf = (type) => {
    const last = history.find(h => h.type === type && h.status === "Completed");
    return last ? `Last: ${last.date}` : "No imports yet";
  };

  const categories = [
    { title: "Items Import", type: "Items", icon: icons.fileGreen, iconColor: "text-green-500", iconBg: "bg-green-50", fields: REQUIRED_COLUMNS.Items, count: itemsTotal, countLabel: "items in system" },
    { title: "Users Import", type: "Users", icon: icons.file, iconColor: "text-purple-500", iconBg: "bg-purple-50", fields: REQUIRED_COLUMNS.Users, count: usersTotal, countLabel: "users in system", noEndpointLabel: "List only, no create" },
    { title: "Inventory Import", type: "Inventory", icon: icons.file, iconColor: "text-blue-500", iconBg: "bg-blue-50", fields: REQUIRED_COLUMNS.Inventory, count: null, countLabel: "" },
  ].map(c => ({ ...c, ready: CREATABLE_TYPES.includes(c.type) }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start items-stretch justify-between mb-4 gap-3">
        <div>
          <h2 className="font-semibold text-gray-800">Import Categories</h2>
          <p className="text-xs text-gray-500 mt-0.5">Choose the type of data you want to import.</p>
        </div>
        <button onClick={onNewImportClick} className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
          <Icon d={icons.plus} size={13} /> New Import
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map(c => (
          <div key={c.title} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
            <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center mb-3`}>
              <Icon d={c.icon} size={20} className={c.iconColor} />
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-2">{c.title}</p>
            <ul className="space-y-0.5 mb-3">
              {c.fields.map(f => (
                <li key={f} className="text-xs text-gray-500 flex items-center gap-1">
                  <Icon d="M5 13l4 4L19 7" size={11} strokeWidth={2.5} className="text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            {c.ready && c.count != null && (
              <p className="text-xs text-gray-400 mb-2">{c.count} {c.countLabel}</p>
            )}
            <div className="flex items-center justify-between flex-wrap gap-1">
              {c.ready ? (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />{c.noEndpointLabel || "No API endpoint"}
                </span>
              )}
              <span className="text-xs text-gray-400">{c.ready ? lastImportOf(c.title.split(" ")[0]) : ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}