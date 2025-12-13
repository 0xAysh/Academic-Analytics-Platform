'use strict';

import { isAuthPage, redirectToLogin } from '../utils/routing.js';

const API_BASE_URL = '/api';

class ApiClient {
  getToken() {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('[API] Error reading authToken from localStorage:', error);
      return null;
    }
  }

  setToken(token) {
    try {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('[API] Error storing authToken in localStorage:', error);
    }
  }

  handleUnauthorized() {
    this.setToken(null);
    redirectToLogin();
  }

  /**
   * @param {string} endpoint
   * @param {object} options
   * @returns {Promise<object>}
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error('Invalid JSON response from server');
        }
      } else {
        const text = await response.text();
        if (response.status === 401) {
          this.handleUnauthorized();
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        if (response.status === 401) {
          console.error('[API] 401 Unauthorized - token may be invalid/expired');
          console.error('[API] Endpoint:', endpoint);
          console.error('[API] Response data:', data);
          
          if (endpoint.includes('/auth/password')) {
            console.warn('[API] Got 401 on password change endpoint - this is unexpected, treating as error');
            throw new Error(data.error || 'Authentication failed. Please check your current password.');
          }
          
          this.handleUnauthorized();
          throw new Error(data.error || 'Authentication failed. Please log in again.');
        }
        console.log(`[API] Request failed with status ${response.status} for endpoint ${endpoint}`);
        console.log('[API] Error data:', data);
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * @param {string} endpoint
   * @returns {Promise<object>}
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * @param {string} endpoint
   * @param {object} body
   * @returns {Promise<object>}
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * @param {string} endpoint
   * @param {object} body
   * @returns {Promise<object>}
   */
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * @param {string} endpoint
   * @returns {Promise<object>}
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
