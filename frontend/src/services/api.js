import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Endpoints that are allowed to return 401 without triggering global logout.
// Secondary/optional services should be listed here.
const SOFT_FAIL_ENDPOINTS = [
  '/notifications',
  '/search',
  '/activity',
  '/recommendations',
];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !window.location.pathname.includes('/login')
    ) {
      const url = error.config?.url || '';
      const isSoftEndpoint = SOFT_FAIL_ENDPOINTS.some(e => url.includes(e));

      // Only force-logout for CORE protected endpoints, not optional ones.
      // This prevents notification/activity 401s from kicking the user out.
      if (!isSoftEndpoint) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const storeAuth = (authResponse) => {
  if (!authResponse?.token) {
    return null;
  }

  const user = {
    id: authResponse.id,
    name: authResponse.name,
    email: authResponse.email || authResponse.username,
    role: authResponse.role,
  };

  localStorage.setItem('authToken', authResponse.token);
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
};

export const getErrorMessage = (error, fallback = 'Something went wrong') => (
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.error ||
  error?.message ||
  fallback
);

export const loginUser = async (credentials) => {
  // Support both {email, password} and {usernameOrEmail, password}
  const payload = {
    usernameOrEmail: credentials.usernameOrEmail || credentials.email,
    password: credentials.password,
  };
  const response = await apiClient.post('/auth/login', payload);
  const user = storeAuth(response.data);

  if (user) {
    createActivityLog({
      userId: String(user.id),
      action: 'LOGIN',
      description: `${user.email} logged in`,
    }).catch(() => {});
  }

  return user;
};


export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const logout = () => {
  const user = getCurrentUser();
  if (user) {
    createActivityLog({
      userId: String(user.id),
      action: 'LOGOUT',
      description: `${user.email} logged out`,
    }).catch(() => {});
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  // Decode JWT payload to check expiry
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      // Malformed token — clear but don't crash
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      return false;
    }
    // Pad base64 string if necessary
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    const exp = payload.exp;
    // Give a 10-second grace buffer to avoid edge-case race conditions on page load
    if (exp && (Date.now() / 1000) >= (exp + 10)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      return false;
    }
    return true;
  } catch {
    // JSON parse or atob failed — token is corrupt but don't clear it
    // (might be a temporary decode issue). Only clear if token definitely missing.
    return !!localStorage.getItem('authToken');
  }
};


export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const isAdmin = () => {
  const role = getCurrentUser()?.role;
  return role === 'ADMIN' || role === 'ROLE_ADMIN';
};

export const isUser = () => {
  const role = getCurrentUser()?.role;
  return role === 'USER' || role === 'ROLE_USER';
};

export const getAllBooks = async () => {
  const response = await apiClient.get('/books');
  return response.data;
};

export const getBookById = async (bookId) => {
  const response = await apiClient.get(`/books/${bookId}`);
  return response.data;
};

export const addBook = async (bookData) => {
  const response = await apiClient.post('/books', bookData);
  return response.data;
};

export const updateBook = async (bookId, bookData) => {
  const response = await apiClient.put(`/books/${bookId}`, bookData);
  return response.data;
};

export const deleteBook = async (bookId) => {
  const response = await apiClient.delete(`/books/${bookId}`);
  return response.data;
};

export const getAllBorrows = async () => {
  const response = await apiClient.get('/borrows');
  return response.data;
};

// Fetch borrows for a specific user — used by MyBorrows page and BookListing (USER role)
export const getUserBorrows = async (userId) => {
  const response = await apiClient.get(`/borrows/user/${userId}`);
  return response.data;
};

export const getBorrowById = async (borrowId) => {
  const response = await apiClient.get(`/borrows/${borrowId}`);
  return response.data;
};

export const createBorrow = async (borrowData) => {
  const response = await apiClient.post('/borrows', borrowData);
  return response.data;
};

export const updateBorrow = async (borrowId, borrowData) => {
  const response = await apiClient.put(`/borrows/${borrowId}`, borrowData);
  return response.data;
};

export const deleteBorrow = async (borrowId) => {
  const response = await apiClient.delete(`/borrows/${borrowId}`);
  return response.data;
};

export const createSearchHistory = async (searchData) => {
  const response = await apiClient.post('/search', searchData);
  return response.data;
};

export const getSearchHistory = async (userId) => {
  const response = await apiClient.get('/search', { params: userId ? { userId } : {} });
  return response.data;
};

export const updateSearchHistory = async (id, searchData) => {
  const response = await apiClient.put(`/search/${id}`, searchData);
  return response.data;
};

export const deleteSearchHistory = async (id) => {
  const response = await apiClient.delete(`/search/${id}`);
  return response.data;
};

export const createActivityLog = async (activityData) => {
  const response = await apiClient.post('/activity', activityData);
  return response.data;
};

export const getActivityLogs = async (userId) => {
  const response = await apiClient.get('/activity', { params: userId ? { userId } : {} });
  return response.data;
};

export const updateActivityLog = async (id, activityData) => {
  const response = await apiClient.put(`/activity/${id}`, activityData);
  return response.data;
};

export const deleteActivityLog = async (id) => {
  const response = await apiClient.delete(`/activity/${id}`);
  return response.data;
};

export const createRecommendation = async (recommendationData) => {
  const response = await apiClient.post('/recommendations', recommendationData);
  return response.data;
};

export const getRecommendations = async (userId) => {
  const response = await apiClient.get('/recommendations', { params: userId ? { userId } : {} });
  return response.data;
};

export const updateRecommendation = async (id, recommendationData) => {
  const response = await apiClient.put(`/recommendations/${id}`, recommendationData);
  return response.data;
};

export const deleteRecommendation = async (id) => {
  const response = await apiClient.delete(`/recommendations/${id}`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await apiClient.post('/users', userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

export const getNotifications = async () => {
  const response = await apiClient.get('/notifications');
  return response.data;
};

const apiServices = {
  loginUser,
  registerUser,
  logout,
  isAuthenticated,
  getCurrentUser,
  isAdmin,
  isUser,
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  getAllBorrows,
  getBorrowById,
  createBorrow,
  updateBorrow,
  deleteBorrow,
  createSearchHistory,
  getSearchHistory,
  updateSearchHistory,
  deleteSearchHistory,
  createActivityLog,
  getActivityLogs,
  updateActivityLog,
  deleteActivityLog,
  createRecommendation,
  getRecommendations,
  updateRecommendation,
  deleteRecommendation,
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  getUserBorrows,
  getNotifications,
  getErrorMessage,
};

export default apiServices;
