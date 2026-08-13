interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export default function InputPanel({
  value,
  onChange,
}: InputPanelProps) {
  return (
    <div className="h-40 border-t border-slate-800 bg-slate-950 flex flex-col">

      <div className="px-4 py-2 border-b border-slate-800">
        <span className="text-sm font-medium text-white">
          Input
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Custom input..."
        className="
          flex-1
          bg-slate-950
          text-slate-200
          p-4
          outline-none
          resize-none
          font-mono
          text-sm
        "
      />

    </div>
  );
}