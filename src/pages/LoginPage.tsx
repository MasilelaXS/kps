import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { UserIcon, LockIcon, AlertCircle, Shield, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const [pcoNumber, setPcoNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { login, isLoading, error, isSuccess, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  // Clear error when switching between admin/pco
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [isAdmin, clearError, error]);

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (pcoNumber || password)) {
      clearError();
    }
  }, [pcoNumber, password, error, clearError]);

  const validateForm = () => {
    if (!pcoNumber.trim()) {
      return 'Please enter your PCO number';
    }
    if (!password.trim()) {
      return 'Please enter your password';
    }
    if (pcoNumber.length < 3) {
      return 'PCO number must be at least 3 characters';
    }
    if (password.length < 3) {
      return 'Password must be at least 3 characters';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      // You could set a local error state here if you want
      return;
    }

    await login(pcoNumber.trim(), password, isAdmin);
  };

  const handleDemoLogin = (demoType: 'pco' | 'admin') => {
    if (demoType === 'pco') {
      setPcoNumber('12345');
      setPassword('demo');
      setIsAdmin(false);
    } else {
      setPcoNumber('admin123');
      setPassword('admin');
      setIsAdmin(true);
    }
    clearError();
  };

  const isFormValid = pcoNumber.trim().length >= 3 && password.trim().length >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to KPS</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Admin/PCO Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !isAdmin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              PCO Login
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isAdmin
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="h-4 w-4 inline mr-1" />
              Admin
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 animate-shake">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-green-700 text-sm font-medium">Login successful! Redirecting...</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="pco_number" className="block text-sm font-medium text-gray-700 mb-2">
                PCO Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="pco_number"
                  name="pco_number"
                  type="text"
                  autoComplete="username"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your PCO number"
                  value={pcoNumber}
                  onChange={(e) => setPcoNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200 ${
                isAdmin
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Signing in...
                </div>
              ) : (
                `Sign in ${isAdmin ? 'as Admin' : 'as PCO'}`
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 space-y-3">
            <p className="text-center text-xs text-gray-500">Quick Demo Access:</p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('pco')}
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                Demo PCO
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
