'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://api.kashtat.co/v2/admin';

export class BranchAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all branches (NOT AVAILABLE - tourism system doesn't use branches)
  static async getBranches(filters = {}) {
    // Return empty array immediately without making API call
    // Branches are not applicable to the tourism booking system
    return {
      success: true,
      branches: [],
      message: 'Branches feature is not available in the tourism booking system'
    };
  }

  // Get branch by ID (NOT AVAILABLE)
  static async getBranchById(id) {
    return {
      success: false,
      error: 'Branches feature is not available in the tourism booking system',
      branch: null
    };
  }

  // Create new branch (NOT AVAILABLE)
  static async createBranch(name, partnerId, cityId, lat, lng) {
    return {
      success: false,
      error: 'Branches feature is not available in the tourism booking system',
      branch: null
    };
  }

  // Update branch (NOT AVAILABLE)
  static async updateBranch(id, name, partnerId, cityId, lat, lng) {
    return {
      success: false,
      error: 'Branches feature is not available in the tourism booking system',
      branch: null
    };
  }

  // Delete branch (NOT AVAILABLE)
  static async deleteBranch(id) {
    return {
      success: false,
      error: 'Branches feature is not available in the tourism booking system'
    };
  }
} 