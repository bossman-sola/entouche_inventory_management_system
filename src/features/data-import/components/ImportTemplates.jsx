import { Icon, icons } from "../../../lib/icons";

function downloadTemplate(name) {
  const csvContent = name === "Items Template"
    ? "Item Name,Category,Unit of Measure,Barcode,SKU,Brand,Unit Cost,Selling Price,Reorder Level,Status\nWireless Mouse,Computer Accessories,Piece (PCS),8901234567890,,Logitech,10,15,10,Active"
    : name === "Users Template"
      ? "Name,Email,Role\nJohn Doe,john@example.com,Inventory Officer"
      : "Item,Quantity,Location,Cost\nSample Item,100,Storage Area,5000";
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name.replace(" ", "_") + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

const TEMPLATES = [
  { name: "Items Template", sub: "XLSX, CSV", icon: icons.fileGreen, bg: "bg-green-50", color: "text-green-500" },
  { name: "Users Template", sub: "XLSX, CSV", icon: icons.file, bg: "bg-purple-50", color: "text-purple-500" },
  { name: "Inventory Template", sub: "XLSX, CSV", icon: icons.file, bg: "bg-blue-50", color: "text-blue-500" },
];

export function ImportTemplates() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
      <h2 className="font-semibold text-gray-800 mb-1">Import Templates</h2>
      <p className="text-xs text-gray-500 mb-4">Download templates to ensure your data is formatted correctly.</p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {TEMPLATES.map(t => (
          <button key={t.name} onClick={() => downloadTemplate(t.name)}
            className="flex flex-col items-center gap-2 p-2.5 sm:p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${t.bg} flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}>
              <Icon d={t.icon} size={20} className={t.color} />
            </div>
            <p className="text-xs font-semibold text-gray-800 text-center">{t.name}</p>
            <p className="text-xs text-gray-400">{t.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}