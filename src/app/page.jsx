'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [locationError, setLocationError] = useState('');

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
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Civic Issue Reporter</h1>
        <p className="text-lg text-gray-800 dark:text-gray-200 max-w-2xl mx-auto">
          Help improve your community by reporting civic issues like potholes, broken streetlights, 
          and overflowing trash bins. Our system helps local governments respond quickly and efficiently.
        </p>
      </div>

      {locationError && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
          {locationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-300 dark:border-gray-600">
          <div className="bg-blue-600 p-4">
            <h2 className="text-xl font-bold text-white">Report an Issue</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              Noticed a problem in your neighborhood? Take a photo and report it to the appropriate authorities.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">Take a photo of the issue</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">Automatic location tagging</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">Track resolution progress</span>
              </li>
            </ul>
            <Link 
              href="/report" 
              className="inline-block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Report Issue
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-300 dark:border-gray-600">
          <div className="bg-green-600 p-4">
            <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              For municipal staff to manage and resolve reported issues efficiently.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">View all reported issues</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">Assign tasks to departments</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">Update resolution status</span>
              </li>
            </ul>
            <Link 
              href="/dashboard" 
              className="inline-block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Report</h3>
            <p className="text-gray-800 dark:text-gray-200">
              Citizens report issues with photos and location data
            </p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-800 dark:text-green-200">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Assign</h3>
            <p className="text-gray-800 dark:text-gray-200">
              System automatically routes issues to the appropriate department
            </p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-800 dark:text-purple-200">3</span>
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