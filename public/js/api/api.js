'use strict';

const API_BASE_URL = '/api';

/**
 * Base API client with fetch wrapper
 */
class ApiClient {
  /**
   * Get JWT token from localStorage
   */
  getToken() {
    try {
      return localStorage.getItem('authToken');
    } catch (e) {
      return null;
    }
  }

  /**
   * Set JWT token in localStorage
   */
  setToken(token) {
    try {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Make API request
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
      const data = await response.json();

      if (!response.ok) {
        // If token is invalid, clear it
        if (response.status === 401) {
          this.setToken(null);
          // Redirect to login if not already on auth page
          const path = window.location.pathname || '';
          const isAuthPage = /\/html\/(login|signup)\.html$/.test(path);
          if (!isAuthPage) {
            window.location.href = '/html/login.html';
          }
        }
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const api = new ApiClient();

