"use client";

export default function Input({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  error = null,
  helperText = null,
  required = false,
  disabled = false,
  startIcon: StartIcon,
  endIcon: EndIcon,
  className = "",
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

      <div className="relative flex items-center">
        {StartIcon && (
          <div className="absolute right-3.5 pointer-events-none text-zinc-500">
            <StartIcon className="w-4 h-4" />
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full py-3 rounded-xl bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-500
            border transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
            ${StartIcon ? "pr-10" : "px-4"}
            ${EndIcon ? "pl-10" : "px-4"}
            ${
              error
                ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
                : "border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40"
            }
            ${className}
          `.trim()}
          {...props}
        />

        {EndIcon && (
          <div className="absolute left-3.5 pointer-events-none text-zinc-500">
            <EndIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400 font-bold">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-zinc-500">{helperText}</p>}
    </div>
  );
}
