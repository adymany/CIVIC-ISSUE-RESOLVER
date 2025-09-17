// Utility to load Google Maps API
let googleMapsPromise = null;

export const loadGoogleMaps = () => {
  // Return cached promise if it exists
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Create a new promise if it doesn't exist
  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if google maps is already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    // Check if script is already added
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for the existing script to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          resolve(window.google);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Google Maps script load timeout'));
      }, 10000);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve(window.google);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'));
    };
    
    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// Reverse geocoding function to get address from coordinates
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const google = await loadGoogleMaps();
    
    // Create a Geocoder instance
    const geocoder = new google.maps.Geocoder();
    
    // Perform reverse geocoding
    const response = await new Promise((resolve, reject) => {
      geocoder.geocode(
        { location: { lat: latitude, lng: longitude } },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error('Geocoding failed: ' + status));
          }
        }
      );
    });
    
    return response.formatted_address;
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return null;
  }
};