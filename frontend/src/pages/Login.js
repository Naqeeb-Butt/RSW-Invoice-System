import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import logger from '../utils/logger';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear success message when component unmounts
    return () => {
      setSuccessMessage('');
      clearError();
    };
  }, [clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    clearError();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    logger.logUserAction('LOGIN_ATTEMPT', 'LoginForm', { email });

    const result = await login(email, password);
    
    if (result.success) {
      setSuccessMessage('Login successful! Redirecting to dashboard...');
      logger.logUserAction('LOGIN_SUCCESS', 'LoginForm', { email, userId: result.user?.id });
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      logger.logUserAction('LOGIN_FAILED', 'LoginForm', { email, error: result.error });
    }
  };

  const handleInputChange = (field, value) => {
    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear global error when user makes any change
    if (error) {
      clearError();
    }
    
    // Clear success message when user makes any change
    if (successMessage) {
      setSuccessMessage('');
    }
    
    // Update field value
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-aasko-blue" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Aasko Construction Invoice Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {successMessage}
            </div>
          )}
          
          {/* Global Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`mt-1 input-field ${fieldErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="admin@aasko.com"
                aria-invalid={fieldErrors.email ? 'true' : 'false'}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  {fieldErrors.email}
                </p>
              )}
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`input-field pr-10 ${fieldErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="•••••••"
                  aria-invalid={fieldErrors.password ? 'true' : 'false'}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  {fieldErrors.password}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </div>
          
          {/* Demo Credentials */}
          <div className="text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="font-medium text-gray-700 mb-2">Demo credentials:</p>
            <div className="space-y-1">
              <p><span className="font-medium">Email:</span> admin@aasko.com</p>
              <p><span className="font-medium">Password:</span> admin123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
