import { X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">

      <div className="w-[400px] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">

        <div className="flex items-center justify-between p-5 border-b border-slate-800">

          <h2 className="text-lg font-semibold text-white">
            {title}
          </h2>

          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-white"
          >
            <X size={18} />
          </button>

        </div>

        <div className="p-5">

          <p className="text-slate-300">
            {message}
          </p>

        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-slate-800">

          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            {confirmText}
          </button>

        </div>

      </div>

    </div>
  );
}