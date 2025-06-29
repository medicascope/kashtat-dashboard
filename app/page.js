'use client';

import { useEffect } from 'react';
import { AuthService } from './lib/auth';

export default function Home() {
  useEffect(() => {
    // Check if user is authenticated and redirect accordingly
    if (AuthService.isAuthenticated()) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl mb-4 animate-pulse">
          <span className="text-2xl font-bold text-white">K</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Kashtat Dashboard</h1>
        <p className="text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
