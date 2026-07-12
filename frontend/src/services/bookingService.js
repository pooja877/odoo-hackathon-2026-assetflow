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
    const { data } = await api.delete(`/bookings/${id}`);
    return data;
  },
  async checkConflict(payload) {
    const { data } = await api.post('/bookings/check-conflict', payload);
    return data;
  },
};

export default bookingService;
