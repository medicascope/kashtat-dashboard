'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://api.kashtat.co/v2/admin';

export class CountryAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all countries
  static async getCountries() {
    try {
      const response = await fetch(`${API_BASE_URL}/countries`, {
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
          countries: data.countries || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      return {
        success: false,
        error: error.message,
        countries: []
      };
    }
  }

  // Get country by ID
  static async getCountryById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/countries/${id}`, {
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
          country: data.country,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching country:', error);
      return {
        success: false,
        error: error.message,
        country: null
      };
    }
  }

  // Create new country
  static async createCountry(name, code) {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('code', code);

      const headers = this.getHeaders();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/countries`, {
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
          country: data.country,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating country:', error);
      return {
        success: false,
        error: error.message,
        country: null
      };
    }
  }

  // Update country
  static async updateCountry(id, name, code) {
    try {
      const headers = {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${API_BASE_URL}/countries/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: name,
          code: code
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'object') {
        return {
          success: true,
          country: data.country,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating country:', error);
      return {
        success: false,
        error: error.message,
        country: null
      };
    }
  }

  // Delete country
  static async deleteCountry(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/countries/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (response.status === 204) {
        return {
          success: true,
          message: 'Country deleted successfully'
        };
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'Country deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting country:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 