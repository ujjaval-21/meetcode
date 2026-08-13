import RunButton from "./RunButton";

interface EditorToolbarProps {
  onRun: () => void;
  isRunning: boolean;
  canRun?: boolean;
}

export default function EditorToolbar({
  onRun,
  isRunning,
  canRun = true,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <RunButton
        onRun={onRun}
        isRunning={isRunning}
        disabled={!canRun}
      />
    </div>
  );
}