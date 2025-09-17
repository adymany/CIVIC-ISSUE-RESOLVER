import { useRef, useEffect, useState } from 'react';
import { loadGoogleMaps, getAddressFromCoordinates } from '@/lib/google-maps';

const GoogleMapComponent = ({ mapCenter, location, setLocation, setMapCenter, setAddress }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [error, setError] = useState(null);

  // Initialize map only on the client side
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) {
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        // Load Google Maps API
        const google = await loadGoogleMaps();
        
        if (!isMounted) return;

        // Clean up any existing map instance
        if (mapInstanceRef.current) {
          // Google Maps API doesn't have a direct remove method, 
          // but we can just create a new one
          mapInstanceRef.current = null;
        }

        // Create map instance
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: mapCenter[0], lng: mapCenter[1] },
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });
        
        mapInstanceRef.current = map;

        // Handle click events
        map.addListener('click', async (e) => {
          if (isMounted) {
            const newLocation = {
              latitude: e.latLng.lat(),
              longitude: e.latLng.lng(),
            };
            
            setLocation(newLocation);
            setMapCenter([newLocation.latitude, newLocation.longitude]);
            
            // Get address from coordinates
            if (setAddress) {
              try {
                const address = await getAddressFromCoordinates(newLocation.latitude, newLocation.longitude);
                setAddress(address || '');
              } catch (err) {
                console.error('Error getting address:', err);
                setAddress('');
              }
            }
            
            // Update marker position
            if (markerRef.current) {
              markerRef.current.setPosition(e.latLng);
            } else {
              markerRef.current = new google.maps.Marker({
                position: e.latLng,
                map: map,
                draggable: true,
              });
              
              // Handle marker drag end
              markerRef.current.addListener('dragend', async (e) => {
                const newPosition = {
                  latitude: e.latLng.lat(),
                  longitude: e.latLng.lng(),
                };
                setLocation(newPosition);
                setMapCenter([newPosition.latitude, newPosition.longitude]);
                
                // Get address from coordinates
                if (setAddress) {
                  try {
                    const address = await getAddressFromCoordinates(newPosition.latitude, newPosition.longitude);
                    setAddress(address || '');
                  } catch (err) {
                    console.error('Error getting address:', err);
                    setAddress('');
                  }
                }
              });
            }
            
            // Center map on the new position
            map.panTo(e.latLng);
          }
        });

        // Add initial marker if location is set
        if (location.latitude && location.longitude) {
          markerRef.current = new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map: map,
            draggable: true,
          });
          
          // Handle marker drag end
          markerRef.current.addListener('dragend', async (e) => {
            const newPosition = {
              latitude: e.latLng.lat(),
              longitude: e.latLng.lng(),
            };
            setLocation(newPosition);
            setMapCenter([newPosition.latitude, newPosition.longitude]);
            
            // Get address from coordinates
            if (setAddress) {
              try {
                const address = await getAddressFromCoordinates(newPosition.latitude, newPosition.longitude);
                setAddress(address || '');
              } catch (err) {
                console.error('Error getting address:', err);
                setAddress('');
              }
            }
          });
        }
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key.');
      }
    };

    initMap();

    // Cleanup function
    return () => {
      isMounted = false;
      
      // Clean up event listeners
      if (mapInstanceRef.current) {
        // Google Maps API handles cleanup automatically when DOM element is removed
        mapInstanceRef.current = null;
      }
      
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [mapCenter, setLocation, setMapCenter, setAddress]);

  // Update map view when center changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapCenter) return;

    try {
      const google = window.google;
      if (google && google.maps) {
        const center = new google.maps.LatLng(mapCenter[0], mapCenter[1]);
        mapInstanceRef.current.panTo(center);
      }
    } catch (error) {
      console.error('Error setting map view:', error);
    }
  }, [mapCenter]);

  // Update marker when location changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    try {
      const google = window.google;
      if (!google || !google.maps) return;

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }

      // Add new marker if location is set
      if (location.latitude && location.longitude) {
        const position = new google.maps.LatLng(location.latitude, location.longitude);
        
        markerRef.current = new google.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          draggable: true,
        });
        
        // Handle marker drag end
        markerRef.current.addListener('dragend', async (e) => {
          const newPosition = {
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng(),
          };
          setLocation(newPosition);
          setMapCenter([newPosition.latitude, newPosition.longitude]);
          
          // Get address from coordinates
          if (setAddress) {
            try {
              const address = await getAddressFromCoordinates(newPosition.latitude, newPosition.longitude);
              setAddress(address || '');
            } catch (err) {
              console.error('Error getting address:', err);
              setAddress('');
            }
          }
        });
        
        // Center map on the new position
        mapInstanceRef.current.panTo(position);
      }
    } catch (error) {
      console.error('Error updating marker:', error);
    }
  }, [location, setLocation, setMapCenter, setAddress]);

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ height: '400px', width: '100%' }} 
        className="rounded-lg border border-gray-300"
      />
    </div>
  );
};

export default GoogleMapComponent;