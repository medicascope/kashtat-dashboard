'use client';

const API_BASE_URL = 'https://app.kashtat.co/api/admin/v1';

export class AuthService {
  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message?.description || 'Login failed');
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('kashtat_token', data.token);
        localStorage.setItem('kashtat_user', JSON.stringify(data.user));
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async getMe() {
    try {
      const token = localStorage.getItem('kashtat_token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static logout() {
    localStorage.removeItem('kashtat_token');
    localStorage.removeItem('kashtat_user');
    window.location.href = '/login';
  }

  static getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('kashtat_token') : null;
  }

  static getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('kashtat_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  static isAuthenticated() {
    return !!this.getToken();
  }
} 