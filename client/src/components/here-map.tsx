import { useEffect, useRef } from 'react';
import { LocationCoordinates } from '@shared/schema';

interface HereMapProps {
  senderLocation?: LocationCoordinates;
  receiverLocation?: LocationCoordinates;
  isVisible: boolean;
}

export function HereMap({ senderLocation, receiverLocation, isVisible }: HereMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const platformRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize HERE Maps
    const initMap = () => {
      if (typeof window !== 'undefined' && (window as any).H) {
        const H = (window as any).H;
        platformRef.current = new H.service.Platform({
          'apikey': process.env.VITE_HERE_API_KEY || 'demo_key'
        });

        const defaultMapTypes = platformRef.current.createDefaultMapTypes();
        mapInstanceRef.current = new H.Map(
          mapRef.current,
          defaultMapTypes.vector.normal.map,
          {
            zoom: 15,
            center: receiverLocation || { lat: 37.7749, lng: -122.4194 }
          }
        );

        // Enable map interaction
        const behavior = new H.mapevents.Behavior();
        const ui = new H.ui.UI.createDefault(mapInstanceRef.current);
      }
    };

    // Load HERE Maps API
    if (!(window as any).H) {
      const script = document.createElement('script');
      script.src = 'https://js.api.here.com/v3/3.1/mapsjs-core.js';
      script.onload = () => {
        const serviceScript = document.createElement('script');
        serviceScript.src = 'https://js.api.here.com/v3/3.1/mapsjs-service.js';
        serviceScript.onload = () => {
          const uiScript = document.createElement('script');
          uiScript.src = 'https://js.api.here.com/v3/3.1/mapsjs-ui.js';
          uiScript.onload = () => {
            const behaviorScript = document.createElement('script');
            behaviorScript.src = 'https://js.api.here.com/v3/3.1/mapsjs-mapevents.js';
            behaviorScript.onload = initMap;
            document.head.appendChild(behaviorScript);
          };
          document.head.appendChild(uiScript);
        };
        document.head.appendChild(serviceScript);
      };
      document.head.appendChild(script);

      // Load HERE Maps CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://js.api.here.com/v3/3.1/mapsjs-ui.css';
      document.head.appendChild(link);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.getViewPort().removeEventListener('resize', () => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !isVisible) return;

    const H = (window as any).H;
    if (!H) return;

    // Clear existing markers
    mapInstanceRef.current.removeObjects(mapInstanceRef.current.getObjects());

    // Add receiver location marker
    if (receiverLocation) {
      const receiverMarker = new H.map.Marker({
        lat: receiverLocation.latitude,
        lng: receiverLocation.longitude
      });
      mapInstanceRef.current.addObject(receiverMarker);
    }

    // Add sender location marker if visible
    if (senderLocation && isVisible) {
      const senderMarker = new H.map.Marker({
        lat: senderLocation.latitude,
        lng: senderLocation.longitude
      });
      mapInstanceRef.current.addObject(senderMarker);

      // Center map to show both locations
      if (receiverLocation) {
        const group = new H.map.Group();
        group.addObject(senderMarker);
        group.addObject(new H.map.Marker({
          lat: receiverLocation.latitude,
          lng: receiverLocation.longitude
        }));
        mapInstanceRef.current.getViewModel().setLookAtData({
          bounds: group.getBoundingBox()
        });
      }
    }
  }, [senderLocation, receiverLocation, isVisible]);

  if (!isVisible) {
    return (
      <div className="h-80 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-.415-.415m4.242 4.242l1.414 1.414m-1.414-1.414L12 12m-1.414-1.414L9.172 9.172" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Location Hidden</h3>
          <p className="text-sm opacity-90">Sender is outside 1km range</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="h-80 w-full rounded-lg overflow-hidden" />
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
