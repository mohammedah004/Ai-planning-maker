"use client";

const variantStyles = {
  default: "bg-[#F8F9FB] dark:bg-[#131316] border-[#E4E7EC] dark:border-zinc-800/80 shadow-xs",
  interactive:
    "bg-[#F8F9FB] dark:bg-[#131316] border-[#E4E7EC] dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-[#F0F4F8] dark:hover:bg-[#18181d] transition-all duration-150 shadow-xs hover:shadow-sm cursor-pointer",
  elevated: "bg-white dark:bg-[#18181d] border-[#E4E7EC] dark:border-zinc-750 shadow-sm",
  inset: "bg-[#F8F9FB] dark:bg-[#09090b] border-[#E4E7EC] dark:border-zinc-850",
  highlight: "bg-gradient-to-br from-[#F8F9FB] via-[#F8F9FB] to-blue-50/50 dark:from-[#131316] dark:via-[#131316] dark:to-blue-950/20 border-blue-200 dark:border-blue-900/40 shadow-xs",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3 sm:p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export default function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border text-right
        ${variantStyles[variant] || variantStyles.default}
        ${paddingStyles[padding] || paddingStyles.md}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-between pb-4 border-b border-[#E4E7EC] dark:border-zinc-800/80 gap-3 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = "" }) {
  return <div className={`pt-4 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = "" }) {
  return (
    <div className={`pt-4 mt-4 border-t border-[#E4E7EC] dark:border-zinc-800/80 flex items-center justify-between gap-2 ${className}`}>
      {children}
    </div>
  );
};
