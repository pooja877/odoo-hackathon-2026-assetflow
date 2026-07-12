import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, HelpCircle, AlertOctagon, Lock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import AuditForm from '../components/AuditForm';
import { useToast } from '../components/Toast';
import auditService from '../services/auditService';
import { auditChecklist } from '../data/dummyData';

export default function Audit() {
  const [checklist, setChecklist] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadChecklist = async () => {
    setLoading(true);
    try {
      // Use standard id 1 for checking live audit cycle list
      const data = await auditService.getChecklist(1);
      setChecklist(data);
    } catch (err) {
      console.warn('Backend getChecklist failed, falling back to mock checklist.', err);
      setChecklist(auditChecklist);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklist();
  }, []);

  const counts = {
    verified: checklist.filter((a) => a.status === 'Verified').length,
    missing: checklist.filter((a) => a.status === 'Missing').length,
    damaged: checklist.filter((a) => a.status === 'Damaged').length,
  };

  const handleVerify = async (itemId, newStatus) => {
    // Optimistic UI update
    setChecklist((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i)));
    try {
      await auditService.verifyItem(1, itemId, { status: newStatus });
      showToast(`Asset status updated to ${newStatus}.`, 'success');
    } catch (err) {
      console.warn('Backend verifyItem failed, simulating locally.', err);
    }
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
          onChange={(e) => handleVerify(r.id, e.target.value)}
          className="rounded-lg border border-border bg-bg-surface px-2.5 py-1.5 text-xs text-text focus:border-brand focus:outline-none cursor-pointer"
        >
          <option>Verified</option>
          <option>Missing</option>
          <option>Damaged</option>
        </select>
      ),
    },
    { key: 'badge', label: '', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const handleStartAudit = async (formData) => {
    try {
      await auditService.getAuditCycles(formData);
      showToast('New audit cycle started.', 'success');
      loadChecklist();
    } catch (err) {
      console.warn('Backend startAudit failed, simulating locally.', err);
      showToast('New audit cycle started (simulated).', 'success');
    }
    setModalOpen(false);
  };

  const handleClose = async () => {
    try {
      await auditService.closeAudit(1);
      showToast('Audit cycle closed. Discrepancy report generated.', 'success');
      loadChecklist();
    } catch (err) {
      console.warn('Backend closeAudit failed, simulating locally.', err);
      showToast('Audit cycle closed. Discrepancy report generated (simulated).', 'success');
    }
    setConfirmOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Asset Audits"
        subtitle="Perform physical audit checklists and log discrepancies."
        actions={
          <div className="flex gap-2">
            <button onClick={() => setConfirmOpen(true)} className="btn-secondary flex items-center gap-1.5 cursor-pointer">
              <Lock size={15} /> Close Cycle
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-1.5 cursor-pointer">
              <Plus size={15} /> Start Audit
            </button>
          </div>
        }
      />

      {/* Stats summaries */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Verified Assets', value: counts.verified, color: 'text-success', icon: CheckCircle2, bg: 'bg-success/10' },
          { label: 'Missing Assets', value: counts.missing, color: 'text-warning', icon: HelpCircle, bg: 'bg-warning/10' },
          { label: 'Damaged Assets', value: counts.damaged, color: 'text-danger', icon: AlertOctagon, bg: 'bg-danger/10' },
        ].map(({ label, value, color, icon: Icon, bg }) => (
          <div key={label} className="surface-card flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</p>
              <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
            </div>
            <div className={`rounded-xl p-3.5 ${bg}`}>
              <Icon className={color} size={22} />
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <span className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
        </div>
      ) : (
        <DataTable columns={columns} data={checklist} emptyMessage="No items in the active audit checklist" />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Start New Audit Cycle"
        subtitle="Deploy audit scopes for department or location verification"
      >
        <AuditForm onSubmit={handleStartAudit} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleClose}
        title="Close Audit Cycle"
        message="Are you sure you want to close this audit cycle? This will lock current entries and generate discrepancy tickets automatically."
      />
    </div>
  );
}
