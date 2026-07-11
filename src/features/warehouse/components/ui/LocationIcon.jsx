import { Icon, icons } from './Icon.jsx';

export const TYPE_LABELS = {
  receiving_area: "Receiving Area",
  storage_area: "Storage Area",
  dispatch_area: "Dispatch Area",
  damaged_goods_area: "Damaged Goods Area",
};

const LOCATION_TYPE_ICON = {
  storage_area: { icon: icons.storage, bg: "bg-blue-50", color: "text-blue-500" },
  dispatch_area: { icon: icons.dispatch, bg: "bg-orange-50", color: "text-orange-500" },
  receiving_area: { icon: icons.receive, bg: "bg-green-50", color: "text-green-500" },
  damaged_goods_area: { icon: icons.damaged, bg: "bg-yellow-50", color: "text-yellow-500" },
};

export const LocationIcon = ({ type }) => {
  const c = LOCATION_TYPE_ICON[type] || { icon: icons.storage, bg: "bg-gray-50", color: "text-gray-500" };
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.bg}`}>
      <Icon d={c.icon} size={15} className={c.color} />
    </div>
  );
};
