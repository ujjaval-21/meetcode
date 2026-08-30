import { useEffect } from "react";
import type { ExecutionResult } from "../../types/execution";
import OutputPanel from "./OutputPanel";
import { useWorkspaceLayout } from "../../hooks/useWorkspaceLayout";




interface OutputContainerProps {
  execution: ExecutionResult;
  output: ReturnType<typeof useWorkspaceLayout>["output"];
}

export default function OutputContainer({
  execution,
  output
}: OutputContainerProps) {


  // Auto-open when code starts running.
  useEffect(() => {
    if (execution.isRunning) {
      output.open();
    }
  }, [execution.isRunning]);



  if (!output.isOpen){
    return (
      <button
        onClick={output.open}
        className="
          h-9
          border-t border-slate-800
          bg-slate-950
          hover:bg-slate-900
          px-4
          flex
          items-center
          text-sm
          text-slate-300
          transition-colors
        "
      >
        Output
      </button>
    );
  }

  return (
    <div
      style={{
        height: output.height,
        transition: output.dragging.current
          ? "none"
          : "height 200ms ease",
      }}
      className="flex flex-col border-t border-slate-800"
    >
      <div
        onMouseDown={output.startResize}
        onDoubleClick={output.reset}
        className="
          h-1
          cursor-row-resize
          bg-slate-800
          hover:bg-violet-500
          transition-colors
          shrink-0
        "
      />

      <div className="flex-1 overflow-hidden">
            <OutputPanel
        execution={execution}
        onClose={output.close}
      />
      </div>
    </div>
  );
}