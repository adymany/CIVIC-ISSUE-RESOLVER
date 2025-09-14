'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isUser, getUserRole } from '@/lib/auth';

export default function UserReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Check if user is authenticated and is a regular user
  useEffect(() => {
    // In a real application, you would check for a valid session/token
    if (!isAuthenticated() || !isUser()) {
      // Redirect to home page or show unauthorized message
      router.push('/');
      return;
    }
  }, [router]);

  // Fetch user's own reports from API
  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        setLoading(true);
        
        // Get user ID from stored user data
        let userId = null;
        if (typeof window !== 'undefined') {
          const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
          if (userJson) {
            try {
              const user = JSON.parse(userJson);
              userId = user.id;
            } catch (e) {
              console.error('Error parsing user data:', e);
            }
          }
        }
        
        if (!userId) {
          throw new Error('User not found');
        }
        
        // Fetch only this user's reports
        const response = await fetch(`/api/reports?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        setReports(data);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load your reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch reports if user is authenticated and is a regular user
    if (isAuthenticated() && isUser()) {
      fetchUserReports();
    }
  }, []);

  // Function to check if image URL is valid
  const isValidImageUrl = (url) => {
    if (!url) return false;
    // Check if it's a data URL (base64)
    if (url.startsWith('data:image/')) {
      // Check if it's not corrupted (not too long)
      return url.length < 100000; // Limit to 100KB
    }
    // For regular URLs, we'll assume they're valid
    return true;
  };

  // Filter reports based on status and search term
  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'ALL' || report.status === filter;
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">My Reports</h1>
        <div className="text-center py-12">
          <p className="text-gray-700 dark:text-gray-300">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Reports</h1>
        <button
          onClick={() => router.push('/report')}
          className="btn-primary-gradient btn-pill"
        >
          New Report
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`filter-tab ${
              filter === 'ALL' 
                ? 'filter-tab-active' 
                : 'filter-tab-inactive'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`filter-tab ${
              filter === 'PENDING' 
                ? 'bg-yellow-500 text-white' 
                : 'filter-tab-inactive'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`filter-tab ${
              filter === 'IN_PROGRESS' 
                ? 'bg-blue-500 text-white' 
                : 'filter-tab-inactive'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`filter-tab ${
              filter === 'RESOLVED' 
                ? 'bg-green-500 text-white' 
                : 'filter-tab-inactive'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`filter-tab ${
              filter === 'REJECTED' 
                ? 'bg-red-500 text-white' 
                : 'filter-tab-inactive'
            }`}
          >
            Rejected
          </button>
        </div>
        
        <div>
          <input
            type="text"
            placeholder="Search my reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full w-full md:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="card card-hover">
            {isValidImageUrl(report.imageUrl) ? (
              <img 
                src={report.imageUrl} 
                alt={report.title} 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  // If image fails to load, replace with placeholder
                  e.target.src = 'https://placehold.co/600x400?text=No+Image+Available';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">No Image Available</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                <span className={`status-badge ${
                  report.status === 'PENDING' ? 'status-pending' :
                  report.status === 'IN_PROGRESS' ? 'status-in-progress' :
                  report.status === 'RESOLVED' ? 'status-resolved' :
                  report.status === 'REJECTED' ? 'status-rejected' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {report.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{report.description}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Location: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Reported: {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">You haven't submitted any reports yet.</p>
          <button
            onClick={() => router.push('/report')}
            className="mt-4 btn-primary-gradient btn-pill"
          >
            Submit a Report
          </button>
        </div>
      )}
    </div>
  );
}
