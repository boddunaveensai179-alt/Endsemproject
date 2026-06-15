import axios from 'axios';

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API service functions
export const authService = {
  login: (username, password) =>
    apiClient.post('/auth/login', { username, password }),
  logout: () => {
    localStorage.removeItem('token');
  },
};

export const bookService = {
  getAllBooks: () => apiClient.get('/books'),
  getBook: (id) => apiClient.get(`/books/${id}`),
  addBook: (bookData) => apiClient.post('/books', bookData),
  updateBook: (id, bookData) => apiClient.put(`/books/${id}`, bookData),
  deleteBook: (id) => apiClient.delete(`/books/${id}`),
};

export const searchService = {
  semanticSearch: (query) =>
    apiClient.post('/search/semantic', { query }),
};

export const dashboardService = {
  getDashboardStats: () => apiClient.get('/dashboard/stats'),
};

export default apiClient;
