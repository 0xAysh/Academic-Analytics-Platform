'use strict';

import { isAuthPage, redirectToLogin } from '../utils/routing.js';

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
    } catch (error) {
      console.error('[API] Error reading authToken from localStorage:', error);
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
    } catch (error) {
      console.error('[API] Error storing authToken in localStorage:', error);
    }
  }

  /**
   * Handle 401 unauthorized response
   * Clears token and redirects to login if not on auth page
   */
  handleUnauthorized() {
    this.setToken(null);
    redirectToLogin();
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
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error('Invalid JSON response from server');
        }
      } else {
        // Non-JSON response (e.g., HTML error page)
        const text = await response.text();
        // If token is invalid, clear it and redirect
        if (response.status === 401) {
          this.handleUnauthorized();
        }
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        // If token is invalid, clear it and redirect
        if (response.status === 401) {
          this.handleUnauthorized();
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

