import api from './api';

const auditService = {
  async getAuditCycles(params = {}) {
    const { data } = await api.get('/audits', { params });
    return data;
  },
  async getChecklist(auditId) {
    const { data } = await api.get(`/audits/${auditId}/checklist`);
    return data;
  },
  async verifyItem(auditId, itemId, payload) {
    const { data } = await api.patch(`/audits/${auditId}/items/${itemId}`, payload);
    return data;
  },
  async closeAudit(auditId) {
    const { data } = await api.post(`/audits/${auditId}/close`);
    return data;
  },
  async startAuditCycle(payload) {
    const { data } = await api.post('/audits', payload);
    return data;
  },
};

export default auditService;
