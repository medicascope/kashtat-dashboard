'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://api.kashtat.co/v2/admin';

export class UserAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all users
  static async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle backend response format: { success: true, data: { users: [], pagination: {} } }
      if (data.success && data.data && data.data.users) {
        return {
          success: true,
          users: data.data.users,
          pagination: data.data.pagination,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.message,
        users: []
      };
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          user: data.user,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: error.message,
        user: null
      };
    }
  }

  // Create new user
  static async createUser(email, name, phone, userType, password, avatarFile = null) {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('user_type', userType);
      formData.append('password', password);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const headers = this.getHeaders();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          user: data.user,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.message,
        user: null
      };
    }
  }

  // Update user
  static async updateUser(id, email, name, phone, userType, password = null, avatarFile = null) {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('user_type', userType);
      if (password) {
        formData.append('password', password);
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const headers = this.getHeaders();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'POST', // API might use POST for updates with files
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          user: data.user,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: error.message,
        user: null
      };
    }
  }

  // Delete user
  static async deleteUser(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (response.status === 204) {
        return {
          success: true,
          message: 'User deleted successfully'
        };
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 