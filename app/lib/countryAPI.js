'use client';

import { AuthService } from './auth';

// Note: kashtat-backend doesn't have countries management
// This is a tourism booking system, not a delivery/location system
const API_BASE_URL = 'https://api.kashtat.co/v2/admin';

export class CountryAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all countries (NOT AVAILABLE in kashtat-backend)
  static async getCountries() {
    // Return mock data since this endpoint doesn't exist
    return {
      success: false,
      error: 'Countries management is not available in this backend. This is a tourism booking system.',
      countries: []
    };
    
    /* Original code - endpoint doesn't exist
    try {
      const response = await fetch(`${API_BASE_URL}/countries`, {
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
          countries: data.countries || [],
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      return {
        success: false,
        error: error.message,
        countries: []
      };
    }
    */
  }

  // Get country by ID (NOT AVAILABLE)
  static async getCountryById(id) {
    return {
      success: false,
      error: 'Countries management is not available in this backend. This is a tourism booking system.',
      country: null
    };
  }

  // Create new country (NOT AVAILABLE)
  static async createCountry(name, code) {
    return {
      success: false,
      error: 'Countries management is not available in this backend. This is a tourism booking system.',
      country: null
    };
  }

  // Update country (NOT AVAILABLE)
  static async updateCountry(id, name, code) {
    return {
      success: false,
      error: 'Countries management is not available in this backend. This is a tourism booking system.',
      country: null
    };
  }

  // Delete country (NOT AVAILABLE)
  static async deleteCountry(id) {
    return {
      success: false,
      error: 'Countries management is not available in this backend. This is a tourism booking system.'
    };
  }
} 