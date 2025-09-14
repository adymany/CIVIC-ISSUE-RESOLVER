'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storeUser } from '@/lib/auth'; // Import the auth utility

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSignup, setIsSignup] = useState(false);
  const [isOTP, setIsOTP] = useState(false);
  const [userType, setUserType] = useState('USER'); // USER or ADMIN
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    mobile: '',
    otp: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isLogin) {
      if (!formData.email && !formData.mobile) {
        newErrors.email = 'Email or mobile number is required';
        newErrors.mobile = 'Email or mobile number is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else if (isSignup) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.mobile) {
        newErrors.mobile = 'Mobile number is required';
      } else if (!/^\d{10}$/.test(formData.mobile)) {
        newErrors.mobile = 'Mobile number must be 10 digits';
      }
    } else if (isOTP) {
      if (!formData.mobile) {
        newErrors.mobile = 'Mobile number is required';
      } else if (!/^\d{10}$/.test(formData.mobile)) {
        newErrors.mobile = 'Mobile number must be 10 digits';
      }
      
      if (!formData.otp) {
        newErrors.otp = 'OTP is required';
      } else if (!/^\d{6}$/.test(formData.otp)) {
        newErrors.otp = 'OTP must be 6 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email || undefined,
          password: formData.password,
          mobile: formData.mobile || undefined
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store user data
      storeUser(data);
      
      // Redirect based on user role
      if (data.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/user-reports');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          mobile: formData.mobile,
          role: userType
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      
      // After successful signup, show OTP verification screen
      setIsSignup(false);
      setIsOTP(true);
      setMessage('Account created successfully! Please verify your mobile number.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: formData.mobile
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      setMessage('OTP sent successfully! Please check your WhatsApp.');
      // In a real implementation, you wouldn't show the OTP
      // This is just for development/testing
      if (data.otp) {
        setMessage(`OTP sent successfully! For testing purposes, the OTP is: ${data.otp}`);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: formData.mobile,
          otp: formData.otp
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }
      
      // Store user data
      storeUser(data.user);
      
      // Redirect based on user role
      if (data.user.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/user-reports');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setIsSignup(false);
    setIsOTP(false);
    setFormData({
      email: '',
      password: '',
      name: '',
      mobile: '',
      otp: ''
    });
    setErrors({});
    setMessage('');
  };

  const switchToSignup = () => {
    setIsLogin(false);
    setIsSignup(true);
    setIsOTP(false);
    setFormData({
      email: '',
      password: '',
      name: '',
      mobile: '',
      otp: ''
    });
    setErrors({});
    setMessage('');
  };

  const switchToOTP = () => {
    setIsLogin(false);
    setIsSignup(false);
    setIsOTP(true);
    setFormData({
      ...formData,
      otp: ''
    });
    setErrors({});
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLogin && 'Login to CityFix'}
              {isSignup && 'Create Account'}
              {isOTP && 'Verify Mobile Number'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {isLogin && 'Access your civic reporting account'}
              {isSignup && 'Join our community to report issues'}
              {isOTP && 'Enter the OTP sent to your mobile number'}
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('successfully') 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}

          {isLogin && (
            <form onSubmit={handleLogin}>
              {/* Test Credentials Note */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-bold">Test Accounts:</span>
                  <br />
                  Admin: admin@civicreporter.com / admin123
                  <br />
                  User: user@civicreporter.com / user123
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.email || errors.mobile 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                  placeholder="Enter email or mobile number"
                />
                {(errors.email || errors.mobile) && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email || errors.mobile}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.password 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary-gradient btn-pill flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={switchToSignup}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </form>
          )}

          {isSignup && (
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.email 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.mobile 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                  placeholder="Enter 10-digit mobile number"
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.password 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="userType"
                      checked={userType === 'USER'}
                      onChange={() => setUserType('USER')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">General User</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="userType"
                      checked={userType === 'ADMIN'}
                      onChange={() => setUserType('ADMIN')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Admin</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary-gradient btn-pill flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Already have an account? Login
                </button>
              </div>
            </form>
          )}

          {isOTP && (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-4">
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.mobile 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                  placeholder="Enter your mobile number"
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.otp 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                  placeholder="Enter 6-digit OTP"
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.otp}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary-gradient btn-pill flex items-center justify-center mb-4"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isLoading}
                className="w-full btn-secondary btn-pill flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resending OTP...
                  </>
                ) : (
                  'Resend OTP'
                )}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}