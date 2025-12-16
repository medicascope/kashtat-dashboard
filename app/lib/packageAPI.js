'use client';

import { AuthService } from './auth';

// Packages = Tourism Packages (Aquaventure, Desert Safari, etc.)
const API_BASE_URL = 'https://api.kashtat.co/v2';

export class PackageAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all packages
  static async getPackages(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.search) queryParams.append('search', filters.search);

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
        // Transform packages to match dashboard expectations
        const transformedPackages = (data.data.packages || []).map(pkg => ({
          ...pkg,
          name: pkg.title, // Dashboard expects 'name', backend returns 'title'
          type: 'package', // Dashboard expects 'type', backend doesn't have it
          category: {
            name: pkg.category_name || pkg.category,
            id: pkg.category,
            image: null // Category images not provided by backend
          },
          partner: pkg.partner_id ? {
            id: pkg.partner_id,
            name: 'Partner', // Partner details not included in package list
            image: null
          } : null,
          prices: [ // Dashboard expects prices array
            { type: 'Adult', price: pkg.pricing_adults || pkg.price || '0' },
            { type: 'Child', price: pkg.pricing_children || pkg.price || '0' },
            { type: 'Infant', price: pkg.pricing_infants || '0' }
          ]
        }));
        
        return {
          success: true,
          packages: transformedPackages,
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
        const pkg = data.data.package || data.data;
        // Transform package to match dashboard expectations
        const transformedPackage = {
          ...pkg,
          name: pkg.title,
          type: 'package',
          category: {
            name: pkg.category_name || pkg.category,
            id: pkg.category,
            image: null
          },
          partner: pkg.partner_id ? {
            id: pkg.partner_id,
            name: 'Partner',
            image: null
          } : null,
          prices: [
            { type: 'Adult', price: pkg.pricing_adults || pkg.price || '0' },
            { type: 'Child', price: pkg.pricing_children || pkg.price || '0' },
            { type: 'Infant', price: pkg.pricing_infants || '0' }
          ]
        };
        
        return {
          success: true,
          package: transformedPackage,
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
        // Transform packages to match dashboard expectations
        const transformedPackages = (data.data.packages || []).map(pkg => ({
          ...pkg,
          name: pkg.title,
          type: 'package',
          category: {
            name: pkg.category_name || pkg.category,
            id: pkg.category,
            image: null
          },
          partner: pkg.partner_id ? {
            id: pkg.partner_id,
            name: 'Partner',
            image: null
          } : null,
          prices: [
            { type: 'Adult', price: pkg.pricing_adults || pkg.price || '0' },
            { type: 'Child', price: pkg.pricing_children || pkg.price || '0' },
            { type: 'Infant', price: pkg.pricing_infants || '0' }
          ]
        }));
        
        return {
          success: true,
          packages: transformedPackages,
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

  // Search packages
  static async searchPackages(searchTerm) {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Transform packages to match dashboard expectations
        const transformedPackages = (data.data.packages || []).map(pkg => ({
          ...pkg,
          name: pkg.title,
          type: 'package',
          category: {
            name: pkg.category_name || pkg.category,
            id: pkg.category,
            image: null
          },
          partner: pkg.partner_id ? {
            id: pkg.partner_id,
            name: 'Partner',
            image: null
          } : null,
          prices: [
            { type: 'Adult', price: pkg.pricing_adults || pkg.price || '0' },
            { type: 'Child', price: pkg.pricing_children || pkg.price || '0' },
            { type: 'Infant', price: pkg.pricing_infants || '0' }
          ]
        }));
        
        return {
          success: true,
          packages: transformedPackages,
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

  // Create package (Admin only - requires admin authentication)
  static async createPackage(packageData) {
    try {
      const formData = new FormData();
      
      // Add all package fields
      Object.keys(packageData).forEach(key => {
        if (key === 'imageFile' || key === 'imageFiles') {
          // Handle image files separately
          return;
        }
        
        const value = packageData[key];
        if (value !== undefined && value !== null) {
          // Convert arrays and objects to JSON strings
          if (Array.isArray(value) || typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });
      
      // Add main image file if provided
      if (packageData.imageFile) {
        formData.append('image', packageData.imageFile);
      }
      
      // Add multiple image files if provided
      if (packageData.imageFiles && Array.isArray(packageData.imageFiles)) {
        packageData.imageFiles.forEach((file, index) => {
          formData.append('images', file);
        });
      }

      const headers = this.getHeaders();
      delete headers['Content-Type']; // Let browser set it for FormData

      const response = await fetch(`${API_BASE_URL}/packages`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          package: data.data.package,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating package:', error);
      return {
        success: false,
        error: error.message,
        package: null
      };
    }
  }

  // Update package (Admin only)
  static async updatePackage(id, packageData) {
    try {
      const formData = new FormData();
      
      // Add all package fields
      Object.keys(packageData).forEach(key => {
        if (key === 'imageFile' || key === 'imageFiles') {
          // Handle image files separately
          return;
        }
        
        const value = packageData[key];
        if (value !== undefined && value !== null) {
          // Convert arrays and objects to JSON strings
          if (Array.isArray(value) || typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });
      
      // Add main image file if provided
      if (packageData.imageFile) {
        formData.append('image', packageData.imageFile);
      }
      
      // Add multiple image files if provided
      if (packageData.imageFiles && Array.isArray(packageData.imageFiles)) {
        packageData.imageFiles.forEach((file, index) => {
          formData.append('images', file);
        });
      }

      const headers = this.getHeaders();
      delete headers['Content-Type']; // Let browser set it for FormData

      const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'PUT',
        headers,
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          package: data.data.package,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating package:', error);
      return {
        success: false,
        error: error.message,
        package: null
      };
    }
  }

  // Delete package (Admin only)
  static async deletePackage(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
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

  // Get package speakers (NOT APPLICABLE - tourism system)
  // This method exists for compatibility with dashboard
  static async getPackageSpeakers() {
    return {
      success: true,
      speakers: [],
      message: 'Speakers are not applicable for tourism packages'
    };
  }

  // Get package entertainments (NOT APPLICABLE - tourism system)
  // This method exists for compatibility with dashboard
  static async getPackageEntertainments() {
    return {
      success: true,
      entertainments: [],
      message: 'Entertainments are managed within package amenities'
    };
  }

  // Get package rules (NOT APPLICABLE - tourism system)
  // This method exists for compatibility with dashboard
  static async getPackageRules() {
    return {
      success: true,
      rules: [],
      message: 'Rules are managed within package policies'
    };
  }
}
