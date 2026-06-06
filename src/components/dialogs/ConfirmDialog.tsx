interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title = "Confirm", message = "Are you sure?", onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">{title}</h3>

        <p className="mt-2 text-sm text-slate-600">{message}</p>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border px-4 py-2">
            Cancel
          </button>

          <button onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-white">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
