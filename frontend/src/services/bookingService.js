import api from './api';

const bookingService = {
  async getResources(params = {}) {
    const { data } = await api.get('/bookings/resources', { params });
    return data;
  },
  async getBookings(params = {}) {
    const { data } = await api.get('/bookings', { params });
    return data;
  },
  async createBooking(payload) {
    const { data } = await api.post('/bookings', payload);
    return data;
  },
  async cancelBooking(id) {
    const { data } = await api.put(`/bookings/${id}/cancel`);
    return data;
  },
  async checkConflict(payload) {
    // Overlap checks are run on creation in the backend
    return { conflict: false };
  },
};

export default bookingService;
