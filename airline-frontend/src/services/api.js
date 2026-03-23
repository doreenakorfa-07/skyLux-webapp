import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post('http://localhost:8080/api/auth/refresh-token', { refreshToken });
        if (res.status === 200) {
          localStorage.setItem('token', res.data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('username', response.data.username || '');
      localStorage.setItem('profilePictureUrl', response.data.profilePictureUrl || '');
    }
    return response.data;
  },
  signup: async (signUpData) => {
    return await api.post('/auth/signup', signUpData);
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('profilePictureUrl');
  }
};

export const userService = {
  getUserProfile: () => api.get('/users/me'),
  updateUserProfile: (updates) => api.patch('/users/me', updates),
  uploadProfilePicture: (formData) => api.post('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const flightService = {
  getAll: () => api.get('/flights'),
  getById: (id) => api.get(`/flights/${id}`),
  search: (origin, destination, date) => 
    api.get(`/flights/search?origin=${origin}&destination=${destination}&date=${date}`),
  add: (flight) => api.post('/flights', flight),
  delete: (id) => api.delete(`/flights/${id}`)
};

export const bookingService = {
  book: (flightId, numSeats, flightClass, paymentMethod) => 
    api.post('/bookings', { flightId, numSeats, flightClass, paymentMethod }),
  getUserBookings: () => api.get('/bookings/user'),
  getOccupiedSeats: (flightId) => api.get(`/bookings/flight/${flightId}/seats`),
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`)
};

export const paymentService = {
  getUserPayments: () => api.get('/payments/user')
};

export const adminService = {
  getAllUsers:    () => api.get('/users/all'),
  getAllBookings: () => api.get('/bookings/all'),
  blockUser:     (id) => api.patch(`/users/${id}/block`),
};

export default api;
