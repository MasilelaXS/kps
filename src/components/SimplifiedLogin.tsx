import React, { useState, useEffect } from 'react';
import { Card, CardBody, Input, Button, Spinner } from '@heroui/react';
import { UserIcon, LockIcon, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const SimplifiedLogin: React.FC = () => {
  const [pcoNumber, setPcoNumber] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isSuccess, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

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
      // Show validation error (you could use a toast here)
      console.error(validationError);
      return;
    }

    try {
      await login(pcoNumber.trim(), password.trim());
      // Login success is handled by the auth store redirect
    } catch (err) {
      // Error handling is managed by the auth store
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            KPS Portal
          </h1>
          <p className="text-gray-600">Pest Control Management System</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-blue-500/5">
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PCO Number Input */}
              <div>
                <Input
                  label="PCO Number"
                  placeholder="Enter your PCO number"
                  value={pcoNumber}
                  onChange={(e) => setPcoNumber(e.target.value)}
                  startContent={<UserIcon className="w-4 h-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-gray-900",
                    inputWrapper: "border-gray-200 hover:border-blue-300 focus-within:!border-blue-500"
                  }}
                  isDisabled={isLoading}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              {/* Password Input */}
              <div>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  startContent={<LockIcon className="w-4 h-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-gray-900",
                    inputWrapper: "border-gray-200 hover:border-blue-300 focus-within:!border-blue-500"
                  }}
                  isDisabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {isSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-green-600">Login successful! Redirecting...</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
                isLoading={isLoading}
                isDisabled={isLoading || isSuccess}
                spinner={<Spinner size="sm" color="white" />}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Access restricted to authorized personnel only
              </p>
            </div>
          </CardBody>
        </Card>

        {/* App Info */}
        <div className="fixed bottom-0 left-0 w-full">
          <div className="flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center justify-center space-x-2">
              <span className="text-sm text-white">from</span>
              <img 
                src="/dannel.svg" 
                alt="Dannel Logo" 
                className="h-6 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
