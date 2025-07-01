'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://app.kashtat.co/api/admin/v1';

export class PartnerAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all partners
  static async getPartners() {
    try {
      const response = await fetch(`${API_BASE_URL}/partners`, {
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
          partners: data.partners || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      return {
        success: false,
        error: error.message,
        partners: []
      };
    }
  }

  // Get partner by ID
  static async getPartnerById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/partners/${id}`, {
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
          partner: data.partner,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching partner:', error);
      return {
        success: false,
        error: error.message,
        partner: null
      };
    }
  }

  // Create new partner
  static async createPartner(name, email, phone, site, imageFile = null) {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('site', site);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const headers = this.getHeaders();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/partners`, {
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
          partner: data.partner,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating partner:', error);
      return {
        success: false,
        error: error.message,
        partner: null
      };
    }
  }

  // Update partner
  static async updatePartner(id, name, email, phone, site, imageFile = null) {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('site', site);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const headers = this.getHeaders();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/partners/${id}`, {
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
          partner: data.partner,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating partner:', error);
      return {
        success: false,
        error: error.message,
        partner: null
      };
    }
  }

  // Delete partner
  static async deletePartner(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/partners/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (response.status === 204) {
        return {
          success: true,
          message: 'Partner deleted successfully'
        };
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'Partner deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting partner:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 