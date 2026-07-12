import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {
  UtilizationChart,
  MaintenanceFrequencyChart,
  DepartmentAllocationChart,
  BookingHeatmap,
} from '../components/Charts';
import { useToast } from '../components/Toast';
import reportService from '../services/reportService';
import assetService from '../services/assetService';

export default function Reports() {
  const [dataUtil, setDataUtil] = useState([]);
  const [dataMaint, setDataMaint] = useState([]);
  const [dataAlloc, setDataAlloc] = useState([]);
  const [dataHeat, setDataHeat] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadReports = async () => {
    setLoading(true);
    try {
      const [resUtil, resMaint, resAlloc, resHeat, resAssets] = await Promise.all([
        reportService.getUtilization(),
        reportService.getMaintenanceFrequency(),
        reportService.getDepartmentAllocation(),
        reportService.getBookingHeatmap(),
        assetService.getAssets()
      ]);
      setDataUtil(resUtil);
      setDataMaint(resMaint);
      setDataAlloc(resAlloc);
      setDataHeat(resHeat);
      setAssets(resAssets);
    } catch (err) {
      showToast('Failed to load reports from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleExport = async (format) => {
    try {
      const data = await reportService.exportReport(format);
      const blobType = format === 'pdf' ? 'application/pdf' : 'text/csv';
      const fileBlob = new Blob([data], { type: blobType });
      const downloadUrl = window.URL.createObjectURL(fileBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.setAttribute('download', `asset_report.${format}`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast(`${format.toUpperCase()} report downloaded successfully.`, 'success');
    } catch (err) {
      showToast(`Failed to export ${format.toUpperCase()} report.`, 'error');
    }
  };

  // Derive top asset listings dynamically from the database
  const dynamicMostUsed = assets
    .filter(a => a.status === 'Allocated')
    .slice(0, 3)
    .map(a => ({ name: a.name, usage: 'Active' }));

  const dynamicIdle = assets
    .filter(a => a.status === 'Available')
    .slice(0, 3)
    .map(a => ({ name: a.name, note: 'Idle' }));

  const dynamicDueMaint = assets
    .filter(a => a.status === 'Under Maintenance' || a.condition === 'Fair')
    .slice(0, 3)
    .map(a => ({ name: a.name, note: a.status }));

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Utilization, maintenance trends, and booking patterns across your organization."
        actions={
          <div className="flex gap-2">
            <button onClick={() => handleExport('csv')} className="btn-secondary flex items-center gap-1.5 cursor-pointer text-xs py-2 px-3">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="btn-primary flex items-center gap-1.5 cursor-pointer text-xs py-2 px-3">
              <Download size={14} /> Export PDF
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <span className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="surface-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-text">Utilization by Department</h3>
              <UtilizationChart data={dataUtil} />
            </div>
            <div className="surface-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-text">Maintenance Frequency</h3>
              <MaintenanceFrequencyChart data={dataMaint} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="surface-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-text">Department Allocation</h3>
              <DepartmentAllocationChart data={dataAlloc} />
            </div>
            <div className="surface-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-text">Booking Heatmap</h3>
              <BookingHeatmap data={dataHeat} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Most-Used Assets', data: dynamicMostUsed, defaultText: 'No allocated assets.' },
              { label: 'Idle Assets', data: dynamicIdle, defaultText: 'No idle assets.' },
              { label: 'Due for Maintenance', data: dynamicDueMaint, defaultText: 'No assets requiring repair.' },
            ].map(({ label, data, defaultText }) => (
              <div key={label} className="surface-card p-5">
                <h4 className="mb-3 text-sm font-semibold text-text">{label}</h4>
                <div className="space-y-2.5">
                  {data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-bg-surface px-3 py-2.5">
                      <span className="text-xs font-semibold text-text truncate max-w-[130px]">{item.name}</span>
                      <span className="text-[10px] text-text-secondary bg-white/5 px-2 py-0.5 rounded-full capitalize">
                        {item.usage || item.note}
                      </span>
                    </div>
                  ))}
                  {data.length === 0 && (
                    <p className="text-xs text-gray-500 py-3 text-center">{defaultText}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
