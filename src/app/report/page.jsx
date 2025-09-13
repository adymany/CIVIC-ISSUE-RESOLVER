'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Component to handle map events
const MapClickHandler = ({ 
  setLocation,
  setMapCenter
}) => {
  // Create a stable reference for the event handlers
  const eventHandlers = useMemo(() => ({
    click(e) {
      setLocation({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
      setMapCenter([e.latlng.lat, e.latlng.lng]);
    },
  }), [setLocation, setMapCenter]);

  useMapEvents(eventHandlers);
  return null;
};

// Component to control map view
const MapController = ({ location }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && location.latitude && location.longitude) {
      map.setView([location.latitude, location.longitude], 15);
    }
  }, [map, location]);

  return null;
};

// Custom hook to manage Leaflet map lifecycle
const useLeafletMap = (mapRef, mapCenter, location, setLocation, setMapCenter) => {
  const mapInstance = useRef(null);
  const isMounted = useRef(false);
  
  useEffect(() => {
    isMounted.current = true;
    
    // Clean up function
    return () => {
      isMounted.current = false;
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
          mapInstance.current = null;
        } catch (e) {
          console.warn('Error removing map:', e);
        }
      }
    };
  }, []);
  
  // Initialize or update map
  useEffect(() => {
    if (!mapRef.current || !isMounted.current) return;
    
    // If map already exists, update its view
    if (mapInstance.current) {
      mapInstance.current.setView(mapCenter, 13);
      return;
    }
    
    // Clean up any existing map on the DOM element
    if (mapRef.current._leaflet_id) {
      try {
        delete mapRef.current._leaflet_id;
      } catch (e) {
        console.warn('Error cleaning up map ref:', e);
      }
    }
    
    // Fix for default marker icons in Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
    
    // Create new map instance
    const map = L.map(mapRef.current).setView(mapCenter, 13);
    mapInstance.current = map;
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Handle click events
    map.on('click', (e) => {
      if (isMounted.current) {
        setLocation({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
        setMapCenter([e.latlng.lat, e.latlng.lng]);
      }
    });
    
  }, [mapCenter, setLocation, setMapCenter]);
  
  // Update marker when location changes
  useEffect(() => {
    if (!mapInstance.current || !isMounted.current) return;
    
    const map = mapInstance.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    
    // Add new marker if location is set
    if (location.latitude && location.longitude) {
      L.marker([location.latitude, location.longitude]).addTo(map);
      map.setView([location.latitude, location.longitude], 15);
    }
  }, [location]);
};

// Map component using delayed dynamic import to avoid timing issues
const MapComponent = ({ 
  mapCenter, 
  location, 
  setLocation, 
  setMapCenter 
}) => {
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  // Initialize map with delay to avoid timing issues
  useEffect(() => {
    let timeoutId;
    
    const initMap = () => {
      if (typeof window === 'undefined' || !mapRef.current || mapInitialized) {
        return;
      }
      
      try {
        // Import Leaflet dynamically
        import('leaflet').then((L) => {
          // Use a small delay to ensure any previous map instances are cleaned up
          setTimeout(() => {
            try {
              // Clean up any existing map instance
              if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
              }
              
              // Clean up DOM node if it has a previous map instance
              if (mapRef.current && mapRef.current._leaflet_id) {
                delete mapRef.current._leaflet_id;
              }
              
              // Fix for default marker icons in Leaflet
              delete L.default.Icon.Default.prototype._getIconUrl;
              L.default.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              });
              
              // Create map instance
              const map = L.default.map(mapRef.current, {
                center: mapCenter,
                zoom: 13
              });
              mapInstanceRef.current = map;
              
              // Add tile layer
              L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }).addTo(map);
              
              // Handle click events
              map.on('click', (e) => {
                setLocation({
                  latitude: e.latlng.lat,
                  longitude: e.latlng.lng,
                });
                setMapCenter([e.latlng.lat, e.latlng.lng]);
              });
              
              // Mark as initialized
              setMapInitialized(true);
            } catch (error) {
              console.error('Error initializing map:', error);
            }
          }, 100); // Small delay to avoid timing issues
        }).catch((error) => {
          console.error('Error importing Leaflet:', error);
        });
      } catch (error) {
        console.error('Error in map initialization:', error);
      }
    };
    
    // Use a longer delay for the first initialization
    timeoutId = setTimeout(initMap, 500);
    
    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Clean up marker
      if (markerRef.current && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(markerRef.current);
        } catch (e) {
          console.warn('Error removing marker:', e);
        }
        markerRef.current = null;
      }
      
      // Clean up map
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error removing map:', e);
        }
        mapInstanceRef.current = null;
      }
      
      setMapInitialized(false);
    };
  }, []); // Empty dependency array to run only once
  
  // Update map view when center changes
  useEffect(() => {
    if (mapInstanceRef.current && mapCenter) {
      try {
        mapInstanceRef.current.setView(mapCenter, 13);
      } catch (error) {
        console.error('Error setting map view:', error);
      }
    }
  }, [mapCenter]);
  
  // Update marker when location changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const map = mapInstanceRef.current;
    
    // Remove existing marker
    if (markerRef.current) {
      try {
        map.removeLayer(markerRef.current);
      } catch (e) {
        console.warn('Error removing marker:', e);
      }
      markerRef.current = null;
    }
    
    // Add new marker if location is set
    if (location.latitude && location.longitude) {
      import('leaflet').then((L) => {
        try {
          markerRef.current = L.default.marker([location.latitude, location.longitude]).addTo(map);
          map.setView([location.latitude, location.longitude], 15);
        } catch (error) {
          console.error('Error adding marker:', error);
        }
      }).catch((error) => {
        console.error('Error importing Leaflet for marker:', error);
      });
    }
  }, [location]);
  
  return (
    <div 
      ref={mapRef} 
      style={{ height: '400px', width: '100%' }} 
      className="rounded-lg border border-gray-300"
    >
      {!mapInitialized && (
        <div className="flex items-center justify-center h-full">
          <div>Loading map...</div>
        </div>
      )}
    </div>
  );
};

