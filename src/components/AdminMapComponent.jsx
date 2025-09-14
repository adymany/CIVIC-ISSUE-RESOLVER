import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AdminMapComponent = ({ reports }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

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
        center: [51.505, -0.09], // Default center
        zoom: 10
      });
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Set initial view based on reports
      if (reports.length > 0) {
        const firstReport = reports[0];
        map.setView([firstReport.latitude, firstReport.longitude], 10);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup function
    return () => {
      isMounted = false;

      // Clean up markers
      markersRef.current.forEach(marker => {
        if (mapInstanceRef.current && marker) {
          try {
            mapInstanceRef.current.removeLayer(marker);
          } catch (e) {
            console.warn('Error removing marker:', e);
          }
        }
      });
      markersRef.current = [];

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
  }, []);

  // Update markers when reports change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing markers
    markersRef.current.forEach(marker => {
      if (marker) {
        try {
          map.removeLayer(marker);
        } catch (e) {
          console.warn('Error removing marker:', e);
        }
      }
    });
    markersRef.current = [];

    // Add new markers for each report
    reports.forEach(report => {
      if (report.latitude && report.longitude) {
        try {
          // Create marker with popup
          const marker = L.marker([report.latitude, report.longitude]).addTo(map);
          
          // Create popup content
          const popupContent = `
            <div>
              <h3 class="font-bold">${report.title}</h3>
              <p class="text-sm">${report.description.substring(0, 100)}${report.description.length > 100 ? '...' : ''}</p>
              <p class="text-xs"><strong>Status:</strong> ${report.status.replace('_', ' ')}</p>
              <p class="text-xs"><strong>Reported:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
            </div>
          `;
          
          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
        } catch (error) {
          console.error('Error adding marker:', error);
        }
      }
    });

    // Fit map to show all markers if there are any
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [reports]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} className="rounded-lg border border-gray-300" />;
};

export default AdminMapComponent;