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
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  static getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

} 