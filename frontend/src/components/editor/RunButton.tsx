import { Play } from "lucide-react";

interface RunButtonProps {
  onRun: () => void;
  isRunning?: boolean;
}

export default function RunButton({
  onRun,
  isRunning = false,
}: RunButtonProps) {
  return (
    <button
      onClick={onRun}
      disabled={isRunning}
      className="
        flex items-center gap-2
        px-4 py-1.5
        rounded-lg
        bg-emerald-600
        hover:bg-emerald-500
        disabled:bg-slate-700
        disabled:cursor-not-allowed
        text-white
        text-sm
        font-medium
        transition-all
        duration-200
      "
    >
      <Play
        className={`w-4 h-4 ${
          isRunning ? "animate-pulse" : "fill-white"
        }`}
      />
      {isRunning ? "Running..." : "Run"}
    </button>
  );
}