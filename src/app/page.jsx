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
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Civic Issue Reporter</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Help improve your community by reporting civic issues like potholes, broken streetlights, 
          and overflowing trash bins. Our system helps local governments respond quickly and efficiently.
        </p>
      </div>

      {locationError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
          {locationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="bg-blue-500 p-4">
            <h2 className="text-xl font-bold text-white">Report an Issue</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Noticed a problem in your neighborhood? Take a photo and report it to the appropriate authorities.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Take a photo of the issue</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Automatic location tagging</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Track resolution progress</span>
              </li>
            </ul>
            <Link 
              href="/report" 
              className="inline-block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Report Issue
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="bg-green-500 p-4">
            <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              For municipal staff to manage and resolve reported issues efficiently.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>View all reported issues</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Assign tasks to departments</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Update resolution status</span>
              </li>
            </ul>
            <Link 
              href="/dashboard" 
              className="inline-block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Report</h3>
            <p className="text-gray-600">
              Citizens report issues with photos and location data
            </p>
          </div>
          <div className="text-center p-4">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Assign</h3>
            <p className="text-gray-600">
              System automatically routes issues to the appropriate department
            </p>
          </div>
          <div className="text-center p-4">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Resolve</h3>
            <p className="text-gray-600">
              Departments resolve issues and update status for transparency
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}