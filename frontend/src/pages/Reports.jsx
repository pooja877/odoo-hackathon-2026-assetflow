import { Download } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {
  UtilizationChart,
  MaintenanceFrequencyChart,
  DepartmentAllocationChart,
  BookingHeatmap,
} from '../components/Charts';
import { useToast } from '../components/Toast';
import {
  utilizationData,
  maintenanceFrequencyData,
  departmentAllocationData,
  bookingHeatmapData,
  mostUsedAssets,
  idleAssets,
  dueForMaintenance,
} from '../data/dummyData';

export default function Reports() {
  const { showToast } = useToast();

  const handleExport = () => {
    showToast('Report export started — you will be notified when ready.', 'info');
  };

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Utilization, maintenance trends, and booking patterns across your organization."
        actions={
          <button onClick={handleExport} className="btn-primary">
            <Download size={16} /> Export Report
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">Utilization by Department</h3>
          <UtilizationChart data={utilizationData} />
        </div>
        <div className="surface-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">Maintenance Frequency</h3>
          <MaintenanceFrequencyChart data={maintenanceFrequencyData} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">Department Allocation</h3>
          <DepartmentAllocationChart data={departmentAllocationData} />
        </div>
        <div className="surface-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">Booking Heatmap</h3>
          <BookingHeatmap data={bookingHeatmapData} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-text">Most Used Assets</h4>
          <div className="space-y-3">
            {mostUsedAssets.map((a) => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <span className="text-text">{a.name}</span>
                <span className="text-xs text-text-secondary">{a.usage}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="surface-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-text">Idle Assets</h4>
          <div className="space-y-3">
            {idleAssets.map((a) => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <span className="text-text">{a.name}</span>
                <span className="text-xs text-warning">{a.usage}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="surface-card p-5">
          <h4 className="mb-3 text-sm font-semibold text-text">Due for Maintenance / Nearing Retirement</h4>
          <div className="space-y-3">
            {dueForMaintenance.map((a) => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <span className="text-text">{a.name}</span>
                <span className="text-xs text-danger">{a.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
