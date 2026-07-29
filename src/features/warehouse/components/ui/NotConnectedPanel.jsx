import { Icon, icons } from './Icon.jsx';

export const NotConnectedPanel = ({ title, description, className = "" }) => (
  <div className={`bg-white border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center ${className}`}>
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Icon d={icons.inbox} size={18} className="text-gray-400" />
    </div>
    <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
    <p className="text-xs text-gray-400 max-w-xs leading-relaxed">{description}</p>
  </div>
);
