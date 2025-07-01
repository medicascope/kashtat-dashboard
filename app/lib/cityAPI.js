'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://app.kashtat.co/api/admin/v1';

export class CityAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all cities (optionally filtered by country)
  static async getCities(countryId = null) {
    try {
      let url = `${API_BASE_URL}/cities`;
      if (countryId) {
        url += `?country_id=${countryId}`;
      }

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
          cities: data.cities || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      return {
        success: false,
        error: error.message,
        cities: []
      };
    }
  }

  // Get city by ID
  static async getCityById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
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
          city: data.city,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching city:', error);
      return {
        success: false,
        error: error.message,
        city: null
      };
    }
  }

  // Create new city
  static async createCity(name, code, countryId) {
    try {
      const headers = {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${API_BASE_URL}/cities`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: name,
          code: code,
          country_id: countryId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'object') {
        return {
          success: true,
          city: data.city,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating city:', error);
      return {
        success: false,
        error: error.message,
        city: null
      };
    }
  }

  // Update city
  static async updateCity(id, name, code) {
    try {
      const headers = {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
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
          city: data.city,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating city:', error);
      return {
        success: false,
        error: error.message,
        city: null
      };
    }
  }

  // Delete city
  static async deleteCity(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (response.status === 204) {
        return {
          success: true,
          message: 'City deleted successfully'
        };
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'City deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting city:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 