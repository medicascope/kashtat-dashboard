'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '../../app/lib/auth';

const API_BASE_URL = 'https://api.kashtat.co/v2/admin';

export default function Overview() {
  const [stats, setStats] = useState({
    users: null,
    bookings: null,
    partners: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en',
        'Authorization': `Bearer ${AuthService.getToken()}`
      };

      const [usersRes, bookingsRes, partnersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/stats`, { headers }).catch(e => ({ ok: false })),
        fetch(`${API_BASE_URL}/bookings/stats`, { headers }).catch(e => ({ ok: false })),
        fetch(`${API_BASE_URL}/partners/stats`, { headers }).catch(e => ({ ok: false }))
      ]);

      let usersData = { success: false };
      let bookingsData = { success: false };
      let partnersData = { success: false };

      if (usersRes.ok) usersData = await usersRes.json();
      if (bookingsRes.ok) bookingsData = await bookingsRes.json();
      if (partnersRes.ok) partnersData = await partnersRes.json();

      console.log('Stats Data:', { usersData, bookingsData, partnersData });

      // Extract stats from response
      const userStats = usersData.success ? (usersData.data?.stats || usersData.data || {}) : {};
      const bookingStats = bookingsData.success ? (bookingsData.data?.stats || bookingsData.data || {}) : {};
      const partnerStats = partnersData.success ? (partnersData.data?.stats || partnersData.data || {}) : {};

      setStats({
        users: userStats,
        bookings: bookingStats,
        partners: partnerStats
      });
      setError(null);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">Failed to load statistics: {error}</p>
        <button onClick={loadStats} className="mt-4 btn-primary">Retry</button>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color = 'blue', trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}-50 flex items-center justify-center`}>
          <div className={`w-6 h-6 text-${color}-600`}>
            {icon}
          </div>
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">
        {typeof value === 'string' ? value : (value?.toLocaleString?.() || value || '0')}
      </p>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );

  const users = stats.users || {};
  const bookings = stats.bookings || {};
  const partners = stats.partners || {};

  return (
    <div className="space-y-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={users.totalUsers || 0}
          subtitle={`${users.activeUsers || 0} active`}
          color="blue"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />

        <StatCard
          title="Total Bookings"
          value={bookings.totalBookings || 0}
          subtitle={`${bookings.completedBookings || 0} completed`}
          color="green"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
        />

        <StatCard
          title="Total Revenue"
          value={`${(bookings.totalRevenue || 0).toLocaleString()} AED`}
          subtitle={`${(bookings.pendingPayments || 0)} pending payments`}
          color="purple"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />

        <StatCard
          title="Active Partners"
          value={partners.activePartners || 0}
          subtitle={`${partners.totalPartners || 0} total`}
          color="orange"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">User Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Admin Users</span>
              <span className="font-semibold">{users.adminUsers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Regular Users</span>
              <span className="font-semibold">{users.regularUsers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Verified Users</span>
              <span className="font-semibold">{users.fullyVerifiedUsers || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Pending</span>
              <span className="font-semibold text-yellow-600">{bookings.pendingBookings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Confirmed</span>
              <span className="font-semibold text-blue-600">{bookings.confirmedBookings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Cancelled</span>
              <span className="font-semibold text-red-600">{bookings.cancelledBookings || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Partner Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Partners</span>
              <span className="font-semibold">{partners.totalPartners || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Active</span>
              <span className="font-semibold text-green-600">{partners.activePartners || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Inactive</span>
              <span className="font-semibold text-slate-400">{partners.inactivePartners || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
        <p className="text-blue-100 mb-4">Manage your tourism booking platform</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-3 transition-all">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            <span className="text-sm font-medium">Add User</span>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-3 transition-all">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="text-sm font-medium">View Bookings</span>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-3 transition-all">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <span className="text-sm font-medium">Packages</span>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-3 transition-all">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <span className="text-sm font-medium">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}
