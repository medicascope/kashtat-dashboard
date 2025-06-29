'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://app.kashtat.co/api/admin/v1';

export class CategoryAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all categories
  static async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
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
          categories: data.categories || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error.message,
        categories: []
      };
    }
  }

  // Get category by ID
  static async getCategoryById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
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
          category: data.category,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      return {
        success: false,
        error: error.message,
        category: null
      };
    }
  }

  // Create new category
  static async createCategory(name, imageFile) {
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const headers = this.getHeaders();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/categories`, {
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
          category: data.category,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        success: false,
        error: error.message,
        category: null
      };
    }
  }

  // Update category
  static async updateCategory(id, name, imageFile) {
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const headers = this.getHeaders();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
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
          category: data.category,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        success: false,
        error: error.message,
        category: null
      };
    }
  }

  // Delete category
  static async deleteCategory(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (response.status === 204) {
        return {
          success: true,
          message: 'Category deleted successfully'
        };
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'Category deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 