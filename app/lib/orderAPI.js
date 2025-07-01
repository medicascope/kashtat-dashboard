'use client';

import { AuthService } from './auth';

const API_BASE_URL = 'https://app.kashtat.co/api/admin/v1';

export class OrderAPI {
  static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get all orders
  static async getOrders(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
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
          orders: data.orders || [],
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
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
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
          order: data.order,
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

  // Update order (mainly for status updates)
  static async updateOrder(id, orderData) {
    try {
      const formData = new FormData();
      
      // Add status field
      if (orderData.status) {
        formData.append('status', orderData.status);
      }

      const headers = this.getHeaders();
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
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
          order: data.order,
          message: data.message
        };
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      return {
        success: false,
        error: error.message,
        order: null
      };
    }
  }

  // Delete order
  static async deleteOrder(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (response.status === 204 || response.status === 200) {
        return {
          success: true,
          message: 'Order deleted successfully'
        };
      } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'Order deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get order statuses (common statuses for dropdown)
  static getOrderStatuses() {
    return [
      { value: 'pending', label: 'Pending', color: 'yellow' },
      { value: 'confirmed', label: 'Confirmed', color: 'blue' },
      { value: 'processing', label: 'Processing', color: 'purple' },
      { value: 'completed', label: 'Completed', color: 'green' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' },
      { value: 'refunded', label: 'Refunded', color: 'gray' }
    ];
  }

  // Get status color for UI
  static getStatusColor(status) {
    const statuses = this.getOrderStatuses();
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  }
} 