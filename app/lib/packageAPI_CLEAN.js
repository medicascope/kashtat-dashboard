'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://api.kashtat.co/v2/admin';

export class PackageAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get all packages with filters
  static async getPackages(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/packages${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Return raw API data - no transformation
        return {
          success: true,
          packages: data.data.packages || [],
          pagination: data.data.pagination || {},
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      return {
        success: false,
        error: error.message,
        packages: []
      };
    }
  }

  // Get package by ID
  static async getPackageById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Return raw package data
        return {
          success: true,
          package: data.data.package || data.data,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      return {
        success: false,
        error: error.message,
        package: null
      };
    }
  }

  // Get popular packages
  static async getPopularPackages() {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/popular`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          packages: data.data.packages || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching popular packages:', error);
      return {
        success: false,
        error: error.message,
        packages: []
      };
    }
  }

  // Get recommended packages
  static async getRecommendedPackages() {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/recommended`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          packages: data.data.packages || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching recommended packages:', error);
      return {
        success: false,
        error: error.message,
        packages: []
      };
    }
  }

  // Search packages
  static async searchPackages(searchQuery) {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/search`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: searchQuery })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          packages: data.data.packages || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error searching packages:', error);
      return {
        success: false,
        error: error.message,
        packages: []
      };
    }
  }

  // Create package
  static async createPackage(packageData) {
    try {
      const response = await fetch(`${API_BASE_URL}/packages`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        package: data.data?.package || data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Error creating package:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update package
  static async updatePackage(id, packageData) {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'PUT',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        package: data.data?.package || data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Error updating package:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete package
  static async deletePackage(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('Error deleting package:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Stub methods for compatibility (if needed later)
  static async getPackageSpeakers(packageId) {
    return { success: true, speakers: [] };
  }

  static async getPackageEntertainments(packageId) {
    return { success: true, entertainments: [] };
  }

  static async getPackageRules(packageId) {
    return { success: true, rules: [] };
  }
}

