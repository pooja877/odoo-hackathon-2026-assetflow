import { useState, useMemo, useEffect } from 'react';
import { Plus, X, MapPin, Tag, Building2, QrCode } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import AssetForm from '../components/AssetForm';
import { useToast } from '../components/Toast';
import assetService from '../services/assetService';
import api from '../services/api';
import { assets } from '../data/dummyData';

const filterConfig = [
  { key: 'category', label: 'Category', options: ['Electronics', 'Furniture', 'Vehicles'] },
  { key: 'status', label: 'Status', options: ['Available', 'Allocated', 'Maintenance', 'Lost'] },
  { key: 'department', label: 'Department', options: ['Engineering', 'IT', 'Facilities', 'Field Ops'] },
];

export default function AssetDirectory() {
  const [assetsList, setAssetsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      let cats = [];
      try {
        cats = await assetService.getCategories();
        setCategoriesList(cats);
      } catch (e) {
        console.warn('Failed to load categories from backend', e);
      }

      // 2. Fetch departments
      let depts = [];
      try {
        const res = await api.get('/departments');
        depts = res.data;
        setDepartmentsList(depts);
      } catch (e) {
        console.warn('Failed to load departments from backend', e);
      }

      // 3. Fetch assets
      const data = await assetService.getAssets();
      setAssetsList(data);
    } catch (err) {
      console.warn('Backend /assets not fully implemented yet, falling back to mock data.', err);
      setAssetsList(assets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { key: 'asset_tag', label: 'Asset Tag', render: (r) => <span className="font-mono text-xs text-brand-light">{r.asset_tag || r.id}</span> },
    { key: 'name', label: 'Name' },
    {
      key: 'category_id',
      label: 'Category',
      render: (r) => {
        if (r.category_id) {
          return categoriesList.find((c) => c.id === r.category_id)?.name || '—';
        }
        return r.category || '—';
      }
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'department_id',
      label: 'Department',
      render: (r) => {
        if (r.department_id) {
          return departmentsList.find((d) => d.id === r.department_id)?.name || '—';
        }
        return r.department || '—';
      }
    },
    { key: 'location', label: 'Location' },
  ];

  const filtered = useMemo(() => {
    return assetsList.filter((a) => {
      const tagVal = a.asset_tag || a.id || '';
      const nameVal = a.name || '';
      const matchSearch =
        !search ||
        tagVal.toLowerCase().includes(search.toLowerCase()) ||
        nameVal.toLowerCase().includes(search.toLowerCase());
      
      const matchFilters = Object.entries(filters).every(([k, v]) => {
        if (!v) return true;
        if (k === 'category') {
          if (a.category_id) {
            const catName = categoriesList.find((c) => c.id === a.category_id)?.name || '';
            return catName === v;
          }
          return a.category === v;
        }
        if (k === 'department') {
          if (a.department_id) {
            const deptName = departmentsList.find((d) => d.id === a.department_id)?.name || '';
            return deptName === v;
          }
          return a.department === v;
        }
        return a[k] === v;
      });

      return matchSearch && matchFilters;
    });
  }, [assetsList, search, filters, categoriesList, departmentsList]);

  const handleCreate = async (formData) => {
    try {
      // Find category and department IDs (lookup by name string)
      let catId = categoriesList.find((c) => c.name.toLowerCase() === formData.category.toLowerCase())?.id;
      if (!catId && categoriesList.length > 0) {
        catId = categoriesList[0].id;
      } else if (!catId) {
        catId = 1; // Fallback
      }

      let deptId = departmentsList.find((d) => d.name.toLowerCase() === formData.department?.toLowerCase())?.id;
      if (!deptId && departmentsList.length > 0) {
        deptId = departmentsList[0].id;
      } else if (!deptId) {
        deptId = 1; // Fallback
      }

      // Construct backend schema compliant payload
      const payload = {
        name: formData.name,
        serial_number: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        acquisition_date: new Date().toISOString().split('T')[0],
        acquisition_cost: 0.00,
        condition: 'Good',
        location: formData.location || 'Bengaluru HQ',
        photo_url: null,
        is_shared: false,
        status: formData.status || 'Available',
        category_id: catId,
        department_id: deptId,
      };

      await assetService.createAsset(payload);
      showToast('Asset registered successfully.', 'success');
      loadData();
    } catch (err) {
      console.warn('Backend createAsset failed, simulating locally.', err);
      showToast('Asset registered (simulated).', 'success');
      // Locally simulate addition for smooth UX
      const newAsset = {
        id: `AF-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name,
        category: formData.category,
        status: formData.status || 'Available',
        department: formData.department || '—',
        location: formData.location || 'Warehouse',
      };
      setAssetsList((p) => [newAsset, ...p]);
    }
    setModalOpen(false);
  };

  return (
    <div className="relative">
      <PageHeader
        title="Asset Directory"
        subtitle="Search, filter, and manage every asset in your organization."
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary cursor-pointer">
            <Plus size={16} /> Register Asset
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by tag, name, or serial..." />
        <FilterBar filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <span className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} onRowClick={setSelected} emptyMessage="No assets match your filters" />
      )}

      {/* Details drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md animate-slideInRight overflow-y-auto border-l border-border bg-bg-card shadow-popover">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-base font-semibold text-text">Asset Details</h3>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-text cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                  <QrCode size={22} className="text-brand-light" />
                </div>
                <div>
                  <p className="font-mono text-sm text-brand-light">{selected.asset_tag || selected.id}</p>
                  <p className="text-lg font-semibold text-text">{selected.name}</p>
                </div>
              </div>

              <div className="mb-5">
                <StatusBadge status={selected.status} />
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: Tag,
                    label: 'Category',
                    value: selected.category_id
                      ? categoriesList.find((c) => c.id === selected.category_id)?.name
                      : selected.category
                  },
                  {
                    icon: Building2,
                    label: 'Department',
                    value: selected.department_id
                      ? departmentsList.find((d) => d.id === selected.department_id)?.name
                      : selected.department
                  },
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
                <button className="btn-secondary flex-1 cursor-pointer">Edit</button>
                <button className="btn-primary flex-1 cursor-pointer">View Allocation</button>
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
        <AssetForm
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          categories={categoriesList}
          departments={departmentsList}
        />
      </Modal>
    </div>
  );
}
