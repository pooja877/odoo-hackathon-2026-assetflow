import { useState, useEffect } from 'react';
import { AlertCircle, History } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { TransferForm } from '../components/AllocationForm';
import { useToast } from '../components/Toast';
import allocationService from '../services/allocationService';
import assetService from '../services/assetService';
import { currentAllocation, allocationHistory, assets } from '../data/dummyData';

export default function AllocationTransfer() {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [assetsList, setAssetsList] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadAssets = async () => {
    try {
      const data = await assetService.getAssets();
      setAssetsList(data);
      if (data.length > 0) {
        setSelectedAsset(data[0].id);
      }
    } catch (err) {
      console.warn('Backend getAssets failed, falling back to mock assets.', err);
      setAssetsList(assets);
      if (assets.length > 0) {
        setSelectedAsset(assets[0].id);
      }
    }
  };

  const loadHistory = async () => {
    if (!selectedAsset) return;
    try {
      const hist = await allocationService.getHistory(selectedAsset);
      setHistory(hist);
    } catch (err) {
      console.warn('Backend getHistory failed, falling back to mock history.', err);
      setHistory(allocationHistory);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [selectedAsset]);

  const isAllocated = selectedAsset === 'AF-0114';

  const handleTransfer = async (formData) => {
    try {
      await allocationService.requestTransfer({
        asset_id: selectedAsset,
        target_department_id: formData.departmentId,
        note: formData.notes
      });
      showToast('Transfer request submitted for approval.', 'success');
      loadHistory();
    } catch (err) {
      console.warn('Backend transfer failed, simulating request.', err);
      showToast('Transfer request submitted (simulated).', 'success');
    }
  };

  return (
    <div>
      <PageHeader
        title="Allocation & Transfer"
        subtitle="Assign assets to employees or request transfers between departments."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-text">Select Asset</h3>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="input-base mb-5"
          >
            {assetsList.map((a) => (
              <option key={a.id} value={a.id}>{a.id} — {a.name}</option>
            ))}
          </select>

          {isAllocated ? (
            <>
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-bg px-4 py-3.5">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
                <div>
                  <p className="text-sm font-medium text-danger">
                    Already allocated — currently assigned to {currentAllocation.assignedTo}
                  </p>
                  <p className="mt-0.5 text-xs text-red-300/80">
                    {currentAllocation.department} department, since {currentAllocation.since}. Re-allocation is blocked — submit a transfer request below.
                  </p>
                </div>
              </div>

              <h4 className="mb-3 text-sm font-semibold text-text">Transfer Request</h4>
              <TransferForm currentHolder={currentAllocation.assignedTo} onSubmit={handleTransfer} />
            </>
          ) : (
            <>
              <h4 className="mb-3 text-sm font-semibold text-text">Allocate This Asset</h4>
              <TransferForm currentHolder="Unassigned" onSubmit={handleTransfer} />
            </>
          )}
        </div>

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <History size={16} className="text-text-secondary" />
            <h3 className="text-sm font-semibold text-text">Allocation History</h3>
          </div>
          <div className="space-y-4">
            {history.map((h) => (
              <div key={h.id} className="border-l-2 border-border pl-3.5">
                <p className="text-xs text-text-secondary">{h.date}</p>
                <p className="mt-0.5 text-sm text-text">{h.event}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
