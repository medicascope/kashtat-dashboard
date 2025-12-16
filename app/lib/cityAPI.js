'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://api.kashtat.co/v2/admin';

export class CityAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all cities
  static async getCities(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sort) queryParams.append('sort', filters.sort);
      
      const url = `${API_BASE_URL}/cities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          cities: data.data.cities || [],
          pagination: data.data.pagination || {},
          message: data.message || 'Cities retrieved successfully'
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
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          city: data.data.city,
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
  static async createCity(name, code, area = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/cities`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          code,
          area
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
          city: null
        };
      }

      if (data.success && data.data) {
        return {
          success: true,
          city: data.data.city,
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
  static async updateCity(id, name, code, area = null) {
    try {
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (code !== undefined) updateData.code = code;
      if (area !== undefined) updateData.area = area;

      const response = await fetch(`${API_BASE_URL}/cities/${id}`, {
        method: 'PUT',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
          city: null
        };
      }

      if (data.success && data.data) {
        return {
          success: true,
          city: data.data.city,
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
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`
        };
      }

      return {
        success: true,
        message: data.message || 'City deleted successfully'
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