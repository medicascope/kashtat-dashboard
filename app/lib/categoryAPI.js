'use client';

import { AuthService } from './auth';

// Categories in kashtat-backend are "Package Categories" (tourism types)
// Public endpoint: /v2/packages/categories
// Admin endpoints: /v2/admin/packages/categories
const API_BASE_URL = 'https://api.kashtat.co/v2';

export class CategoryAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all categories (Package Categories)
  static async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/categories`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Backend returns: { success: true, data: { categories: [...] } }
      if (data.success && data.data) {
        return {
          success: true,
          categories: data.data.categories || [],
          message: data.message || 'Categories retrieved successfully'
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
      // Note: Backend doesn't have a single category endpoint
      // We fetch all and filter client-side
      const allCategories = await this.getCategories();
      
      if (allCategories.success) {
        const category = allCategories.categories.find(c => c.id === id);
        if (category) {
          return {
            success: true,
            category,
            message: 'Category found'
          };
        } else {
          return {
            success: false,
            error: 'Category not found',
            category: null
          };
        }
      }
      
      return allCategories;
    } catch (error) {
      console.error('Error fetching category:', error);
      return {
        success: false,
        error: error.message,
        category: null
      };
    }
  }

  // Create new category (Admin only)
  static async createCategory(categoryData) {
    try {
      const formData = new FormData();
      
      // Add text fields
      if (categoryData.id) formData.append('id', categoryData.id);
      if (categoryData.name) formData.append('name', categoryData.name);
      if (categoryData.icon) formData.append('icon', categoryData.icon);
      if (categoryData.description) formData.append('description', categoryData.description);
      
      // Add image file if provided
      if (categoryData.imageFile) {
        formData.append('image', categoryData.imageFile);
      } else if (categoryData.image) {
        formData.append('image', categoryData.image);
      }

      const headers = this.getHeaders();
      delete headers['Content-Type']; // Let browser set it for FormData

      const response = await fetch(`${API_BASE_URL}/admin/packages/categories`, {
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
          category: data.data.category,
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

  // Update category (Admin only)
  static async updateCategory(id, categoryData) {
    try {
      const formData = new FormData();
      
      // Add text fields
      if (categoryData.name !== undefined) formData.append('name', categoryData.name);
      if (categoryData.icon !== undefined) formData.append('icon', categoryData.icon);
      if (categoryData.description !== undefined) formData.append('description', categoryData.description);
      if (categoryData.sort_order !== undefined) formData.append('sort_order', categoryData.sort_order);
      
      // Add image file if provided
      if (categoryData.imageFile) {
        formData.append('image', categoryData.imageFile);
      } else if (categoryData.image !== undefined) {
        formData.append('image', categoryData.image);
      }

      const headers = this.getHeaders();
      delete headers['Content-Type']; // Let browser set it for FormData

      const response = await fetch(`${API_BASE_URL}/admin/packages/categories/${id}`, {
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
          category: data.data.category,
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

  // Delete category (Admin only)
  static async deleteCategory(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/packages/categories/${id}`, {
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
      console.error('Error deleting category:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 