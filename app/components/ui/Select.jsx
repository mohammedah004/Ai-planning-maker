"use client";

import { ChevronDown } from "lucide-react";

export default function Select({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = "اختر...",
  error = null,
  helperText = null,
  required = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <div className="space-y-1.5 text-right w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold uppercase tracking-wider text-zinc-300"
        >
          {label} {required && <span className="text-red-400 font-bold">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full pr-4 pl-10 py-3 rounded-xl bg-[#09090b] text-sm text-zinc-100
            border transition-all duration-150 focus:outline-none appearance-none cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
                : "border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40"
            }
            ${className}
          `.trim()}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-zinc-900 text-zinc-500">
              {placeholder}
            </option>
          )}
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={typeof opt === "object" ? opt.value : opt}
                  value={typeof opt === "object" ? opt.value : opt}
                  className="bg-zinc-900 text-zinc-100 py-1"
                >
                  {typeof opt === "object" ? opt.label : opt}
                </option>
              ))
            : children}
        </select>

        {/* Custom RTL-positioned chevron icon on the left */}
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && <p className="text-xs text-red-400 font-bold">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-zinc-500">{helperText}</p>}
    </div>
  );
}