export default function ReportPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
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
    
    setIsMobile(checkIsMobile());
    setIsHttps(window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
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

  const getLocation = () => {
    // Check if we're on a secure context
    if (!isHttps) {
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
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          setMapCenter([position.coords.latitude, position.coords.longitude]);
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

  // Access camera with multiple fallback options
  const startCamera = async () => {
    try {
      // Check if we're on a secure context
      if (!isHttps) {
        const errorMessage = 'Camera access requires a secure connection (HTTPS). Please access this application through HTTPS or localhost for camera functionality to work.';
        setCameraError(errorMessage);
        setError(errorMessage);
        return;
      }
      
      // Clear any previous camera errors
      setCameraError('');
      
      // Stop any existing stream
      stopMediaTracks();
      
      // Try different camera configurations based on device type
      const constraints = isMobile ? [
        // Mobile-first configurations
        { 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        },
        // Fallback 1: Front camera
        { 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        },
        // Fallback 2: Any rear camera
        { 
          video: { facingMode: 'environment' } 
        },
        // Fallback 3: Any front camera
        { 
          video: { facingMode: 'user' } 
        },
        // Fallback 4: Any camera
        { 
          video: true 
        }
      ] : [
        // Desktop-first configurations
        { 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        },
        // Fallback 1: Any camera
        { 
          video: true 
        }
      ];
      
      let stream = null;
      
      // Try each configuration until one works
      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break; // If successful, break out of the loop
        } catch (err) {
          console.warn(`Camera constraint failed:`, constraint, err);
          // Continue to next constraint
        }
      }
      
      if (!stream) {
        throw new Error('Could not access camera with any configuration');
      }
      
      // Set the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // For mobile devices, we might need to play the video to start the stream
        if (isMobile) {
          try {
            await videoRef.current.play();
          } catch (err) {
            console.warn('Could not auto-play video on mobile:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Could not access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera access was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        errorMessage += 'No camera found or camera not compatible with requested constraints.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (!isHttps) {
        errorMessage += 'Camera access requires a secure connection (HTTPS). Please access this application through HTTPS or localhost.';
      } else {
        errorMessage += 'An unknown error occurred while accessing the camera.';
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

  // Capture image from video stream
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL and set as image
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG with quality 80% to reduce size
      setImage(dataUrl);
      
      // Stop the camera
      stopMediaTracks();
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setCameraError('Image size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        // Compress the image to reduce size
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1200px on longest side)
          let { width, height } = img;
          const maxWidth = 1200;
          const maxHeight = 1200;
          
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
          
          // Get compressed data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setImage(compressedDataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Report a Civic Issue</h1>
      
      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p>Report submitted successfully!</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Issue Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Briefly describe the issue"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide detailed information about the issue"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <div className="mb-2">
            {location.latitude && location.longitude ? (
              <p className="text-sm text-green-600">
                Selected location: {parseFloat(location.latitude).toFixed(6)}, {parseFloat(location.longitude).toFixed(6)}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Click on the map to select the location of the issue
              </p>
            )}
          </div>
          
          {!isHttps && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Secure Connection Required</p>
              <p>Location detection requires a secure connection (HTTPS). Please access this application through HTTPS or localhost for all features to work properly.</p>
            </div>
          )}
          
          <div className="mb-2">
            <button
              type="button"
              onClick={getLocation}
              disabled={!isHttps}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isHttps 
                  ? 'text-white bg-blue-600 hover:bg-blue-700' 
                  : 'text-gray-500 bg-gray-200 cursor-not-allowed'
              }`}
            >
              <svg className="mr-2 -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Detect My Location
            </button>
          </div>
          
          {locationError && (
            <div className="text-sm text-red-600 mb-2">
              {locationError}
            </div>
          )}
          
          {/* Map component */}
          <MapComponent 
            mapCenter={mapCenter} 
            location={location} 
            setLocation={setLocation} 
            setMapCenter={setMapCenter} 
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo
          </label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              {image ? (
                <div className="mb-2">
                  <img src={image} alt="Captured issue" className="w-full h-48 object-cover rounded-md border border-gray-300" />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <>
                  {isCameraSupported ? (
                    <div className="mb-2">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full h-48 object-cover rounded-md border border-gray-300 bg-gray-100"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  ) : (
                    <div className="mb-2 p-8 text-center bg-gray-100 rounded-md border border-gray-300">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        {cameraError || 'Camera not supported or access denied'}
                      </p>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex flex-wrap gap-2">
                {!image && isCameraSupported && (
                  <>
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={!isHttps}
                      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isHttps 
                          ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                          : 'text-gray-500 bg-gray-200 cursor-not-allowed'
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
                      disabled={!isHttps}
                      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isHttps 
                          ? 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                          : 'text-gray-500 bg-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <svg className="mr-2 -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm7 10a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Capture
                    </button>
                  </>
                )}
                
                {!image && (
                  <label className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
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
              
              {!isHttps && isCameraSupported && (
                <div className="text-sm text-yellow-600 mt-2">
                  Camera access requires a secure connection (HTTPS). Please access this application through HTTPS or localhost.
                </div>
              )}
              
              {cameraError && (
                <div className="text-sm text-red-600 mt-2">
                  {cameraError}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
    </div>
  );
}