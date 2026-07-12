import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={
              tone === 'danger'
                ? 'btn-primary bg-danger hover:bg-red-600'
                : 'btn-primary'
            }
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-bg">
          <AlertTriangle size={18} className="text-danger" />
        </div>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
    </Modal>
  );
}
