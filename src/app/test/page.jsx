'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHealthStatus(data);
      } catch (err) {
        setError('Failed to fetch health status: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Deployment Test Page</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">API Health Check</h2>
        
        {loading && (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
            <span>Checking health status...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {healthStatus && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p><strong>Status:</strong> {healthStatus.status}</p>
            <p><strong>Message:</strong> {healthStatus.message}</p>
            <p><strong>Timestamp:</strong> {healthStatus.timestamp}</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><a href="/" className="text-blue-600 hover:underline">Home Page</a></li>
          <li><a href="/report" className="text-blue-600 hover:underline">Report Issue</a></li>
          <li><a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a></li>
          <li><a href="/api/health" className="text-blue-600 hover:underline">Health API Endpoint</a></li>
        </ul>
      </div>
    </div>
  );
}