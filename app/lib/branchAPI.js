'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://app.kashtat.co/api/admin/v1';

export class BranchAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all branches
  static async getBranches(filters = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/branches${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'object') {
        return {
          success: true,
          branches: data.branches || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      return {
        success: false,
        error: error.message,
        branches: []
      };
    }
  }

  // Get branch by ID
  static async getBranchById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'object') {
        return {
          success: true,
          branch: data.branch,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching branch:', error);
      return {
        success: false,
        error: error.message,
        branch: null
      };
    }
  }

  // Create new branch
  static async createBranch(name, partnerId, cityId, lat, lng) {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('partner_id', partnerId);
      formData.append('city_id', cityId);
      formData.append('lat', lat);
      formData.append('lng', lng);

      const headers = this.getHeaders();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/branches`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'object') {
        return {
          success: true,
          branch: data.branch,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      return {
        success: false,
        error: error.message,
        branch: null
      };
    }
  }

  // Update branch
  static async updateBranch(id, name, partnerId, cityId, lat, lng) {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('partner_id', partnerId);
      formData.append('city_id', cityId);
      formData.append('lat', lat);
      formData.append('lng', lng);

      const headers = this.getHeaders();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
        method: 'POST', // API uses POST for updates
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'object') {
        return {
          success: true,
          branch: data.branch,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating branch:', error);
      return {
        success: false,
        error: error.message,
        branch: null
      };
    }
  }

  // Delete branch
  static async deleteBranch(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (response.status === 204) {
        return {
          success: true,
          message: 'Branch deleted successfully'
        };
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'Branch deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting branch:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 