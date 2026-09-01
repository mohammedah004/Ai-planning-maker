"use client";

const variantStyles = {
  default: "bg-[#131316] border-zinc-800/80 shadow-sm",
  interactive:
    "bg-[#131316] border-zinc-800/80 hover:border-zinc-700 hover:bg-[#18181d] transition-all duration-150 shadow-sm cursor-pointer",
  elevated: "bg-[#18181d] border-zinc-750 shadow-md",
  inset: "bg-[#09090b] border-zinc-850",
  highlight: "bg-gradient-to-br from-[#131316] via-[#131316] to-blue-950/20 border-blue-900/40 shadow-sm",
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
    <div className={`flex items-center justify-between pb-4 border-b border-zinc-800/80 gap-3 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = "" }) {
  return <div className={`pt-4 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = "" }) {
  return (
    <div className={`pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2 ${className}`}>
      {children}
    </div>
  );
};
