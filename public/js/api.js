// public/js/api.js - COMPLETE REPLACEMENT FOR ALL 5 FILES
'use strict';

// ============================================
// CONFIGURATION
// ============================================
const API_BASE = '/api';

// ============================================
// TOKEN & USER MANAGEMENT
// ============================================
export function getToken() {
  return localStorage.getItem('authToken');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  }
}

export function getUser() {
  const data = localStorage.getItem('userInfo');
  return data ? JSON.parse(data) : null;
}

export function setUser(user) {
  if (user) {
    localStorage.setItem('userInfo', JSON.stringify(user));
  } else {
    localStorage.removeItem('userInfo');
  }
}

// ============================================
// CORE API REQUEST FUNCTION
// ============================================
async function request(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(API_BASE + endpoint, config);
  const data = await response.json();

  // Handle 401 - redirect to login (unless already on login page)
  if (response.status === 401) {
    const isLoginPage = window.location.pathname.includes('login');
    if (!isLoginPage) {
      setToken(null);
      window.location.href = '/html/login.html';
    }
    throw new Error(data.error || 'Please log in');
  }

  // Handle other errors
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// ============================================
// API METHODS
// ============================================
export const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' })
};

// ============================================
// AUTH FUNCTIONS
// ============================================
export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  if (response.success) {
    setToken(response.data.token);
    setUser(response.data.user);
  }
  return response;
}

export async function register(email, password, name) {
  const response = await api.post('/auth/register', { email, password, name });
  if (response.success) {
    setToken(response.data.token);
    setUser(response.data.user);
  }
  return response;
}

export async function logout() {
  setToken(null);
  setUser(null);
  // Optionally notify server (fire and forget)
  api.post('/auth/logout').catch(() => {});
}

export async function updateProfile(data) {
  const response = await api.put('/auth/profile', data);
  if (response.success) {
    setUser(response.data.user);
  }
  return response;
}

export async function changePassword(currentPassword, newPassword) {
  return api.put('/auth/password', { currentPassword, newPassword });
}

// ============================================
// TRANSCRIPT FUNCTIONS
// ============================================
export async function getTranscript() {
  const response = await api.get('/transcripts');
  return response.data;
}

export async function saveTranscript(data) {
  const response = await api.post('/transcripts', data);
  return response.data;
}

export async function updateTranscript(data) {
  const response = await api.put('/transcripts', data);
  return response.data;
}

// ============================================
// AUTH CHECK (for protected pages)
// ============================================
export function requireAuth() {
  if (!getToken()) {
    window.location.href = '/html/login.html';
    return false;
  }
  return true;
}