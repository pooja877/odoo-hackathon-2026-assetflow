import { useState } from 'react';
import { Plus, User, GripVertical } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import MaintenanceForm from '../components/MaintenanceForm';
import { useToast } from '../components/Toast';
import { maintenanceBoard } from '../data/dummyData';

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
  const [board, setBoard] = useState(maintenanceBoard);
  const [dragItem, setDragItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const onDrop = (colKey) => {
    if (!dragItem) return;
    const { item, fromCol } = dragItem;
    if (fromCol === colKey) return setDragItem(null);
    setBoard((prev) => {
      const next = { ...prev };
      next[fromCol] = next[fromCol].filter((t) => t.id !== item.id);
      next[colKey] = [...next[colKey], item];
      return next;
    });
    showToast(`${item.id} moved to ${COLUMNS.find((c) => c.key === colKey).label}.`, 'info');
    setDragItem(null);
  };

  const handleRaise = async () => {
    await new Promise((r) => setTimeout(r, 500));
    showToast('Maintenance request raised successfully.', 'success');
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Track repair requests from submission through resolution."
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={16} /> Raise Request
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(col.key)}
            className="flex min-h-[420px] flex-col rounded-xl border border-border bg-bg-surface"
          >
            <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <h4 className="text-sm font-semibold text-text">{col.label}</h4>
              <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-xs text-text-secondary">
                {board[col.key].length}
              </span>
            </div>
            <div className="flex-1 space-y-2.5 p-2.5">
              {board[col.key].map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDragItem({ item, fromCol: col.key })}
                  className="cursor-grab rounded-lg border border-border bg-bg-card p-3.5 shadow-card transition-transform active:cursor-grabbing active:scale-[0.98]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-xs text-brand-light">{item.id}</span>
                    <GripVertical size={13} className="text-gray-600" />
                  </div>
                  <p className="text-sm text-text">{item.name}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLE[item.priority]}`}>
                      {item.priority}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <User size={12} /> {item.technician}
                    </span>
                  </div>
                </div>
              ))}
              {board[col.key].length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-gray-500">Drop a card here</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Drag a card between columns to update its status. Approving a card moves the asset to under maintenance; resolving returns it to available.
      </p>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Raise Maintenance Request">
        <MaintenanceForm onSubmit={handleRaise} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
