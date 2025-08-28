'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://api.kashtat.co/v2/admin';

export class PackageAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // ===== PACKAGES =====
  
  // Get all packages
  static async getPackages(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/packages${queryString ? `?${queryString}` : ''}`;

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
          packages: data.packages || [],
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
      
      if (data.status === 'object') {
        return {
          success: true,
          package: data.package,
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

  // Create package
  static async createPackage(packageData) {
    try {
      // Validate required fields
      if (!packageData.name || !packageData.overview || !packageData.partner_id || !packageData.category_id) {
        throw new Error('Name, overview, partner, and category are required fields');
      }

      const formData = new FormData();
      
      // Basic fields
      formData.append('name', packageData.name);
      formData.append('overview', packageData.overview);
      formData.append('type', packageData.type);
      formData.append('working_days', packageData.working_days || 'sunday,monday,tuesday,wednesday,thursday');
      formData.append('discount_percentage', packageData.discount_percentage || '0');
      
      // Convert due_date from YYYY-MM-DD to DD-MM-YYYY format for API
      let dueDate = packageData.due_date || '2025-12-31';
      if (dueDate) {
        const dateParts = dueDate.split('-');
        if (dateParts.length === 3) {
          dueDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      }
      formData.append('due_date', dueDate);
      formData.append('order_id', packageData.order_id || '0');
      formData.append('full_refund_within', packageData.full_refund_within || '30');
      formData.append('partial_refund_within', packageData.partial_refund_within || '15');
      formData.append('partial_refund_percentage', packageData.partial_refund_percentage || '10');
      formData.append('partner_id', packageData.partner_id);
      
      // Category is now required
      formData.append('category_id', packageData.category_id);
      
      formData.append('status', packageData.status || '1');

      // Arrays - only send if they have valid values
      if (packageData.speaker_ids && packageData.speaker_ids.length > 0) {
        packageData.speaker_ids.forEach(id => {
          if (id && id.trim() !== '') {
            formData.append('speaker_ids[]', id);
          }
        });
      }

      if (packageData.entertainment_ids && packageData.entertainment_ids.length > 0) {
        packageData.entertainment_ids.forEach(id => {
          if (id && id.trim() !== '') {
            formData.append('entertainment_ids[]', id);
          }
        });
      }

      if (packageData.rule_ids && packageData.rule_ids.length > 0) {
        packageData.rule_ids.forEach(id => {
          if (id && id.trim() !== '') {
            formData.append('rule_ids[]', id);
          }
        });
      }

      if (packageData.image_ids && packageData.image_ids.length > 0) {
        packageData.image_ids.forEach(id => {
          if (id && id.trim() !== '') {
            formData.append('image_ids[]', id);
          }
        });
      }

      if (packageData.branch_ids && packageData.branch_ids.length > 0) {
        packageData.branch_ids.forEach(id => {
          if (id && id.trim() !== '') {
            formData.append('branch_ids[]', id);
          }
        });
      }

      // Prices - Add default pricing if none provided
      const prices = packageData.prices && packageData.prices.length > 0 
        ? packageData.prices 
        : [{ price: '100', user_type: 'citizen', age_group: 'adult' }];
      
      prices.forEach((price, index) => {
        formData.append(`prices[${index}][price]`, price.price);
        formData.append(`prices[${index}][user_type]`, price.user_type);
        formData.append(`prices[${index}][age_group]`, price.age_group);
      });

      // Cover image
      if (packageData.cover_image) {
        formData.append('cover_image', packageData.cover_image);
      }

      const headers = this.getHeaders();
      delete headers['Content-Type'];

      // Debug: Log what we're sending
      console.log('Creating package with data:', {
        name: packageData.name,
        partner_id: packageData.partner_id,
        category_id: packageData.category_id,
        due_date: dueDate,
        type: packageData.type
      });

      const response = await fetch(`${API_BASE_URL}/packages`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        // Try to get the error response body
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.errors) {
            const validationErrors = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('; ');
            errorMessage = validationErrors;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        const error = new Error(errorMessage);
        error.response = response;
        throw error;
      }

      const data = await response.json();
      
      if (data.status === 'object') {
        return {
          success: true,
          package: data.package,
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

  // Update package
  static async updatePackage(id, packageData) {
    try {
      // Validate required fields
      if (!packageData.name || !packageData.overview || !packageData.partner_id || !packageData.category_id) {
        throw new Error('Name, overview, partner, and category are required fields');
      }

      const formData = new FormData();
      
      // Basic fields
      formData.append('name', packageData.name);
      formData.append('overview', packageData.overview);
      formData.append('type', packageData.type);
      formData.append('working_days', packageData.working_days || 'sunday,monday,tuesday,wednesday,thursday');
      formData.append('discount_percentage', packageData.discount_percentage || '0');
      
      // Convert due_date from YYYY-MM-DD to DD-MM-YYYY format for API
      let dueDate = packageData.due_date || '2025-12-31';
      if (dueDate) {
        const dateParts = dueDate.split('-');
        if (dateParts.length === 3) {
          dueDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      }
      formData.append('due_date', dueDate);
      formData.append('order_id', packageData.order_id || '0');
      formData.append('full_refund_within', packageData.full_refund_within || '30');
      formData.append('partial_refund_within', packageData.partial_refund_within || '15');
      formData.append('partial_refund_percentage', packageData.partial_refund_percentage || '10');
      formData.append('partner_id', packageData.partner_id);
      
      // Category is now required
      formData.append('category_id', packageData.category_id);
      
      formData.append('status', packageData.status || '1');

      // Arrays - only send if they have valid values
      if (packageData.speaker_ids && packageData.speaker_ids.length > 0) {
        packageData.speaker_ids.forEach(id => {
          if (id && id.trim() !== '') {
            formData.append('speaker_ids[]', id);
          }
        });
      }

      if (packageData.entertainment_ids && packageData.entertainment_ids.length > 0) {
        packageData.entertainment_ids.forEach(id => {
          if (id && id.trim() !== '') {
            formData.append('entertainment_ids[]', id);
          }
        });
      }

      if (packageData.rule_ids && packageData.rule_ids.length > 0) {
        packageData.rule_ids.forEach(id => {
          if (id && id.trim() !== '') {
            formData.append('rule_ids[]', id);
          }
        });
      }

      if (packageData.image_ids && packageData.image_ids.length > 0) {
        packageData.image_ids.forEach(id => {
          if (id && id.trim() !== '') {
            formData.append('image_ids[]', id);
          }
        });
      }

      if (packageData.branch_ids && packageData.branch_ids.length > 0) {
        packageData.branch_ids.forEach(id => {
          if (id && id.trim() !== '') {
            formData.append('branch_ids[]', id);
          }
        });
      }

      // Prices - Add default pricing if none provided
      const prices = packageData.prices && packageData.prices.length > 0 
        ? packageData.prices 
        : [{ price: '100', user_type: 'citizen', age_group: 'adult' }];
      
      prices.forEach((price, index) => {
        formData.append(`prices[${index}][price]`, price.price);
        formData.append(`prices[${index}][user_type]`, price.user_type);
        formData.append(`prices[${index}][age_group]`, price.age_group);
      });

      // Cover image
      if (packageData.cover_image) {
        formData.append('cover_image', packageData.cover_image);
      }

      const headers = this.getHeaders();
      delete headers['Content-Type'];

      // Debug: Log what we're sending
      console.log('Updating package with data:', {
        name: packageData.name,
        partner_id: packageData.partner_id,
        category_id: packageData.category_id,
        due_date: dueDate,
        type: packageData.type
      });

      const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        // Try to get the error response body
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.errors) {
            const validationErrors = Object.entries(errorData.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('; ');
            errorMessage = validationErrors;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        const error = new Error(errorMessage);
        error.response = response;
        throw error;
      }

      const data = await response.json();
      
      if (data.status === 'object') {
        return {
          success: true,
          package: data.package,
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

  // Delete package
  static async deletePackage(id) {
    try {
      // Use the correct delete URL pattern from scheme
      const deleteUrl = `https://app.kashtat.co/api/v1/admin/packages/${id}`;
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (response.status === 204) {
        return {
          success: true,
          message: 'Package deleted successfully'
        };
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'Package deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting package:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== PACKAGE PRICES =====

  // Get package prices
  static async getPackagePrices(packageId = null) {
    try {
      const body = packageId ? JSON.stringify({ package_id: packageId }) : '';
      
      const response = await fetch(`${API_BASE_URL}/package_prices`, {
        method: 'GET',
        headers: this.getHeaders(),
        ...(body && { body })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'object') {
        return {
          success: true,
          prices: data.prices || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching package prices:', error);
      return {
        success: false,
        error: error.message,
        prices: []
      };
    }
  }

  // Create package price
  static async createPackagePrice(priceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/package_prices`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'object') {
        return {
          success: true,
          price: data.price,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating package price:', error);
      return {
        success: false,
        error: error.message,
        price: null
      };
    }
  }

  // ===== PACKAGE RULES =====

  // Get package rules
  static async getPackageRules() {
    try {
      const response = await fetch(`${API_BASE_URL}/package_rules`, {
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
          rules: data.rules || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching package rules:', error);
      return {
        success: false,
        error: error.message,
        rules: []
      };
    }
  }

  // Create package rule
  static async createPackageRule(ruleData) {
    try {
      const formData = new FormData();
      formData.append('name', ruleData.name);
      formData.append('description', ruleData.description);
      if (ruleData.icon) {
        formData.append('icon', ruleData.icon);
      }

      const headers = this.getHeaders();
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/package_rules`, {
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
          rule: data.rule,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating package rule:', error);
      return {
        success: false,
        error: error.message,
        rule: null
      };
    }
  }

  // ===== PACKAGE SPEAKERS =====

  // Get package speakers
  static async getPackageSpeakers() {
    try {
      const response = await fetch(`${API_BASE_URL}/package_speakers`, {
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
          speakers: data.speakers || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching package speakers:', error);
      return {
        success: false,
        error: error.message,
        speakers: []
      };
    }
  }

  // Create package speaker
  static async createPackageSpeaker(speakerData) {
    try {
      const formData = new FormData();
      formData.append('name', speakerData.name);
      formData.append('overview', speakerData.overview);
      if (speakerData.image) {
        formData.append('image', speakerData.image);
      }

      const headers = this.getHeaders();
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/package_speakers`, {
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
          speaker: data.speaker,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating package speaker:', error);
      return {
        success: false,
        error: error.message,
        speaker: null
      };
    }
  }

  // ===== PACKAGE ENTERTAINMENTS =====

  // Get package entertainments
  static async getPackageEntertainments() {
    try {
      const response = await fetch(`${API_BASE_URL}/package_entertainments`, {
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
          entertainments: data.entertainments || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching package entertainments:', error);
      return {
        success: false,
        error: error.message,
        entertainments: []
      };
    }
  }

  // Create package entertainment
  static async createPackageEntertainment(entertainmentData) {
    try {
      const formData = new FormData();
      formData.append('name', entertainmentData.name);
      formData.append('description', entertainmentData.description);
      formData.append('package_id', entertainmentData.package_id);
      if (entertainmentData.icon) {
        formData.append('icon', entertainmentData.icon);
      }

      const headers = this.getHeaders();
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/package_entertainments`, {
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
          entertainment: data.entertainment,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating package entertainment:', error);
      return {
        success: false,
        error: error.message,
        entertainment: null
      };
    }
  }
} 