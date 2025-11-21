import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Vendor } from '../types';

interface MapVisualizerProps {
  vendors: Vendor[];
  userLocation: { lat: number; lng: number } | null;
  aiResults?: string;
}

const MapVisualizer: React.FC<MapVisualizerProps> = ({ vendors, userLocation, aiResults }) => {
  // Mock map logic: Generate random positions relative to a center
  // In a real app, this would be Google Maps React component
  
  return (
    <div className="w-full h-[500px] bg-blue-50 relative overflow-hidden border-2 border-gray-200 rounded-lg shadow-inner">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{
             backgroundImage: 'linear-gradient(#2874f0 1px, transparent 1px), linear-gradient(90deg, #2874f0 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* User Location */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
         <div className="w-4 h-4 bg-blue-600 rounded-full animate-ping absolute"></div>
         <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
         <span className="bg-white px-2 py-0.5 rounded text-xs font-bold shadow mt-1">You</span>
      </div>

      {/* Vendors (Randomly placed for visual effect relative to center) */}
      {vendors.slice(0, 5).map((vendor, i) => {
         const offsetTop = 50 + (Math.random() * 40 - 20); // 30% to 70%
         const offsetLeft = 50 + (Math.random() * 60 - 30); // 20% to 80%
         return (
           <div 
             key={vendor.id} 
             className="absolute flex flex-col items-center cursor-pointer group z-0 hover:z-20 transition-all duration-300"
             style={{ top: `${offsetTop}%`, left: `${offsetLeft}%` }}
           >
              <MapPin className="w-8 h-8 text-red-500 drop-shadow-md group-hover:-translate-y-1 transition-transform" fill="currentColor" />
              <div className="bg-white p-2 rounded shadow-lg text-xs w-32 text-center opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1">
                 <p className="font-bold truncate">{vendor.name}</p>
                 <p className="text-gray-500">{vendor.categoryIds[0]}</p>
              </div>
           </div>
         );
      })}

      {/* Map Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
         <button className="bg-white p-2 rounded shadow hover:bg-gray-50">
           <Navigation className="w-5 h-5 text-blue-600" />
         </button>
      </div>
      
      {/* AI Results Overlay */}
      {aiResults && (
        <div className="absolute top-4 left-4 w-80 bg-white/95 backdrop-blur shadow-lg rounded-lg p-4 max-h-[400px] overflow-y-auto z-30">
            <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                <span className="text-yellow-500">✦</span> AI Recommendations
            </h3>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {aiResults}
            </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualizer;