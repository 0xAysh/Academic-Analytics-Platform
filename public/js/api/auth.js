'use strict';

import { api } from './api.js';

/**
 * Register a new user
 */
export async function register(email, password, name) {
  const response = await api.post('/auth/register', {
    email,
    password,
    name
  });
  
  if (response.success && response.data.token) {
    api.setToken(response.data.token);
  }
  
  return response;
}

/**
 * Login user
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  
  if (response.success && response.data.token) {
    api.setToken(response.data.token);
  }
  
  return response;
}

/**
 * Logout user
 */
export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Continue even if API call fails
  }
  api.setToken(null);
}

