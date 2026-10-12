import React from "react";
import { ChevronDown } from "lucide-react";

export function LabeledSelect({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  hint,
}) {
  const uniqueOptions = Array.from(
    new Map(
      (options || []).map((option) => [
        String(option?.value ?? option),
        option,
      ]),
    ).values(),
  );
  const optionLabel = (option) =>
    String(option?.label ?? option ?? "")
      .replace(/\s*--\s*/g, " ")
      .trim();

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{placeholder}</option>
          {uniqueOptions.map((o) => (
            <option key={o.value || o} value={o.value || o}>
              {optionLabel(o)}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
