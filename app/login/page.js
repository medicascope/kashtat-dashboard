'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/app/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    if (AuthService.isAuthenticated()) {
      window.location.href = '/dashboard';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await AuthService.login(email, password);
    
    if (result.success) {
      window.location.href = '/dashboard';
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      {/* Login Container */}
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="card-elevated animate-fade-in-up">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-xl mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} id="Layer_1" data-name="Layer 1" viewBox="0 0 216.02 216.02"><path style={{fill: 'white'}} d="M139.69,123.47a69.27,69.27,0,0,1,5.58-26.62A71.16,71.16,0,0,1,183.13,59a68.16,68.16,0,0,1,13.43-4.19,73.23,73.23,0,0,1,14.33-1.39A15.39,15.39,0,0,0,226.27,38V15.39A15.4,15.4,0,0,0,210.89,0a120.49,120.49,0,0,0-56.72,13.58A125.12,125.12,0,0,0,111,50.39a126.19,126.19,0,0,0-41.93-33,115.93,115.93,0,0,0-25.8-9.17,125.85,125.85,0,0,0-27.91-3A15.38,15.38,0,0,0,0,20.52V43.14A15.38,15.38,0,0,0,15.38,58.53a69.5,69.5,0,0,1,27.76,5.58A71.16,71.16,0,0,1,81,102a69.32,69.32,0,0,1,5.58,27.75v3.32h0v38.19s-5.44-38.11-25.74-38.11c-1.57,0-2.52,0-3-.08H15.38A15.38,15.38,0,0,0,0,148.44v22.63a15.38,15.38,0,0,0,15.38,15.38h71.2v14.18A15.39,15.39,0,0,0,102,216H124.3a15.38,15.38,0,0,0,15.38-15.39V186.45h71.21a15.39,15.39,0,0,0,15.38-15.38V148.44a15.39,15.39,0,0,0-15.38-15.39H167.33c-.49,0-1.12.08-1.9.08-20.3,0-25.75,38.11-25.75,38.11V124.6C139.68,124.22,139.68,123.84,139.69,123.47Z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Kashtat Dashboard
            </h1>
            <p className="text-text-secondary text-sm">
              Sign in to your admin account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-modern w-full pl-4 pr-10"
                  placeholder="admin@kashtat.com"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-modern w-full pl-4 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-text-muted text-sm">
          <p>© 2024 Kashtat. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 