import api from './api';

const allocationService = {
  async getAllocations(params = {}) {
    const { data } = await api.get('/allocations', { params });
    return data;
  },
  async allocateAsset(payload) {
    const { data } = await api.post('/allocations', payload);
    return data;
  },
  async requestTransfer(payload) {
    const { data } = await api.post('/allocations/transfer', payload);
    return data;
  },
  async getHistory(assetId) {
    const { data } = await api.get(`/allocations/history/${assetId}`);
    return data;
  },
  async returnAsset(id, payload) {
    const { data } = await api.post(`/allocations/${id}/return`, payload);
    return data;
  },
};

export default allocationService;
