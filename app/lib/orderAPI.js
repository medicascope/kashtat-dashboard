'use client';

import { AuthService } from './auth';

// Orders in kashtat-backend are called "Bookings"
// Route: /v2/admin/bookings
const API_BASE_URL = 'https://api.kashtat.co/v2/admin';

export class OrderAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all orders (bookings)
  static async getOrders(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.userId) queryParams.append('userId', filters.userId);

      const url = `${API_BASE_URL}/bookings${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          orders: data.data.bookings || [],
          pagination: data.data.pagination || {},
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        error: error.message,
        orders: []
      };
    }
  }

  // Get order by ID
  static async getOrderById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          order: data.data.booking || data.data,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      return {
        success: false,
        error: error.message,
        order: null
      };
    }
  }

  // Update order status
  static async updateOrderStatus(id, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          order: data.data?.booking || data.data,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get order statistics
  static async getOrderStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          success: true,
          stats: data.data,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        success: false,
        error: error.message,
        stats: null
      };
    }
  }

  // Delete/Cancel order
  static async deleteOrder(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        message: data.message || 'Order cancelled successfully'
      };
    } catch (error) {
      console.error('Error deleting order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
