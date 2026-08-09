import React from "react";
import { X } from "lucide-react";

const DialogShell = ({
  isOpen,
  onClose,
  icon: Icon,
  iconBg = "bg-gray-100",
  iconFg = "text-gray-500",
  titleColor = "text-[#1E2740]",
  title,
  subtitle,
  maxWidth = "max-w-[720px]",
  children,
  footerLeft,
  footerRight,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/45 flex items-start justify-center overflow-y-auto p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`w-full ${maxWidth} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start gap-3.5 min-w-0">
            {Icon && (
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={22} className={iconFg} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className={`text-[18px] font-bold ${titleColor} leading-tight`}>{title}</h3>
              {subtitle && <p className="text-[13px] text-gray-500 mt-1 leading-snug">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>

        {/* Footer */}
        {(footerLeft || footerRight) && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap flex-shrink-0 bg-white">
            <div className="flex items-center gap-2">{footerLeft}</div>
            <div className="flex items-center gap-2 flex-wrap justify-end">{footerRight}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DialogShell;