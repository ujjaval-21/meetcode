import type { ExecutionResult } from "../../types/execution";
import { Terminal, X } from "lucide-react";

interface OutputPanelProps {
  execution: ExecutionResult;
  onClose: () => void;
}

export default function OutputPanel({
  execution,
  onClose,
}: OutputPanelProps) {
  return (
    <div className="h-56 border-t border-slate-800 bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-white">
            Output
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              Time: {execution.executionTime ?? "--"}
            </span>
          
            <span>
              Memory: {execution.memory ?? "--"}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {execution.isRunning ? (
          <span className="text-emerald-400">
            Running...
          </span>
        ) : execution.error ? (
          <pre className="text-red-400 whitespace-pre-wrap">
            {execution.error}
          </pre>
        ) : execution.output ? (
          <pre className="text-slate-200 whitespace-pre-wrap">
            {execution.output}
          </pre>
        ) : (
          <span className="text-slate-500">
            Click Run to execute your code.
          </span>
        )}
      </div>
    </div>
  );
}