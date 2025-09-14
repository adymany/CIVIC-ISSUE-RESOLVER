'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin } from '@/lib/auth';

export default function Home() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [locationError, setLocationError] = useState('');
  const router = useRouter();

  // Check if user is authenticated and redirect if needed
  useEffect(() => {
    if (isAuthenticated()) {
      if (isAdmin()) {
        router.push('/dashboard');
      } else {
        router.push('/user-reports');
      }
    }
  }, [router]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          // Improved error handling to avoid empty error objects in console
          let errorMessage = 'Unable to get your location.';
          if (err) {
            if (err.message) {
              errorMessage += ' ' + err.message;
            } else if (typeof err === 'string') {
              errorMessage += ' ' + err;
            } else {
              errorMessage += ' An unknown error occurred.';
            }
          } else {
            errorMessage += ' An unknown error occurred.';
          }
          // Fixed error handling to prevent console errors
          try {
            console.error('Error getting location:', errorMessage);
          } catch (consoleError) {
            // Fallback if console.error fails
            console.log('Error getting location:', errorMessage);
          }
          setLocationError('Unable to get your location. Some features may be limited.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Transform Your <span className="text-primary-600">City</span> with <span className="text-secondary-green">CityFix</span>
        </h1>
        <p className="text-lg text-gray-800 dark:text-gray-200 max-w-2xl mx-auto">
          Help improve your community by reporting civic issues like potholes, broken streetlights, 
          and overflowing trash bins. Our system helps local governments respond quickly and efficiently.
        </p>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg max-w-2xl mx-auto">
          <p className="text-blue-800 dark:text-blue-200">
            <span className="font-bold">New users:</span> Click "Get Started" below to create an account and begin reporting issues.
          </p>
          <p className="text-blue-800 dark:text-blue-200 mt-2">
            <span className="font-bold">Returning users:</span> Click "Get Started" and then select "Login" to access your account.
          </p>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <Link 
          href="/auth" 
          className="btn-pill btn-primary-gradient text-center px-6 py-3 text-lg"
        >
          Get Started - Report an Issue
        </Link>
      </div>

      {locationError && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
          {locationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="card">
          <div className="bg-primary-gradient p-4">
            <h2 className="text-xl font-bold text-white">Report an Issue</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              Noticed a problem in your neighborhood? Take a photo and report it to the appropriate authorities.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-secondary-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">Take a photo of the issue</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-secondary-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">Automatic location tagging</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-secondary-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">Track resolution progress</span>
              </li>
            </ul>
            <Link 
              href="/auth" 
              className="btn-pill btn-primary-gradient w-full text-center"
            >
              Login to Report Issue
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="bg-secondary-purple p-4">
            <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              For municipal staff to manage and resolve reported issues efficiently.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-secondary-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">View all reported issues</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-secondary-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">Assign tasks to departments</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-secondary-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">Update resolution status</span>
              </li>
            </ul>
            <Link 
              href="/auth" 
              className="btn-pill bg-secondary-purple text-white w-full text-center shadow-medium hover:shadow-large"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="feature-card">
            <div className="feature-icon bg-blue-100 dark:bg-blue-900">
              <span className="text-2xl font-bold text-primary-600 dark:text-blue-200">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Report</h3>
            <p className="text-gray-800 dark:text-gray-200">
              Citizens report issues with photos and location data
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-green-100 dark:bg-green-900">
              <span className="text-2xl font-bold text-secondary-green dark:text-green-200">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Assign</h3>
            <p className="text-gray-800 dark:text-gray-200">
              System automatically routes issues to the appropriate department
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-purple-100 dark:bg-purple-900">
              <span className="text-2xl font-bold text-secondary-purple dark:text-purple-200">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Resolve</h3>
            <p className="text-gray-800 dark:text-gray-200">
              Departments resolve issues and update status for transparency
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}