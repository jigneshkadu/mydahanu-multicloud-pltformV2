import React, { useMemo } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Vendor } from '../types';

interface MapVisualizerProps {
  vendors: Vendor[];
  userLocation: { lat: number; lng: number } | null;
  aiResults?: string;
}

const MapVisualizer: React.FC<MapVisualizerProps> = ({ vendors, userLocation, aiResults }) => {
  // Coordinate Projection Logic
  const { markers, center, scale } = useMemo(() => {
    const points = vendors.map((v, i) => ({ 
      lat: v.location.lat, 
      lng: v.location.lng, 
      label: String.fromCharCode(65 + i), // A, B, C...
      type: 'VENDOR',
      name: v.name,
      category: v.categoryIds[0]
    }));

    if (userLocation) {
      points.push({ 
        lat: userLocation.lat, 
        lng: userLocation.lng, 
        label: 'YOU', 
        type: 'USER',
        name: 'Your Location',
        category: ''
      });
    }

    if (points.length === 0) return { markers: [], center: { lat: 0, lng: 0 }, scale: { lat: 1, lng: 1 } };

    // Calculate Bounding Box
    const minLat = Math.min(...points.map(p => p.lat));
    const maxLat = Math.max(...points.map(p => p.lat));
    const minLng = Math.min(...points.map(p => p.lng));
    const maxLng = Math.max(...points.map(p => p.lng));

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Determine scale (degrees per percentage)
    // Add some padding (multiply diff by 1.5)
    const latDiff = Math.max(maxLat - minLat, 0.01) * 2; 
    const lngDiff = Math.max(maxLng - minLng, 0.01) * 2;

    return {
      markers: points,
      center: { lat: centerLat, lng: centerLng },
      scale: { lat: latDiff, lng: lngDiff }
    };
  }, [vendors, userLocation]);

  // Helper to get % position style
  const getPosition = (lat: number, lng: number) => {
    // x: (lng - centerLng) / (lngScale / 2) ... mapped to 50% + offset
    // y: (centerLat - lat) ... (y is inverted)
    
    const x = 50 + ((lng - center.lng) / scale.lng) * 100;
    const y = 50 + ((center.lat - lat) / scale.lat) * 100;

    // Clamp to 5-95% to keep inside box
    return {
      left: `${Math.max(5, Math.min(95, x))}%`,
      top: `${Math.max(5, Math.min(95, y))}%`
    };
  };

  return (
    <div className="w-full h-full min-h-[400px] bg-blue-50 relative overflow-hidden border border-gray-300 rounded-lg shadow-inner">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{
             backgroundImage: 'linear-gradient(#2874f0 1px, transparent 1px), linear-gradient(90deg, #2874f0 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* Markers */}
      {markers.map((m, i) => (
         <div 
           key={i} 
           className="absolute flex flex-col items-center cursor-pointer group z-10 hover:z-30 transition-all duration-300"
           style={getPosition(m.lat, m.lng)}
         >
            {m.type === 'USER' ? (
                <>
                    <div className="w-4 h-4 bg-blue-600 rounded-full animate-ping absolute opacity-75"></div>
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10"></div>
                    <span className="bg-white px-2 py-0.5 rounded text-[10px] font-bold shadow mt-1 z-20 whitespace-nowrap">You</span>
                </>
            ) : (
                <>
                    <div className="relative">
                        <MapPin className="w-10 h-10 text-[#2874f0] drop-shadow-md group-hover:-translate-y-1 transition-transform" fill="#2874f0" />
                        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold">{m.label}</span>
                    </div>
                    <div className="bg-white p-2 rounded shadow-lg text-xs w-32 text-center opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 z-30 pointer-events-none">
                        <p className="font-bold truncate">{m.name}</p>
                        <p className="text-gray-500">{m.category}</p>
                    </div>
                </>
            )}
         </div>
      ))}

      {/* Map Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
         <button className="bg-white p-2 rounded shadow hover:bg-gray-50" title="Recenter">
           <Navigation className="w-5 h-5 text-blue-600" />
         </button>
      </div>
      
      {/* AI Results Overlay */}
      {aiResults && (
        <div className="absolute top-4 left-4 right-12 bg-white/95 backdrop-blur shadow-lg rounded-lg p-4 max-h-[150px] overflow-y-auto z-30 text-xs">
            <h3 className="font-bold text-primary mb-1 flex items-center gap-2">
                <span className="text-yellow-500">✦</span> AI Recommendations
            </h3>
            <div className="text-gray-700 whitespace-pre-line">
                {aiResults}
            </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualizer;