'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin, isAuthenticated, redirectToHome } from '@/lib/auth';
import dynamic from 'next/dynamic';

// Dynamically import the Google Maps component to avoid SSR issues
const AdminMapWithNoSSR = dynamic(
  () => import('../../components/AdminGoogleMapComponent'),
  { ssr: false, loading: () => <div>Loading map...</div> }
);

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(true); // Toggle for map visibility
  const router = useRouter();

  // Check if user is authenticated and is an admin
  useEffect(() => {
    // In a real application, you would check for a valid session/token
    if (!isAuthenticated()) {
      // Redirect to home page if not authenticated
      router.push('/auth');
      return;
    }
    
    if (!isAdmin()) {
      // Redirect to user reports page if not an admin
      router.push('/report');
      return;
    }
  }, [router]);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        setReports(data);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch reports if user is authenticated and is an admin
    if (isAuthenticated() && isAdmin()) {
      fetchReports();
    }
  }, []);

  // Update report status
  const updateReportStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update report');
      }
      
      const updatedReport = await response.json();
      
      // Update the report in state
      setReports(reports.map(report => 
        report.id === id ? updatedReport : report
      ));
    } catch (err) {
      console.error('Error updating report:', err);
      setError('Failed to update report status. Please try again.');
    }
  };

  // Delete report
  const deleteReport = async (id) => {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      
      // Remove the report from state
      setReports(reports.filter(report => report.id !== id));
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('Failed to delete report. Please try again.');
    }
  };

  // Filter reports based on status and search term
  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'ALL' || report.status === filter;
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="text-center py-12">
          <p className="text-gray-700 dark:text-gray-300">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <button
          onClick={() => setShowMap(!showMap)}
          className="btn-pill btn-primary-gradient"
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {showMap && (
        <div className="mb-8 card">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Report Locations</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              All reported issues are shown on the map below
            </p>
          </div>
          <div className="p-4">
            <AdminMapWithNoSSR reports={filteredReports} />
          </div>
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
            placeholder="Search reports..."
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
              {report.address && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Address: {report.address}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Reported: {new Date(report.createdAt).toLocaleDateString()}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {report.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateReportStatus(report.id, 'IN_PROGRESS')}
                      className="flex-1 btn-pill bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Start Work
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'REJECTED')}
                      className="flex-1 btn-pill bg-red-500 text-white hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {report.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateReportStatus(report.id, 'RESOLVED')}
                    className="flex-1 btn-pill bg-green-500 text-white hover:bg-green-600"
                  >
                    Mark Resolved
                  </button>
                )}
                
                {(report.status === 'RESOLVED' || report.status === 'REJECTED') && (
                  <>
                    <button
                      onClick={() => updateReportStatus(report.id, 'PENDING')}
                      className="flex-1 btn-pill bg-gray-500 text-white hover:bg-gray-600"
                    >
                      Reopen
                    </button>
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="flex-1 btn-pill bg-red-700 text-white hover:bg-red-800"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No reports found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}