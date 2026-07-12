import { useState, useEffect } from 'react';
import { PackagePlus, CalendarPlus, FileWarning, AlertCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DashboardCards from '../components/DashboardCards';
import { UtilizationChart, MaintenanceFrequencyChart } from '../components/Charts';
import Modal from '../components/Modal';
import AssetForm from '../components/AssetForm';
import BookingForm from '../components/BookingForm';
import { useToast } from '../components/Toast';
import authService from '../services/authService';
import api from '../services/api';

const QUICK_ACTIONS = [
  { key: 'register', label: 'Register Asset', icon: PackagePlus },
  { key: 'book', label: 'Book Resource', icon: CalendarPlus },
  { key: 'raise', label: 'Raise Request', icon: FileWarning },
];

export default function Dashboard() {
  const [activeModal, setActiveModal] = useState(null);
  const [stats, setStats] = useState({
    total_users: 0,
    pending_approvals: 0,
    total_assets: 0,
    available_assets: 0,
  });
  const [utilizationData, setUtilizationData] = useState([]);
  const [maintenanceFrequencyData, setMaintenanceFrequencyData] = useState([]);
  const [recentActivityList, setRecentActivityList] = useState([]);
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [departmentName, setDepartmentName] = useState('Unassigned');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const user = authService.getCurrentUser() || { name: 'Rahul', role: 'Employee', employee_id: 'EMP001' };
  const isAdmin = user?.role === 'Admin';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // Load Admin dynamic data
        const [statsRes, utilRes, maintRes, actRes] = await Promise.all([
          api.get('/stats'),
          api.get('/reports/utilization'),
          api.get('/reports/maintenance-frequency'),
          api.get('/notifications/activity-logs'),
        ]);
        setStats(statsRes.data);
        setUtilizationData(utilRes.data);
        setMaintenanceFrequencyData(maintRes.data);
        setRecentActivityList(actRes.data.slice(0, 5));
      } else {
        // Load Employee department details
        if (user.department_id) {
          const res = await api.get(`/departments/${user.department_id}`);
          setDepartmentName(res.data.name);
        }
        // Load assigned assets dynamically
        const [allocRes, assetsRes] = await Promise.all([
          api.get('/allocations'),
          api.get('/assets')
        ]);
        const myAllocations = allocRes.data.filter(a => a.user_id === user.id && a.status === 'Allocated');
        const myAssets = myAllocations.map(alloc => {
          const assetObj = assetsRes.data.find(ast => ast.id === alloc.asset_id);
          return {
            id: alloc.id,
            name: assetObj?.name || 'Assigned Item',
            serial: assetObj?.serial_number || '—',
            assigned: new Date(alloc.allocated_at).toLocaleDateString()
          };
        });
        setAssignedAssets(myAssets);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isAdmin, user.department_id, user.id]);

  const handleAsset = async (formData) => {
    try {
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
        category_id: 1,
        department_id: 1,
      };
      await api.post('/assets', payload);
      showToast('Asset registered successfully.', 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to register asset.', 'error');
    }
    setActiveModal(null);
  };

  const handleBooking = async (formData) => {
    try {
      const payload = {
        resource_id: parseInt(formData.resourceId),
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        purpose: formData.purpose,
      };
      await api.post('/bookings', payload);
      showToast('Resource booked successfully.', 'success');
      loadDashboardData();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to book resource.', 'error');
    }
    setActiveModal(null);
  };

  const handleRaise = async (formData) => {
    try {
      const assetsRes = await api.get('/assets');
      const asset = assetsRes.data.find(a => a.asset_tag.toLowerCase() === formData.assetId.toLowerCase());
      if (!asset) {
        showToast('Asset tag not found.', 'error');
        return;
      }
      await api.post('/maintenance', {
        asset_id: asset.id,
        description: formData.issue,
        priority: formData.priority,
      });
      showToast('Maintenance request submitted successfully.', 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to submit maintenance request.', 'error');
    }
    setActiveModal(null);
  };

  if (isAdmin) {
    const adminKpis = [
      { label: 'Total Users', value: stats.total_users.toString(), change: 'Registered users', changeType: 'positive' },
      { label: 'Pending Approvals', value: stats.pending_approvals.toString(), change: 'Awaiting registration', changeType: 'neutral' },
      { label: 'Total Assets', value: stats.total_assets.toString(), change: 'Hardware items', changeType: 'positive' },
      { label: 'Available Assets', value: stats.available_assets.toString(), change: 'In storage', changeType: 'positive' },
    ];

    return (
      <div className="space-y-6">
        <PageHeader
          title={`Good to see you, ${user?.name?.split(' ')[0] || 'Admin'}`}
          subtitle="Here's what's happening across your organization today."
        />

        <DashboardCards kpis={adminKpis} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="surface-card p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-text">Asset Utilization by Department</h3>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
              </div>
            ) : (
              <UtilizationChart data={utilizationData} />
            )}
          </div>

          <div className="surface-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-text">Quick Actions</h3>
            <div className="space-y-2">
              {QUICK_ACTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveModal(key)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-bg-surface px-3.5 py-3 text-sm font-medium text-text transition-all hover:border-brand/40 hover:bg-brand/5 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} className="text-brand-light" />
                    {label}
                  </span>
                  <span className="text-text-secondary">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="surface-card p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-text">Maintenance Frequency</h3>
            {loading ? (
              <div className="h-[260px] flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
              </div>
            ) : (
              <MaintenanceFrequencyChart data={maintenanceFrequencyData} />
            )}
          </div>

          <div className="surface-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-text">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivityList.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <div>
                    <p className="text-sm text-text font-medium">{a.text}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{new Date(a.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {recentActivityList.length === 0 && (
                <p className="text-xs text-gray-500 py-4 text-center">No recent activity logged.</p>
              )}
            </div>
          </div>
        </div>

        <Modal open={activeModal === 'register'} onClose={() => setActiveModal(null)} title="Register New Asset">
          <AssetForm onSubmit={handleAsset} onCancel={() => setActiveModal(null)} />
        </Modal>

        <Modal open={activeModal === 'book'} onClose={() => setActiveModal(null)} title="Book New Resource">
          <BookingForm onSubmit={handleBooking} onCancel={() => setActiveModal(null)} />
        </Modal>

        <Modal open={activeModal === 'raise'} onClose={() => setActiveModal(null)} title="Raise Ticket">
          <div className="p-4">
            <p className="text-xs text-text-secondary mb-3">Submit issue details to request maintenance assignment.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              handleRaise({
                assetId: form.elements.assetId.value,
                issue: form.elements.issue.value,
                priority: form.elements.priority.value
              });
            }} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text mb-1 block">Asset Tag</label>
                <input required name="assetId" placeholder="e.g. AST-DELL5440" className="input-base text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text mb-1 block">Issue Description</label>
                <textarea required name="issue" placeholder="Describe the fault..." className="input-base text-sm h-20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text mb-1 block">Priority</label>
                <select name="priority" className="input-base text-sm">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs">Submit</button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    );
  }

  // 2. EMPLOYEE DASHBOARD VIEW
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user?.name}`}
        subtitle="Welcome to your Employee Hub. Here are your assigned resources."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="surface-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-400 font-bold text-2xl">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">{user.name}</h3>
                <span className="text-xs text-text-secondary">{user.designation || 'Team Member'}</span>
              </div>
            </div>

            <div className="space-y-3.5 text-sm pt-4 border-t border-border/60">
              <div className="flex justify-between">
                <span className="text-text-secondary">Employee ID:</span>
                <span className="font-mono font-bold text-text">{user.employee_id || 'Generating...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Department:</span>
                <span className="font-semibold text-brand-light">{departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Email:</span>
                <span className="text-text truncate max-w-[180px]">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/60">
            <span className="text-xs text-gray-500">Account Status: Active</span>
          </div>
        </div>

        {/* Assets List */}
        <div className="surface-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-text mb-4">My Assigned Assets</h3>
          
          <div className="space-y-3">
            {assignedAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg-surface hover:border-brand/35 transition-colors">
                <div>
                  <h4 className="font-bold text-sm text-text">{asset.name}</h4>
                  <p className="text-xs text-text-secondary mt-0.5">Serial: {asset.serial}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-brand/10 text-brand rounded-full">Assigned</span>
                  <p className="text-[10px] text-gray-500 mt-1">{asset.assigned}</p>
                </div>
              </div>
            ))}
            {assignedAssets.length === 0 && (
              <p className="text-xs text-gray-500 py-6 text-center">No assets currently allocated to your profile.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
