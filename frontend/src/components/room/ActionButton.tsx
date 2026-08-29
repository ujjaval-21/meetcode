import type { ReactNode } from "react";

interface ActionButtonProps {
  icon: ReactNode;
  activeIcon?: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "danger";
}

export default function ActionButton({
  icon,
  activeIcon,
  label,
  active,
  onClick,
  variant = "default",
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-200 group",
        active
          ? variant === "danger"
            ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            : "bg-slate-700/80 border-slate-600 text-white"
          : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800",
      ].join(" ")}
    >
      <span className="w-5 h-5">
        {active && activeIcon ? activeIcon : icon}
      </span>

      <span className="text-xs font-medium leading-none">
        {label}
      </span>
    </button>
  );
}