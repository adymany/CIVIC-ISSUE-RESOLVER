'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUserId, redirectToLogin } from '@/lib/auth';

// Dynamically import the Google Maps component to avoid SSR issues
const MapWithNoSSR = dynamic(
  () => import('../../components/GoogleMapComponent'),
  { ssr: false, loading: () => <div>Loading map...</div> }
);

// MapClickHandler component
const MapClickHandler = ({ 
  setLocation,
  setMapCenter,
  setAddress
}) => {
  // Create a stable reference for the event handlers
  const eventHandlers = useMemo(() => ({
    click(e) {
      setLocation({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
      setMapCenter([e.latlng.lat, e.latlng.lng]);
      setAddress('');
    },
  }), [setLocation, setMapCenter, setAddress]);

  // We'll handle events in the MapComponent instead
  return null;
};

// MapController component
const MapController = ({ location }) => {
  // We'll handle view updates in the MapComponent instead
  return null;
};

// Update the MapComponent usage
const MapComponent = ({ 
  mapCenter, 
  location, 
  setLocation, 
  setMapCenter,
  setAddress
}) => {
  return (
    <div style={{ height: '400px', width: '100%' }} className="rounded-lg border border-gray-300">
      <MapWithNoSSR 
        mapCenter={mapCenter}
        location={location}
        setLocation={setLocation}
        setMapCenter={setMapCenter}
        setAddress={setAddress}
      />
    </div>
  );
};

export default function ReportPage() {
  const router = useRouter();
  
  // Check if user is authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated()) {
        redirectToLogin(router);
        return;
      }
    }
  }, [router]);
  
  // Clear camera error on component mount
  useEffect(() => {
    setCameraError('');
  }, []);
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isLocationRequested, setIsLocationRequested] = useState(false);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default center
  const [isMobile, setIsMobile] = useState(false);
  const [isHttps, setIsHttps] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Check if device is mobile and if connection is secure
  useEffect(() => {
    const checkIsMobile = () => {
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      return mobileRegex.test(navigator.userAgent);
    };
    
    // Check if we're on a secure context (including localhost)
    const isSecureContext = window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '[::1]';
    
    setIsMobile(checkIsMobile());
    setIsHttps(isSecureContext);
  }, []);

  // Check if camera is supported
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsCameraSupported(false);
      setCameraError('Camera API is not supported in your browser. Please try a different browser.');
    }
    
    // Cleanup function to stop media tracks when component unmounts
    return () => {
      stopMediaTracks();
      // Clear any existing video stream
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Auto-detect location when component mounts
  useEffect(() => {
    // Small delay to ensure map is initialized
    const timer = setTimeout(() => {
      getLocation();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch user's reports
  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          return;
        }
        
        setLoading(true);
        const userId = getCurrentUserId();
        
        const response = await fetch('/api/user/reports', {
          headers: {
            'x-user-id': userId
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        setReports(data);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'history') {
      fetchUserReports();
    }
  }, [activeTab]);

  const getLocation = () => {
    // Check if we're on a secure context (but allow localhost)
    const isSecureContext = window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '[::1]';
    
    if (!isSecureContext && window.location.protocol !== 'https:') {
      const errorMessage = 'Location access requires a secure connection (HTTPS). Please access this application through HTTPS or localhost for location detection to work.';
      setLocationError(errorMessage);
      setError(errorMessage);
      return;
    }
    
    if (isLocationRequested) {
      // If we've already requested location, try again with different parameters
      requestLocation();
      return;
    }
    
    setIsLocationRequested(true);
    requestLocation();
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      // Show loading state
      setLocationError('Requesting location access...');
      
      // Different options for mobile vs desktop
      const options = isMobile ? {
        enableHighAccuracy: false, // Mobile devices often have less accurate GPS
        timeout: 20000, // Longer timeout for mobile
        maximumAge: 600000 // Use cached location up to 10 minutes old on mobile
      } : {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // Use cached location up to 5 minutes old on desktop
      };
      
      // Request location with different options to improve success rate
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          setMapCenter([position.coords.latitude, position.coords.longitude]);
          
          // Get address from coordinates
          try {
            // Import the getAddressFromCoordinates function dynamically
            const { getAddressFromCoordinates } = await import('@/lib/google-maps');
            const address = await getAddressFromCoordinates(newLocation.latitude, newLocation.longitude);
            setAddress(address || '');
          } catch (err) {
            console.error('Error getting address:', err);
            setAddress('');
          }
          
          setLocationError('');
        },
        (err) => {
          // Improved error handling with specific messaging for secure context issues
          let errorMessage = 'Unable to get your location. ';
          
          if (err) {
            if (err.message) {
              errorMessage += err.message;
            } else if (err.code !== undefined) {
              // Handle GeolocationPositionError
              switch (err.code) {
                case err.PERMISSION_DENIED:
                  errorMessage += 'Location access was denied. Please enable location services in your browser settings and click "Try Again".';
                  break;
                case err.POSITION_UNAVAILABLE:
                  errorMessage += 'Location information is unavailable. Please check your device settings and click "Try Again".';
                  break;
                case err.TIMEOUT:
                  errorMessage += 'The request to get your location timed out. Please click "Try Again".';
                  break;
                default:
                  errorMessage += 'An unknown error occurred. Please check that you are accessing this site through a secure connection (HTTPS).';
                  break;
              }
            } else {
              errorMessage += 'An unknown error occurred. Please check that you are accessing this site through a secure connection (HTTPS).';
            }
          } else {
            errorMessage += 'An unknown error occurred. Please check that you are accessing this site through a secure connection (HTTPS).';
          }
          
          console.error('Error getting location:', errorMessage);
          handleLocationError(err);
        },
        options
      );
    } else {
      const errorMessage = 'Geolocation is not supported by your browser.';
      setLocationError(errorMessage);
      setError(errorMessage);
    }
  };

  const handleLocationError = (err) => {
    let errorMessage = 'Unable to get your location. ';
    
    if (err && err.code !== undefined) {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage += 'Location access was denied. Please enable location services in your browser settings and click "Try Again".';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage += 'Location information is unavailable. Please check your device settings and click "Try Again".';
          break;
        case err.TIMEOUT:
          errorMessage += 'The request to get your location timed out. Please click "Try Again".';
          break;
        default:
          errorMessage += 'An unknown error occurred. Please check that you are accessing this site through a secure connection (HTTPS).';
          break;
      }
    } else {
      errorMessage += 'An unknown error occurred. Please check that you are accessing this site through a secure connection (HTTPS).';
    }
    
    setLocationError(errorMessage);
    setError(errorMessage);
  };

  // Simplified camera access - back to basics
  const startCamera = async () => {
    try {
      // Clear any previous camera errors
      setCameraError('');
      
      // Stop any existing stream
      stopMediaTracks();
      
      // Simple camera access with basic constraints
      const constraints = { video: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Set the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Could not access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera access was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        errorMessage += 'No camera found or camera not compatible.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += 'An unknown error occurred: ' + (err.message || 'Unknown error');
      }
      
      setCameraError(errorMessage);
      setError(errorMessage);
    }
  };

  // Stop media tracks
  const stopMediaTracks = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Capture image from video stream - simplified version with compression
  const captureImage = () => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        setCameraError('Camera not initialized properly.');
        return;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Check if video is ready
      if (video.readyState < 2) { // HAVE_CURRENT_DATA
        setCameraError('Video stream is not ready yet. Please wait for the camera to initialize and try again.');
        return;
      }
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setCameraError('Video stream not ready. Please wait for the camera to initialize and try again.');
        return;
      }
      
      // Set canvas dimensions to a reasonable size (max 800px on longest side)
      let width = video.videoWidth;
      let height = video.videoHeight;
      const maxWidth = 800;
      const maxHeight = 800;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, width, height);
      
      // Convert to data URL with compression (quality 0.5 = 50%)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      setImage(dataUrl);
      
      // Stop the camera
      stopMediaTracks();
    } catch (error) {
      console.error('Error capturing image:', error);
      setCameraError('Failed to capture image: ' + (error.message || 'Unknown error'));
    }
  };

  // Handle image file selection with compression
  const handleImageChange = (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        // Check file type
        if (!file.type.match('image.*')) {
          setCameraError('Please select a valid image file (JPEG, PNG, etc.)');
          return;
        }
        
        // Check file size (max 3MB)
        if (file.size > 3 * 1024 * 1024) {
          setCameraError('Image size must be less than 5MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            // Compress the image to reduce size
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions (max 800px on longest side)
                let { width, height } = img;
                const maxWidth = 800;
                const maxHeight = 800;
                
                if (width > height) {
                  if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                  }
                } else {
                  if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                  }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw resized image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get compressed data URL (quality 0.5 = 50%)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
                setImage(compressedDataUrl);
                setCameraError(''); // Clear any previous errors
              } catch (imgError) {
                console.error('Error processing image:', imgError);
                setCameraError('Error processing image: ' + (imgError.message || 'Unknown error'));
              }
            };
            img.onerror = (imgError) => {
              console.error('Error loading image:', imgError);
              setCameraError('Error loading image file');
            };
            img.src = e.target.result;
          } catch (readerError) {
            console.error('Error reading file:', readerError);
            setCameraError('Error reading file: ' + (readerError.message || 'Unknown error'));
          }
        };
        reader.onerror = (readerError) => {
          console.error('Error reading file:', readerError);
          setCameraError('Error reading file');
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling image change:', error);
      setCameraError('Error handling image: ' + (error.message || 'Unknown error'));
    }
  };

  // Submit report
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (!location.latitude || !location.longitude) {
      setError('Please select a location on the map.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          imageUrl: image,
          latitude: location.latitude,
          longitude: location.longitude,
          address: address || null, // Include address in the request
        }),
      });
      
      if (!response.ok) {
        // Try to parse error response as JSON, but handle case where it's not valid JSON
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit report');
        } catch (jsonError) {
          // If JSON parsing fails, use the status text or a generic error message
          throw new Error(response.statusText || 'Failed to submit report');
        }
      }
      
      const data = await response.json();
      console.log('Report submitted:', data);
      
      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
      setImage(null);
      setAddress('');
      setLocation({
        latitude: null,
        longitude: null,
      });
    } catch (err) {
      console.error('Error submitting report:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
  
  // Render user's report history
  const renderReportHistory = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-700 dark:text-gray-300">Loading your reports...</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
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
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Reported: {new Date(report.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
        
        {reports.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">You haven't submitted any reports yet.</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Report a Civic Issue</h1>
      
      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'new'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            New Report
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            My Reports
          </button>
        </nav>
      </div>
      
      {activeTab === 'new' ? (
        // Render the new report form
        <>
          {submitSuccess && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded mb-6">
              <p>Report submitted successfully!</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            {/* Map and address section - moved to the top */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                Location *
              </label>
              <div className="mb-2">
                {location.latitude && location.longitude ? (
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    Selected location: {parseFloat(location.latitude).toFixed(6)}, {parseFloat(location.longitude).toFixed(6)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Click on the map to select the location of the issue
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={getLocation}
                  className={`btn-pill flex items-center ${
                    isHttps 
                      ? 'btn-primary-gradient' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <svg className="mr-2 -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Detect My Location
                </button>
              </div>
              
              {locationError && (
                <div className="text-sm text-red-700 dark:text-red-400 mb-4">
                  {locationError}
                </div>
              )}
              
              {/* Map component */}
              <MapComponent 
                mapCenter={mapCenter} 
                location={location} 
                setLocation={setLocation} 
                setMapCenter={setMapCenter}
                setAddress={setAddress}
              />
              
              {/* Address field moved to be below the map */}
              <div className="mt-4">
                <label htmlFor="address" className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  placeholder="Enter address or click on the map to auto-detect"
                />
              </div>
            </div>
            
            {/* Photo section - moved to below the map like it used to be */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                Photo
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  {image ? (
                    <div className="mb-4">
                      <img src={image} alt="Captured issue" className="w-full object-cover rounded-xl border border-gray-300 dark:border-gray-600" style={{ height: '400px' }} />
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="mt-2 text-sm text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : isCameraSupported ? (
                    <div className="mb-4">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full object-cover rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700"
                        style={{ height: '400px' }}
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  ) : (
                    <div className="mb-4 p-8 text-center bg-gray-200 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600">
                      <svg className="mx-auto h-12 w-12 text-gray-600 dark:text-gray-300" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {cameraError || 'Camera not supported or access denied'}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {!image && isCameraSupported && (
                      <>
                        <button
                          type="button"
                          onClick={startCamera}
                          className={`btn-pill flex items-center ${
                            isHttps 
                              ? 'btn-primary-gradient' 
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <svg className="mr-2 -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm7 10a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          Start Camera
                        </button>
                        <button
                          type="button"
                          onClick={captureImage}
                          className={`btn-pill flex items-center ${
                            isHttps 
                              ? 'bg-secondary-green text-white shadow-medium hover:shadow-large' 
                              : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <svg className="mr-2 -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm7 10a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          Capture
                        </button>
                      </>
                    )}
                    
                    {!image && (
                      <label className="btn-pill btn-secondary flex items-center cursor-pointer">
                        <svg className="mr-2 -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  {(cameraError && !image) && (
                    <div className="text-sm text-red-700 dark:text-red-400 mt-2">
                      {cameraError}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Title and description moved to the end */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                Issue Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                placeholder="Briefly describe the issue"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-bold text-gray-900 dark:text-white mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                placeholder="Provide detailed information about the issue"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-pill btn-primary-gradient flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        </>
      ) : (
        // Render user's report history
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Reports</h2>
          {renderReportHistory()}
        </div>
      )}
    </div>
  );
}