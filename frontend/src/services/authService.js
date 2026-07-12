import api from './api';

const authService = {
  async login(email, password) {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const loginRes = await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokenData = loginRes.data;
    localStorage.setItem('assetflow_token', tokenData.access_token);

    // Fetch user details using the newly stored token
    const meRes = await api.get('/auth/me');
    const user = meRes.data;
    localStorage.setItem('assetflow_user', JSON.stringify(user));

    return {
      token: tokenData.access_token,
      user: user,
    };
  },

  async register(payload) {
    // Translate payload structure to the backend's UserCreate schema
    const response = await api.post('/auth/signup', {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role || 'Employee',
      designation: payload.designation || null,
      department_id: payload.department_id ? parseInt(payload.department_id) : null,
    });
    return response.data;
  },

  async forgotPassword(email) {
    // Return dummy response since forgot-password is not in Phase 1 backend
    return { message: 'If this email exists, a password reset link has been sent.' };
  },

  logout() {
    localStorage.removeItem('assetflow_token');
    localStorage.removeItem('assetflow_user');
  },

  getCurrentUser() {
    const raw = localStorage.getItem('assetflow_user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem('assetflow_token'));
  },
};

export default authService;
