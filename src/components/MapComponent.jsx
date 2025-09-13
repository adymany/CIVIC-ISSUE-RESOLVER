import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ mapCenter, location, setLocation, setMapCenter }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize map only on the client side
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) {
      return;
    }

    let isMounted = true;

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
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create map instance
      const map = L.map(mapRef.current, {
        center: mapCenter,
        zoom: 13
      });
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Handle click events
      map.on('click', (e) => {
        if (isMounted) {
          setLocation({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
          });
          setMapCenter([e.latlng.lat, e.latlng.lng]);
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup function
    return () => {
      isMounted = false;

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
    };
  }, [mapCenter, setLocation, setMapCenter]);

  // Update map view when center changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapCenter) return;

    try {
      mapInstanceRef.current.setView(mapCenter, 13);
    } catch (error) {
      console.error('Error setting map view:', error);
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
      try {
        markerRef.current = L.marker([location.latitude, location.longitude]).addTo(map);
        map.setView([location.latitude, location.longitude], 15);
      } catch (error) {
        console.error('Error adding marker:', error);
      }
    }
  }, [location]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} className="rounded-lg border border-gray-300" />;
};

export default MapComponent;