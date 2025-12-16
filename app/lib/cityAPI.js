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

  // Get all cities (NOT AVAILABLE - tourism system doesn't use cities)
  static async getCities(countryId = null) {
    // Return empty array immediately without making API call
    return {
      success: true,
      cities: [],
      message: 'Cities feature is not available in the tourism booking system'
    };
  }

  // Get city by ID (NOT AVAILABLE)
  static async getCityById(id) {
    return {
      success: false,
      error: 'Cities feature is not available in the tourism booking system',
      city: null
    };
  }

  // Create new city (NOT AVAILABLE)
  static async createCity(name, code, countryId) {
    return {
      success: false,
      error: 'Cities feature is not available in the tourism booking system',
      city: null
    };
  }

  // Update city (NOT AVAILABLE)
  static async updateCity(id, name, code) {
    return {
      success: false,
      error: 'Cities feature is not available in the tourism booking system',
      city: null
    };
  }

  // Delete city (NOT AVAILABLE)
  static async deleteCity(id) {
    return {
      success: false,
      error: 'Cities feature is not available in the tourism booking system'
    };
  }
} 