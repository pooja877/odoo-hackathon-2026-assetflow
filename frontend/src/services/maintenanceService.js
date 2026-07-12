import api from './api';

const maintenanceService = {
  async getTickets(params = {}) {
    const { data } = await api.get('/maintenance', { params });
    return data;
  },
  async createTicket(payload) {
    const { data } = await api.post('/maintenance', payload);
    return data;
  },
  async updateTicketStatus(id, status) {
    const { data } = await api.patch(`/maintenance/${id}/status`, { status });
    return data;
  },
  async assignTechnician(id, technicianId) {
    const { data } = await api.patch(`/maintenance/${id}/assign`, { technicianId });
    return data;
  },
};

export default maintenanceService;
