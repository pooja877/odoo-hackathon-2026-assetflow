import { useState } from 'react';
import { Plus, CheckCircle2, HelpCircle, AlertOctagon, Lock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import AuditForm from '../components/AuditForm';
import { useToast } from '../components/Toast';
import { auditChecklist } from '../data/dummyData';

export default function Audit() {
  const [checklist, setChecklist] = useState(auditChecklist);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();

  const counts = {
    verified: checklist.filter((a) => a.status === 'Verified').length,
    missing: checklist.filter((a) => a.status === 'Missing').length,
    damaged: checklist.filter((a) => a.status === 'Damaged').length,
  };

  const columns = [
    { key: 'asset', label: 'Asset' },
    { key: 'expectedLocation', label: 'Expected Location' },
    {
      key: 'status',
      label: 'Verification',
      render: (r) => (
        <select
          value={r.status}
          onChange={(e) => {
            setChecklist((prev) => prev.map((i) => (i.id === r.id ? { ...i, status: e.target.value } : i)));
          }}
          className="rounded-lg border border-border bg-bg-surface px-2.5 py-1.5 text-xs text-text focus:border-brand focus:outline-none"
        >
          <option>Verified</option>
          <option>Missing</option>
          <option>Damaged</option>
        </select>
      ),
    },
    { key: 'badge', label: '', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const handleStartAudit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    showToast('New audit cycle started.', 'success');
    setModalOpen(false);
  };

  const handleClose = async () => {
    await new Promise((r) => setTimeout(r, 500));
    showToast('Audit cycle closed. Discrepancy report generated.', 'success');
    setConfirmOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Asset Audit"
        subtitle="Run scheduled audit cycles and verify physical asset locations."
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={16} /> Start Audit Cycle
          </button>
        }
      />

      <div className="surface-card mb-5 flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-text">Q3 Audit — Engineering Department</p>
          <p className="mt-0.5 text-xs text-text-secondary">1–15 Jul 2026 · Auditors: A. Rao, S. Iqbal</p>
        </div>
        <button onClick={() => setConfirmOpen(true)} className="btn-secondary">
          <Lock size={14} /> Close Audit
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="surface-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-bg">
            <CheckCircle2 size={18} className="text-success" />
          </div>
          <div>
            <p className="text-xl font-semibold text-text">{counts.verified}</p>
            <p className="text-xs text-text-secondary">Verified</p>
          </div>
        </div>
        <div className="surface-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-bg">
            <HelpCircle size={18} className="text-danger" />
          </div>
          <div>
            <p className="text-xl font-semibold text-text">{counts.missing}</p>
            <p className="text-xs text-text-secondary">Missing</p>
          </div>
        </div>
        <div className="surface-card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-bg">
            <AlertOctagon size={18} className="text-warning" />
          </div>
          <div>
            <p className="text-xl font-semibold text-text">{counts.damaged}</p>
            <p className="text-xs text-text-secondary">Damaged</p>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={checklist} emptyMessage="No checklist items" />

      {(counts.missing > 0 || counts.damaged > 0) && (
        <div className="mt-4 rounded-xl border border-warning/30 bg-warning-bg px-4 py-3.5">
          <p className="text-sm font-medium text-warning">
            {counts.missing + counts.damaged} asset{counts.missing + counts.damaged !== 1 ? 's' : ''} flagged — discrepancy report generated automatically.
          </p>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Start New Audit Cycle">
        <AuditForm onSubmit={handleStartAudit} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleClose}
        title="Close this audit cycle?"
        message="Closing generates a final discrepancy report and locks the checklist from further edits. This action cannot be undone."
        confirmLabel="Close Audit"
      />
    </div>
  );
}
