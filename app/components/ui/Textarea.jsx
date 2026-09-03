"use client";

export default function Textarea({
  id,
  label,
  value,
  onChange,
  rows = 3,
  maxLength = null,
  placeholder = "",
  error = null,
  helperText = null,
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="space-y-1.5 text-right w-full">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-bold uppercase tracking-wider text-[#1A1D1F] dark:text-zinc-300"
          >
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </label>
        )}
        {maxLength && (
          <span className="text-[11px] text-[#575C61] dark:text-zinc-500 tabular-nums">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>

      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-xl bg-white dark:bg-[#09090b] text-sm text-[#1A1D1F] dark:text-zinc-100 placeholder-[#575C61] dark:placeholder-zinc-500
          border transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed
          ${
            error
              ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
              : "border-[#E4E7EC] dark:border-zinc-800 focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0]/30 dark:focus:border-blue-500"
          }
          ${className}
        `.trim()}
        {...props}
      />

      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#575C61] dark:text-zinc-500">{helperText}</p>}
    </div>
  );
}
