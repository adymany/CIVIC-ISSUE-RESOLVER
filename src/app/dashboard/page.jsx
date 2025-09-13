'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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

    fetchReports();
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
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-md ${
              filter === 'ALL' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-md ${
              filter === 'PENDING' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-4 py-2 rounded-md ${
              filter === 'IN_PROGRESS' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('RESOLVED')}
            className={`px-4 py-2 rounded-md ${
              filter === 'RESOLVED' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
          >
            Resolved
          </button>
        </div>
        
        <div>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full md:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden bg-white dark:bg-gray-800">
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                  report.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                  report.status === 'RESOLVED' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
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
              
              <div className="flex flex-wrap gap-2">
                {report.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateReportStatus(report.id, 'IN_PROGRESS')}
                      className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                    >
                      Start Work
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'REJECTED')}
                      className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </>
                )}
                
                {report.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateReportStatus(report.id, 'RESOLVED')}
                    className="flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                  >
                    Mark Resolved
                  </button>
                )}
                
                {(report.status === 'RESOLVED' || report.status === 'REJECTED') && (
                  <button
                    onClick={() => updateReportStatus(report.id, 'PENDING')}
                    className="flex-1 px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                  >
                    Reopen
                  </button>
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
