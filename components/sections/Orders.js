'use client';

import { useState, useEffect, useRef } from 'react';
import DataTable from '../ui/DataTable';
import Modal from '../ui/Modal';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { OrderAPI } from '../../app/lib/orderAPI';

export default function Orders({ activeSubItem, onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Simple refs to prevent issues
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  // Simple fetch function without useCallback
  const fetchOrders = async () => {
    if (loadingRef.current || !mountedRef.current) return;
    
    loadingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      
      const filters = statusFilter ? { status: statusFilter } : {};
      const response = await OrderAPI.getOrders(filters);
      
      if (!mountedRef.current) return;
      
      if (response.success) {
        setOrders(response.orders);
      } else {
        throw new Error(response.error || 'Failed to fetch orders');
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      loadingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Simple useEffect without dependencies
  useEffect(() => {
    fetchOrders();
    
    return () => {
      mountedRef.current = false;
    };
  }, []); // EMPTY dependencies

  // Separate effect for status filter
  useEffect(() => {
    if (mountedRef.current) {
      fetchOrders();
    }
  }, [statusFilter]); // Only statusFilter dependency

  const tableColumns = [
    {
      key: 'order_number',
      label: 'Order #',
      render: (value, order) => (
        <div className="font-medium text-gray-900">
          #{order?.id?.substring(0, 8) || 'N/A'}
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (value, order) => {
        const userName = order?.user_name;
        const userEmail = order?.user_email;
        const userPhone = order?.user_phone;
        
        if (!userName) return <span className="text-gray-500">No Customer</span>;
        
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-8 w-8">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-xs">
                {userName ? userName.substring(0, 2).toUpperCase() : 'U'}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {userName}
              </p>
              <p className="text-xs text-gray-500">
                {userEmail || userPhone || ''}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'package',
      label: 'Package/Service',
      render: (value, order) => {
        const packageItem = order?.package || order?.service;
        if (!packageItem) return <span className="text-gray-500">No Package</span>;
        
        return (
          <div>
            <p className="text-sm font-medium text-gray-900">
              {packageItem?.name || 'Package Name'}
            </p>
            <p className="text-xs text-gray-500">
              {packageItem?.partner?.name || packageItem?.type || ''}
            </p>
          </div>
        );
      }
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value, order) => {
        const amount = order?.total_amount;
        const tax = order?.tax;
        
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {amount ? `${amount} SAR` : 'N/A'}
            </div>
            {tax && (
              <div className="text-xs text-gray-500">
                Tax: {tax}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, order) => {
        const status = order?.status || 'pending';
        const statusColor = OrderAPI.getStatusColor(status);
        const colorClasses = {
          yellow: 'bg-yellow-100 text-yellow-800',
          blue: 'bg-blue-100 text-blue-800',
          purple: 'bg-purple-100 text-purple-800',
          green: 'bg-green-100 text-green-800',
          red: 'bg-red-100 text-red-800',
          gray: 'bg-gray-100 text-gray-800'
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[statusColor] || colorClasses.gray}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Order Date',
      render: (value, order) => {
        const date = order?.created_at || order?.order_date || order?.due_date;
        if (!date) {
          // If no date available, show when the package is due
          const packageDueDate = order?.package?.due_date;
          if (packageDueDate) {
            return (
              <div className="text-sm text-gray-500">
                Due: {packageDueDate}
              </div>
            );
          }
          return <span className="text-gray-500">No Date</span>;
        }
        
        return (
          <div className="text-sm text-gray-900">
            {new Date(date).toLocaleDateString()}
          </div>
        );
      }
    }
  ];

  const handleStatusUpdate = async (order, newStatus) => {
    try {
      const response = await OrderAPI.updateOrder(order.id, { status: newStatus });
      
      if (response.success) {
        await fetchOrders(); // Refresh the list
        setEditingOrder(null);
      } else {
        throw new Error(response.error || 'Failed to update order status');
      }
    } catch (err) {
      setError(`Failed to update order status: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await OrderAPI.deleteOrder(deletingOrder.id);
      
      if (response.success) {
        await fetchOrders(); // Refresh the list
        setDeletingOrder(null);
      } else {
        throw new Error(response.error || 'Failed to delete order');
      }
    } catch (err) {
      setError(`Failed to delete order: ${err.message}`);
    }
  };

  const handleViewOrder = async (order) => {
    try {
      const response = await OrderAPI.getOrderById(order.id);
      
      if (response.success) {
        setViewingOrder(response.order);
      } else {
        setViewingOrder(order); // Fallback to basic order data
      }
    } catch (err) {
      setViewingOrder(order); // Fallback to basic order data
    }
  };

  if (loading) {
    return (
      <div className="opacity-50">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={fetchOrders}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSubItem) {
      case 'order-analytics':
        return (
          <div className="card-premium">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {/* Quick Stats */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="text-sm text-blue-800">Pending Orders</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'completed').length}
                  </div>
                  <div className="text-sm text-green-800">Completed Orders</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {orders.filter(o => o.status === 'processing').length}
                  </div>
                  <div className="text-sm text-purple-800">Processing Orders</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {orders.length}
                  </div>
                  <div className="text-sm text-yellow-800">Total Orders</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Revenue Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0).toFixed(2)} SAR
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {orders.length > 0 ? (orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) / orders.length).toFixed(2) : '0.00'} SAR
                    </div>
                    <div className="text-sm text-gray-600">Average Order Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {orders.reduce((sum, order) => sum + (parseFloat(order.tax) || 0), 0).toFixed(2)} SAR
                    </div>
                    <div className="text-sm text-gray-600">Total Tax</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'order-status':
        return (
          <div className="space-y-6">
            <div className="card-premium">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Order Status Management</h3>
                
                {/* Status Distribution */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {OrderAPI.getOrderStatuses().map((status) => {
                    const count = orders.filter(o => o.status === status.value).length;
                    const colorClasses = {
                      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                      blue: 'bg-blue-50 border-blue-200 text-blue-800',
                      purple: 'bg-purple-50 border-purple-200 text-purple-800',
                      green: 'bg-green-50 border-green-200 text-green-800',
                      red: 'bg-red-50 border-red-200 text-red-800',
                      gray: 'bg-gray-50 border-gray-200 text-gray-800'
                    };
                    
                    return (
                      <div key={status.value} className={`p-4 rounded-lg border-2 ${colorClasses[status.color] || colorClasses.gray}`}>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm font-medium">{status.label}</div>
                        <div className="text-xs opacity-75">{orders.length > 0 ? ((count / orders.length) * 100).toFixed(1) : 0}%</div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Status Updates */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Quick Status Updates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bulk Status Update
                      </label>
                      <div className="flex space-x-2">
                        <select className="input-modern flex-1">
                          <option value="">Select Status</option>
                          {OrderAPI.getOrderStatuses().map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        <button className="btn-primary">
                          Update Selected
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-modern w-full"
                      >
                        <option value="">All Statuses</option>
                        {OrderAPI.getOrderStatuses().map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table for Status Management */}
            <DataTable
              title="Order Status Management"
              data={orders}
              columns={tableColumns}
              onView={handleViewOrder}
              onEdit={(order) => setEditingOrder(order)}
              searchPlaceholder="Search orders for status updates..."
              searchFunction={(order, query) => {
                const orderNumber = order?.order_number || order?.id || '';
                const customerName = order?.user_name || '';
                const status = order?.status || '';
                return orderNumber.toLowerCase().includes(query.toLowerCase()) ||
                       customerName.toLowerCase().includes(query.toLowerCase()) ||
                       status.toLowerCase().includes(query.toLowerCase());
              }}
              showAddButton={false}
              showDeleteButton={false}
              exportable={true}
            />
          </div>
        );

      case 'order-tracking':
        return (
          <div className="space-y-6">
            <div className="card-premium">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Order Tracking & Monitoring</h3>
                
                {/* Tracking Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {orders.filter(o => ['processing', 'shipped', 'in_transit'].includes(o.status)).length}
                        </div>
                        <div className="text-sm text-blue-800">Orders in Transit</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-yellow-600">
                          {orders.filter(o => {
                            const dueDate = new Date(o.package?.due_date);
                            const today = new Date();
                            return dueDate < today && o.status !== 'completed';
                          }).length}
                        </div>
                        <div className="text-sm text-yellow-800">Overdue Orders</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-green-600">
                          {orders.filter(o => o.status === 'completed').length}
                        </div>
                        <div className="text-sm text-green-800">Delivered Today</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time Updates */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Real-time Order Updates</h4>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            order.status === 'completed' ? 'bg-green-500' :
                            order.status === 'processing' ? 'bg-blue-500' :
                            order.status === 'pending' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Order #{order.id?.substring(0, 8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.user_name} • {order.package?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {order.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'No date'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Table */}
            <DataTable
              title="Order Tracking Details"
              data={orders}
              columns={[
                {
                  key: 'order_number',
                  label: 'Order #',
                  render: (value, order) => (
                    <div className="font-medium text-gray-900">
                      #{order?.id?.substring(0, 8) || 'N/A'}
                    </div>
                  )
                },
                {
                  key: 'customer',
                  label: 'Customer',
                  render: (value, order) => (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order?.user_name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order?.user_phone || order?.user_email || ''}</p>
                    </div>
                  )
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (value, order) => {
                    const status = order?.status || 'pending';
                    const statusColor = OrderAPI.getStatusColor(status);
                    const colorClasses = {
                      yellow: 'bg-yellow-100 text-yellow-800',
                      blue: 'bg-blue-100 text-blue-800',
                      purple: 'bg-purple-100 text-purple-800',
                      green: 'bg-green-100 text-green-800',
                      red: 'bg-red-100 text-red-800',
                      gray: 'bg-gray-100 text-gray-800'
                    };
                    
                    return (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[statusColor] || colorClasses.gray}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    );
                  }
                },
                {
                  key: 'due_date',
                  label: 'Due Date',
                  render: (value, order) => {
                    const dueDate = order?.package?.due_date;
                    if (!dueDate) return <span className="text-gray-500">No due date</span>;
                    
                    const due = new Date(dueDate);
                    const today = new Date();
                    const isOverdue = due < today && order.status !== 'completed';
                    
                    return (
                      <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {due.toLocaleDateString()}
                        {isOverdue && <div className="text-xs text-red-500">Overdue</div>}
                      </div>
                    );
                  }
                },
                {
                  key: 'progress',
                  label: 'Progress',
                  render: (value, order) => {
                    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'in_transit', 'delivered', 'completed'];
                    const currentIndex = statusOrder.indexOf(order?.status || 'pending');
                    const progress = Math.max(0, (currentIndex / (statusOrder.length - 1)) * 100);
                    
                    return (
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  }
                }
              ]}
              onView={handleViewOrder}
              searchPlaceholder="Track orders..."
              searchFunction={(order, query) => {
                const orderNumber = order?.order_number || order?.id || '';
                const customerName = order?.user_name || '';
                const status = order?.status || '';
                return orderNumber.toLowerCase().includes(query.toLowerCase()) ||
                       customerName.toLowerCase().includes(query.toLowerCase()) ||
                       status.toLowerCase().includes(query.toLowerCase());
              }}
              showAddButton={false}
              showEditButton={false}
              showDeleteButton={false}
              exportable={true}
            />
          </div>
        );

      case 'get-orders':
      case 'view-orders':
      case null:
      case undefined:
      default:
        return (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-modern"
                  >
                    <option value="">All Statuses</option>
                    {OrderAPI.getOrderStatuses().map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={fetchOrders}
                  className="btn-ghost text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>

            <DataTable
              title="Order Management"
              data={orders}
              columns={tableColumns}
              onView={handleViewOrder}
              onEdit={(order) => setEditingOrder(order)}
              onDelete={(order) => setDeletingOrder(order)}
              searchPlaceholder="Search orders..."
              searchFields={['order_number', 'id']}
              searchFunction={(order, query) => {
                const orderNumber = order?.order_number || order?.id || '';
                const customerName = order?.user_name || '';
                const customerEmail = order?.user_email || '';
                const packageName = order?.package?.name || '';
                return orderNumber.toLowerCase().includes(query.toLowerCase()) ||
                       customerName.toLowerCase().includes(query.toLowerCase()) ||
                       customerEmail.toLowerCase().includes(query.toLowerCase()) ||
                       packageName.toLowerCase().includes(query.toLowerCase());
              }}
              showAddButton={false}
              exportable={true}
            />

            {/* View Order Modal */}
            {viewingOrder && (
              <Modal
                isOpen={!!viewingOrder}
                onClose={() => setViewingOrder(null)}
                title="Order Details"
                size="large"
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Order ID:</strong> {viewingOrder.id}</p>
                        <p><strong>Order Number:</strong> #{viewingOrder.id?.substring(0, 8)}</p>
                        <p><strong>Status:</strong> 
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            OrderAPI.getStatusColor(viewingOrder.status) === 'green' ? 'bg-green-100 text-green-800' :
                            OrderAPI.getStatusColor(viewingOrder.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            OrderAPI.getStatusColor(viewingOrder.status) === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {viewingOrder.status}
                          </span>
                        </p>
                        <p><strong>Created:</strong> {viewingOrder.created_at ? new Date(viewingOrder.created_at).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {viewingOrder.user_name || 'N/A'}</p>
                        <p><strong>Email:</strong> {viewingOrder.user_email || 'N/A'}</p>
                        <p><strong>Phone:</strong> {viewingOrder.user_phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {viewingOrder.package && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Package Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {viewingOrder.package.name}</p>
                        <p><strong>Type:</strong> {viewingOrder.package.type}</p>
                        <p><strong>Working Days:</strong> {viewingOrder.package.working_days}</p>
                        <p><strong>Due Date:</strong> {viewingOrder.package.due_date}</p>
                        <p><strong>Discount:</strong> {viewingOrder.package.discount_percentage}%</p>
                        <p><strong>Refund Policy:</strong> Full refund within {viewingOrder.package.full_refund_within} days, {viewingOrder.package.partial_refund_percentage}% partial refund within {viewingOrder.package.partial_refund_within} days</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Total Amount:</strong> {viewingOrder.total_amount || 'N/A'} SAR</p>
                      <p><strong>Tax:</strong> {viewingOrder.tax || 'N/A'}</p>
                      <p><strong>Status:</strong> {viewingOrder.status || 'N/A'}</p>
                      <p><strong>Items Count:</strong> {viewingOrder.items?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </Modal>
            )}

            {/* Edit Status Modal */}
            {editingOrder && (
              <Modal
                isOpen={!!editingOrder}
                onClose={() => setEditingOrder(null)}
                title="Update Order Status"
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Order: #{editingOrder.id?.substring(0, 8)}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Current Status: <strong>{editingOrder.status}</strong>
                    </p>
                    
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Status
                    </label>
                    <div className="space-y-2">
                      {OrderAPI.getOrderStatuses().map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleStatusUpdate(editingOrder, status.value)}
                          disabled={status.value === editingOrder.status}
                          className={`w-full text-left px-3 py-2 rounded-md border ${
                            status.value === editingOrder.status
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 border-gray-300'
                          }`}
                        >
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                            status.color === 'green' ? 'bg-green-100 text-green-800' :
                            status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            status.color === 'red' ? 'bg-red-100 text-red-800' :
                            status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            status.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status.label}
                          </span>
                          {status.value === editingOrder.status && '(Current)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {deletingOrder && (
              <Modal
                isOpen={!!deletingOrder}
                onClose={() => setDeletingOrder(null)}
                title="Delete Order"
              >
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Order
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete order #{deletingOrder?.id?.substring(0, 8)}? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setDeletingOrder(null)}
                  >
                    Cancel
                  </button>
                </div>
              </Modal>
            )}
          </div>
        );
    }
  };

  return renderContent();
} 