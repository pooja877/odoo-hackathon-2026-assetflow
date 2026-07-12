import { useState, useEffect } from 'react';
import { Plus, User, GripVertical } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import MaintenanceForm from '../components/MaintenanceForm';
import { useToast } from '../components/Toast';
import maintenanceService from '../services/maintenanceService';
import assetService from '../services/assetService';

const COLUMNS = [
  { key: 'pending', label: 'Pending', dot: 'bg-gray-400' },
  { key: 'approved', label: 'Approved', dot: 'bg-warning' },
  { key: 'assigned', label: 'Technician Assigned', dot: 'bg-brand' },
  { key: 'inProgress', label: 'In Progress', dot: 'bg-brand-light' },
  { key: 'resolved', label: 'Resolved', dot: 'bg-success' },
];

const PRIORITY_STYLE = {
  High: 'bg-danger-bg text-danger',
  Medium: 'bg-warning-bg text-warning',
  Low: 'bg-success-bg text-success',
};

export default function Maintenance() {
  const [board, setBoard] = useState({ pending: [], approved: [], assigned: [], inProgress: [], resolved: [] });
  const [dragItem, setDragItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadTickets = async () => {
    setLoading(true);
    try {
      const [tickets, assets] = await Promise.all([
        maintenanceService.getTickets(),
        assetService.getAssets()
      ]);
      const newBoard = { pending: [], approved: [], assigned: [], inProgress: [], resolved: [] };
      tickets.forEach((t) => {
        const col = t.status || 'pending';
        if (newBoard[col]) {
          const asset = assets.find((a) => a.id === t.asset_id);
          newBoard[col].push({
            id: t.id,
            description: t.description || 'Repair request',
            assetName: asset ? asset.name : 'Unknown Asset',
            assetTag: asset ? asset.asset_tag : `AST-${t.asset_id}`,
            priority: t.priority || 'Medium',
            technician: t.technician || 'Unassigned',
          });
        }
      });
      setBoard(newBoard);
    } catch (err) {
      showToast('Failed to load maintenance tickets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const onDrop = async (colKey) => {
    if (!dragItem) return;
    const { item, fromCol } = dragItem;
    if (fromCol === colKey) return setDragItem(null);

    // Optimistic UI update
    setBoard((prev) => {
      const next = { ...prev };
      next[fromCol] = next[fromCol].filter((t) => t.id !== item.id);
      next[colKey] = [...next[colKey], item];
      return next;
    });

    try {
      await maintenanceService.updateTicketStatus(item.id, colKey);
      showToast(`Ticket #${item.id} status updated to ${COLUMNS.find((c) => c.key === colKey).label}.`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to update ticket status on server.', 'error');
      loadTickets(); // Revert on failure
    }
    setDragItem(null);
  };

  const handleRaise = async (formData) => {
    try {
      await maintenanceService.createTicket({
        asset_id: formData.assetId,
        description: formData.issue,
        priority: formData.priority,
      });
      showToast('Maintenance request raised successfully.', 'success');
      loadTickets();
    } catch (err) {
      showToast(err.message || 'Failed to raise maintenance ticket.', 'error');
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Maintenance Board"
        subtitle="Route, approve, and resolve maintenance tickets for all assets."
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary cursor-pointer">
            <Plus size={16} /> Raise Ticket
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <span className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.key)}
              className="flex w-[268px] shrink-0 flex-col rounded-xl bg-bg-card p-3 border border-border"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className="text-sm font-semibold text-text">{col.label}</span>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-text-secondary">
                  {board[col.key]?.length || 0}
                </span>
              </div>

              <div className="flex-1 space-y-2.5 min-h-[300px]">
                {board[col.key]?.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDragItem({ item, fromCol: col.key })}
                    className="group relative flex flex-col gap-2 rounded-lg border border-border bg-bg-surface p-3 hover:border-brand/40 cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-mono text-[10px] text-brand-light font-semibold">{item.assetTag} · TKT #{item.id}</span>
                      <GripVertical size={13} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-text font-bold leading-normal">{item.assetName}</p>
                    <p className="text-[11px] text-text-secondary leading-snug">"{item.description}"</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${PRIORITY_STYLE[item.priority]}`}>
                        {item.priority}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-text-secondary">
                        <User size={10} />
                        <span>{item.technician}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Raise Maintenance Ticket">
        <MaintenanceForm onSubmit={handleRaise} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
