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

export default function Audit() {
  const [checklist, setChecklist] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const allCycles = await auditService.getAuditCycles();
      setCycles(allCycles);
      const active = allCycles.find((c) => c.status === 'Active');
      setActiveCycle(active);

      if (active) {
        const items = await auditService.getChecklist(active.id);
        setChecklist(items);
      } else {
        setChecklist([]);
      }
    } catch (err) {
      showToast('Failed to load audit cycles data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const counts = {
    verified: checklist.filter((a) => a.status === 'Verified').length,
    missing: checklist.filter((a) => a.status === 'Missing').length,
    damaged: checklist.filter((a) => a.status === 'Damaged').length,
  };

  const handleVerify = async (itemId, newStatus) => {
    if (!activeCycle) return;
    // Optimistic UI update
    setChecklist((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i)));
    try {
      await auditService.verifyItem(activeCycle.id, itemId, { status: newStatus });
      showToast(`Asset status updated to ${newStatus}.`, 'success');
    } catch (err) {
      showToast('Failed to save status on server.', 'error');
      loadData(); // Revert
    }
  };

  const columns = [
    { key: 'asset_id', label: 'Asset ID' },
    { key: 'expected_location', label: 'Expected Location' },
    {
      key: 'status',
      label: 'Verification',
      render: (r) => (
        <select
          value={r.status}
          onChange={(e) => handleVerify(r.id, e.target.value)}
          className="rounded-lg border border-border bg-bg-surface px-2.5 py-1.5 text-xs text-text focus:border-brand focus:outline-none cursor-pointer"
        >
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Missing">Missing</option>
          <option value="Damaged">Damaged</option>
        </select>
      ),
    },
    { key: 'badge', label: '', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const handleStartAudit = async (formData) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const payload = {
        name: formData.name,
        scope_type: 'Department',
        scope_id: parseInt(formData.scope) || 1,
        start_date: todayStr,
        end_date: todayStr,
      };
      await auditService.startAuditCycle(payload);
      showToast('New audit cycle started successfully.', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to start audit cycle.', 'error');
    }
    setModalOpen(false);
  };

  const handleClose = async () => {
    if (!activeCycle) return;
    try {
      await auditService.closeAudit(activeCycle.id);
      showToast('Audit cycle closed. Discrepancy report generated.', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to close audit cycle.', 'error');
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
            {activeCycle && (
              <button onClick={() => setConfirmOpen(true)} className="btn-secondary flex items-center gap-1.5 cursor-pointer">
                <Lock size={15} /> Close Cycle
              </button>
            )}
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
          { label: 'Missing/Lost', value: counts.missing, color: 'text-warning', icon: HelpCircle, bg: 'bg-warning/10' },
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
      ) : activeCycle ? (
        <DataTable columns={columns} data={checklist} emptyMessage="No items in the active audit checklist" />
      ) : (
        <div className="text-center py-12 text-slate-500 font-semibold text-sm">
          No active audit cycle. Please start a new cycle to deploy checklist tasks.
        </div>
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
