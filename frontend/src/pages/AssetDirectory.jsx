import { useState, useMemo } from 'react';
import { Plus, X, MapPin, Tag, Building2, QrCode } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import AssetForm from '../components/AssetForm';
import { useToast } from '../components/Toast';
import { assets } from '../data/dummyData';

const filterConfig = [
  { key: 'category', label: 'Category', options: ['Electronics', 'Furniture', 'Vehicles'] },
  { key: 'status', label: 'Status', options: ['Available', 'Allocated', 'Maintenance', 'Lost'] },
  { key: 'department', label: 'Department', options: ['Engineering', 'IT', 'Facilities', 'Field Ops'] },
];

export default function AssetDirectory() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const columns = [
    { key: 'id', label: 'Asset Tag', render: (r) => <span className="font-mono text-xs text-brand-light">{r.id}</span> },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'department', label: 'Department' },
    { key: 'location', label: 'Location' },
  ];

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchSearch =
        !search ||
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase());
      const matchFilters = Object.entries(filters).every(([k, v]) => !v || a[k] === v);
      return matchSearch && matchFilters;
    });
  }, [search, filters]);

  const handleCreate = async () => {
    await new Promise((r) => setTimeout(r, 500));
    showToast('Asset registered successfully.', 'success');
    setModalOpen(false);
  };

  return (
    <div className="relative">
      <PageHeader
        title="Asset Directory"
        subtitle="Search, filter, and manage every asset in your organization."
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={16} /> Register Asset
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by tag, name, or serial..." />
        <FilterBar filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} />
      </div>

      <DataTable columns={columns} data={filtered} onRowClick={setSelected} emptyMessage="No assets match your filters" />

      {/* Details drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md animate-slideInRight overflow-y-auto border-l border-border bg-bg-card shadow-popover">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-base font-semibold text-text">Asset Details</h3>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-text">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                  <QrCode size={22} className="text-brand-light" />
                </div>
                <div>
                  <p className="font-mono text-sm text-brand-light">{selected.id}</p>
                  <p className="text-lg font-semibold text-text">{selected.name}</p>
                </div>
              </div>

              <div className="mb-5">
                <StatusBadge status={selected.status} />
              </div>

              <div className="space-y-4">
                {[
                  { icon: Tag, label: 'Category', value: selected.category },
                  { icon: Building2, label: 'Department', value: selected.department },
                  { icon: MapPin, label: 'Location', value: selected.location },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-lg border border-border bg-bg-surface px-4 py-3">
                    <Icon size={16} className="text-text-secondary" />
                    <div>
                      <p className="text-xs text-text-secondary">{label}</p>
                      <p className="text-sm font-medium text-text">{value || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-2">
                <button className="btn-secondary flex-1">Edit</button>
                <button className="btn-primary flex-1">View Allocation</button>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Asset"
        subtitle="Add a new asset to the directory"
      >
        <AssetForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
