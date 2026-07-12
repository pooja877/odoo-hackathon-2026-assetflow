import { useState, useEffect } from 'react';
import { PackagePlus, CalendarPlus, FileWarning, ArrowRight, Users, CheckCircle2, User, Building, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DashboardCards from '../components/DashboardCards';
import { UtilizationChart, MaintenanceFrequencyChart } from '../components/Charts';
import NotificationCard from '../components/NotificationCard';
import Modal from '../components/Modal';
import AssetForm from '../components/AssetForm';
import BookingForm from '../components/BookingForm';
import { useToast } from '../components/Toast';
import authService from '../services/authService';
import api from '../services/api';
import { recentActivity, notifications } from '../data/dummyData';

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
    total_assets: 300,
    available_assets: 80,
  });
  const [departmentName, setDepartmentName] = useState('Unassigned');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const user = authService.getCurrentUser() || { name: 'Rahul', role: 'Employee', employee_id: 'EMP001' };
  const isAdmin = user?.role === 'Admin';

  // Load Admin Stats or Employee Department details
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const res = await api.get('/stats');
          setStats(res.data);
        } else {
          // Employee: load department name
          if (user.department_id) {
            const res = await api.get(`/departments/${user.department_id}`);
            setDepartmentName(res.data.name);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isAdmin, user.department_id]);

  const handleAsset = async () => {
    await new Promise((r) => setTimeout(r, 500));
    showToast('Asset registered successfully.', 'success');
    setActiveModal(null);
  };

  const handleBooking = async () => {
    await new Promise((r) => setTimeout(r, 500));
    showToast('Resource booked successfully.', 'success');
    setActiveModal(null);
  };

  // 1. ADMIN DASHBOARD VIEW
  if (isAdmin) {
    const adminKpis = [
      { label: 'Total Users', value: stats.total_users.toString(), change: 'Registered users', changeType: 'positive' },
      { label: 'Pending Approvals', value: stats.pending_approvals.toString(), change: 'Awaiting registration', changeType: 'neutral' },
      { label: 'Total Assets', value: stats.total_assets.toString(), change: 'Hardware items', changeType: 'positive' },
      { label: 'Available Assets', value: stats.available_assets.toString(), change: 'In storage', changeType: 'positive' },
    ];

    // Dummy utilization chart data
    const utilizationData = [
      { name: 'Engineering', active: 85, idle: 15 },
      { name: 'Design', active: 70, idle: 30 },
      { name: 'Marketing', active: 60, idle: 40 },
      { name: 'Operations', active: 90, idle: 10 },
    ];

    // Dummy maintenance chart data
    const maintenanceFrequencyData = [
      { name: 'Laptops', count: 12 },
      { name: 'Monitors', count: 4 },
      { name: 'Servers', count: 19 },
      { name: 'Printers', count: 6 },
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
            <UtilizationChart data={utilizationData} />
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
                  <ArrowRight size={14} className="text-text-secondary" />
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-danger/25 bg-danger-bg px-3.5 py-3">
              <p className="text-sm font-medium text-danger">3 assets overdue for return</p>
              <p className="mt-0.5 text-xs text-red-300/80">Flagged for follow-up with department leads.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="surface-card p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-text">Maintenance Frequency</h3>
            <MaintenanceFrequencyChart data={maintenanceFrequencyData} />
          </div>

          <div className="surface-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-text">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <div>
                    <p className="text-sm text-text">{a.text}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Modal
          open={activeModal === 'register'}
          onClose={() => setActiveModal(null)}
          title="Register New Asset"
          subtitle="Add a new asset to the directory"
        >
          <AssetForm onSubmit={handleAsset} onCancel={() => setActiveModal(null)} />
        </Modal>

        <Modal
          open={activeModal === 'book'}
          onClose={() => setActiveModal(null)}
          title="Book a Resource"
          subtitle="Reserve a room, vehicle, or equipment"
        >
          <BookingForm resource="Conference Room B2" onSubmit={handleBooking} onCancel={() => setActiveModal(null)} />
        </Modal>

        <Modal
          open={activeModal === 'raise'}
          onClose={() => setActiveModal(null)}
          title="Raise a Request"
          subtitle="Choose the type of request to raise"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {['Maintenance', 'Transfer', 'New Asset'].map((t) => (
              <button
                key={t}
                onClick={() => { setActiveModal(null); showToast(`${t} request started.`, 'info'); }}
                className="btn-secondary py-4 cursor-pointer"
              >
                {t}
              </button>
            ))}
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
            {[
              { id: 1, name: 'Dell Latitude Laptop', serial: 'SN-77291-DL', assigned: 'Jan 2026' },
              { id: 2, name: 'Dell 24" UltraSharp Monitor', serial: 'SN-88201-MN', assigned: 'Feb 2026' },
            ].map((asset) => (
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
          </div>

          {/* Quick actions for Employees */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => showToast('Asset requests are locked for Phase 1. Asset module will be added next.', 'info')}
              className="btn-primary cursor-pointer text-xs py-2 px-4"
            >
              Request New Asset
            </button>
            <button
              onClick={() => showToast('Issue reporting is locked for Phase 1. Maintenance request forms will be added next.', 'info')}
              className="btn-secondary cursor-pointer text-xs py-2 px-4"
            >
              Report Issue / Return Asset
            </button>
          </div>
        </div>
      </div>

      {/* Helpful links */}
      <div className="surface-card p-6">
        <h3 className="text-sm font-semibold text-text mb-2">Request History</h3>
        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          All your requests for hardware, transfers, or maintenance tickets are audited and visible. In Phase 1, you can view your assigned profile and department. Asset history audits will be unlocked in Phase 2.
        </p>
        <div className="border border-border/60 bg-bg-card p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-brand" />
          <span className="text-xs text-text">No active requests pending approval.</span>
        </div>
      </div>
    </div>
  );
}
