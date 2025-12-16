'use client';

import { request } from "./request";

const API_BASE_URL = 'https://api.kashtat.co/v2';

export class AuthService {
  static async login(email, password) {
    try {
      const response = await request(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      },'POST');

      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async getStatus() {
    try {
      const response = await request(`${API_BASE_URL}/auth/status`, {},'GET');
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  static getToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // Handle edge cases: null, undefined, or the string "undefined"
      if (!token || token === 'undefined' || token === 'null') {
        return null;
      }
      return token;
    }
    return null;
  }

  static getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      // Handle edge cases: null, undefined, or the string "undefined"
      if (!user || user === 'undefined' || user === 'null') {
        return null;
      }
      try {
        return JSON.parse(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  static isAuthenticated() {
    if (typeof window === 'undefined') {
      return false;
    }
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

} 