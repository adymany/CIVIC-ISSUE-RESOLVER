import { useRef, useEffect, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';

const AdminGoogleMapComponent = ({ reports }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);
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
          mapInstanceRef.current = null;
        }

        // Default center (will be updated based on reports)
        let center = { lat: 51.505, lng: -0.09 };
        let zoom = 10;

        // Set initial view based on reports
        if (reports.length > 0) {
          const firstReport = reports[0];
          center = { lat: firstReport.latitude, lng: firstReport.longitude };
        }

        // Create map instance
        const map = new google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
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

        // Add markers for reports
        updateMarkers(google, map, reports);
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key.');
      }
    };

    initMap();

    // Cleanup function
    return () => {
      isMounted = false;
      
      // Clean up markers
      markersRef.current.forEach(marker => {
        if (marker) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
      
      // Clean up info windows
      infoWindowsRef.current.forEach(infoWindow => {
        if (infoWindow) {
          infoWindow.close();
        }
      });
      infoWindowsRef.current = [];
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when reports change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateMarkersAsync = async () => {
      try {
        const google = await loadGoogleMaps();
        updateMarkers(google, mapInstanceRef.current, reports);
      } catch (err) {
        console.error('Error updating markers:', err);
      }
    };

    updateMarkersAsync();
  }, [reports]);

  // Function to update markers on the map
  const updateMarkers = (google, map, reports) => {
    // Clean up existing markers and info windows
    markersRef.current.forEach(marker => {
      if (marker) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
    
    infoWindowsRef.current.forEach(infoWindow => {
      if (infoWindow) {
        infoWindow.close();
      }
    });
    infoWindowsRef.current = [];

    // Add new markers for each report
    const bounds = new google.maps.LatLngBounds();
    
    reports.forEach(report => {
      if (report.latitude && report.longitude) {
        try {
          const position = { lat: report.latitude, lng: report.longitude };
          
          // Create marker
          const marker = new google.maps.Marker({
            position: position,
            map: map,
            title: report.title,
          });
          
          // Create info window content with proper text color
          const contentString = `
            <div style="max-width: 200px; color: #000000; background-color: #ffffff; padding: 8px;">
              <h3 style="font-weight: bold; margin: 0 0 5px 0; color: #000000;">${report.title}</h3>
              <p style="font-size: 12px; margin: 0 0 5px 0; color: #000000;">${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}</p>
              ${report.address ? `<p style="font-size: 11px; margin: 0 0 3px 0; color: #000000;"><strong>Address:</strong> ${report.address.substring(0, 60)}${report.address.length > 60 ? '...' : ''}</p>` : ''}
              <p style="font-size: 11px; margin: 0 0 3px 0; color: #000000;"><strong>Status:</strong> ${report.status.replace('_', ' ')}</p>
              <p style="font-size: 11px; margin: 0; color: #000000;"><strong>Reported:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
            </div>
          `;
          
          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: contentString,
          });
          
          // Add click listener to open info window
          marker.addListener('click', () => {
            // Close all other info windows
            infoWindowsRef.current.forEach(iw => {
              if (iw) {
                iw.close();
              }
            });
            
            // Open this info window
            infoWindow.open(map, marker);
          });
          
          markersRef.current.push(marker);
          infoWindowsRef.current.push(infoWindow);
          
          // Extend bounds to include this marker
          bounds.extend(position);
        } catch (error) {
          console.error('Error adding marker:', error);
        }
      }
    });

    // Fit map to show all markers if there are any
    if (markersRef.current.length > 0) {
      if (markersRef.current.length === 1) {
        // If only one marker, center on it with a fixed zoom
        const markerPosition = markersRef.current[0].getPosition();
        map.setCenter(markerPosition);
        map.setZoom(15);
      } else {
        // If multiple markers, fit bounds
        map.fitBounds(bounds);
      }
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ height: '500px', width: '100%' }} 
        className="rounded-lg border border-gray-300"
      />
    </div>
  );
};

export default AdminGoogleMapComponent;