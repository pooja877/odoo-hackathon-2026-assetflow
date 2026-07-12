import api from './api';

const reportService = {
  async getUtilization(params = {}) {
    const { data } = await api.get('/reports/utilization', { params });
    return data;
  },
  async getMaintenanceFrequency(params = {}) {
    const { data } = await api.get('/reports/maintenance-frequency', { params });
    return data;
  },
  async getDepartmentAllocation(params = {}) {
    const { data } = await api.get('/reports/department-allocation', { params });
    return data;
  },
  async getBookingHeatmap(params = {}) {
    const { data } = await api.get('/reports/booking-heatmap', { params });
    return data;
  },
  async exportReport(type) {
    const { data } = await api.get(`/reports/export`, { params: { type }, responseType: 'blob' });
    return data;
  },
};

export default reportService;
