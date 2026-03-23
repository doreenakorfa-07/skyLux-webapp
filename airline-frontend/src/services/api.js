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

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('profilePictureUrl', response.data.profilePictureUrl || '');
    }
    return response.data;
  },
  signup: async (email, password) => {
    return await api.post('/auth/signup', { email, password });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('profilePictureUrl');
  }
};

export const userService = {
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
  book: (flightId, seatNumber, flightClass, paymentMethod) => 
    api.post('/bookings', { flightId, seatNumber, flightClass, paymentMethod }),
  getUserBookings: () => api.get('/bookings/user'),
  getOccupiedSeats: (flightId) => api.get(`/bookings/flight/${flightId}/seats`),
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`)
};

export const paymentService = {
  getUserPayments: () => api.get('/payments/user')
};

export default api;
