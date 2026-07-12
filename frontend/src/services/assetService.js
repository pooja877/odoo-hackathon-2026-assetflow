import api from './api';

const assetService = {
  async getAssets(params = {}) {
    const { data } = await api.get('/assets', { params });
    return data;
  },
  async getAsset(id) {
    const { data } = await api.get(`/assets/${id}`);
    return data;
  },
  async createAsset(payload) {
    const { data } = await api.post('/assets', payload);
    return data;
  },
  async updateAsset(id, payload) {
    const { data } = await api.put(`/assets/${id}`, payload);
    return data;
  },
  async deleteAsset(id) {
    const { data } = await api.delete(`/assets/${id}`);
    return data;
  },
  async getCategories() {
    const { data } = await api.get('/assets/categories');
    return data;
  },
};

export default assetService;
