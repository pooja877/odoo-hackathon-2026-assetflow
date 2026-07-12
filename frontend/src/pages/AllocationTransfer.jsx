import { useState, useEffect } from 'react';
import { AlertCircle, History, RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { AllocationForm, TransferForm } from '../components/AllocationForm';
import { useToast } from '../components/Toast';
import allocationService from '../services/allocationService';
import assetService from '../services/assetService';
import api from '../services/api';

export default function AllocationTransfer() {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [assetsList, setAssetsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetsData, usersData, deptsData] = await Promise.all([
        assetService.getAssets(),
        api.get('/users'),
        api.get('/departments')
      ]);
      setAssetsList(assetsData);
      setUsersList(usersData.data);
      setDepartmentsList(deptsData.data);
      
      if (assetsData.length > 0) {
        setSelectedAsset(assetsData[0].id);
      }
    } catch (err) {
      showToast('Failed to load allocation options from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!selectedAsset) return;
    try {
      const hist = await allocationService.getHistory(selectedAsset);
      setHistory(hist);
    } catch (err) {
      showToast('Failed to load allocation history.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [selectedAsset]);

  const activeAssetObj = assetsList.find(a => String(a.id) === String(selectedAsset));
  const isAllocated = activeAssetObj?.status === 'Allocated';
  const activeAssetDeptName = activeAssetObj?.department_id 
    ? departmentsList.find(d => d.id === activeAssetObj.department_id)?.name || 'Assigned Department'
    : 'Unassigned';

  const handleAllocate = async (payload) => {
    try {
      await api.post('/allocations', {
        asset_id: parseInt(selectedAsset),
        user_id: payload.user_id,
        department_id: payload.department_id,
        expected_return_date: payload.expected_return_date
      });
      showToast('Asset allocated successfully.', 'success');
      loadData();
      loadHistory();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to allocate asset.', 'error');
    }
  };

  const handleTransfer = async (payload) => {
    try {
      await allocationService.requestTransfer({
        asset_id: selectedAsset,
        target_department_id: payload.target_department_id,
        note: payload.note
      });
      showToast('Transfer request submitted successfully.', 'success');
      loadHistory();
    } catch (err) {
      showToast(err.message || 'Failed to submit transfer request.', 'error');
    }
  };

  const handleReturn = async () => {
    // Find active allocation for this asset
    const activeAlloc = history.find(h => h.status === 'Allocated' || h.status === 'Transfer Pending');
    if (!activeAlloc) {
      showToast('No active allocation found to return.', 'error');
      return;
    }
    try {
      await allocationService.returnAsset(activeAlloc.id, { return_condition: 'Good' });
      showToast('Asset check-in returned successfully.', 'success');
      loadData();
      loadHistory();
    } catch (err) {
      showToast('Failed to check in returned asset.', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Allocation & Transfer"
        subtitle="Assign assets to employees or request transfers between departments."
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <span className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="surface-card p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-text">Select Asset</h3>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="input-base mb-5"
            >
              {assetsList.map((a) => (
                <option key={a.id} value={a.id}>{a.asset_tag || a.id} — {a.name} ({a.status})</option>
              ))}
            </select>

            {isAllocated ? (
              <>
                <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-danger/30 bg-danger-bg px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" />
                    <div>
                      <p className="text-sm font-medium text-danger">
                        Already allocated ({activeAssetDeptName}).
                      </p>
                      <p className="mt-0.5 text-xs text-red-300/80">
                        Direct allocation is blocked. Submit a transfer request or check in the asset.
                      </p>
                    </div>
                  </div>
                  <button onClick={handleReturn} className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer border-danger/40 hover:bg-danger/10 text-danger">
                    <RotateCcw size={12} /> Check In Asset
                  </button>
                </div>

                <h4 className="mb-3 text-sm font-semibold text-text">Transfer Request</h4>
                <TransferForm currentHolder={activeAssetDeptName} departments={departmentsList} onSubmit={handleTransfer} />
              </>
            ) : (
              <>
                <h4 className="mb-3 text-sm font-semibold text-text">Allocate This Asset</h4>
                <AllocationForm users={usersList} departments={departmentsList} onSubmit={handleAllocate} />
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
                  <p className="text-xs text-text-secondary">
                    {h.allocated_at ? new Date(h.allocated_at).toLocaleDateString() : '—'}
                  </p>
                  <p className="mt-0.5 text-sm text-text">Status: {h.status}</p>
                  {h.returned_at && (
                    <p className="text-xs text-text-secondary">Returned: {new Date(h.returned_at).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs text-slate-500">No allocation history for this asset.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
