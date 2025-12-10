
import React, { useState, useMemo } from 'react';
import { Category, Vendor } from '../types';
import { MapPin, Crosshair, Loader2 } from 'lucide-react';

interface VendorRegistrationProps {
  categories: Category[];
  onSubmit: (vendor: Partial<Vendor>) => void;
  onCancel: () => void;
}

interface FlattenedCategory {
    id: string;
    name: string;
    pathIds: string[]; // Store full path of IDs (e.g. ['events', 'event_planning', 'decorators'])
}

const VendorRegistration: React.FC<VendorRegistrationProps> = ({ categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    description: '',
    lat: '',
    lng: ''
  });
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [detectingLoc, setDetectingLoc] = useState(false);

  // Helper to flatten subcategories for the dropdown AND keep track of the ID path
  const subCategoriesList = useMemo(() => {
    const parent = categories.find(c => c.id === selectedCategory);
    if (!parent) return [];

    // Recursive flatten that passes down the parent chain
    const flatten = (c: Category, prefix: string = '', parentPath: string[] = []): FlattenedCategory[] => {
          let list: FlattenedCategory[] = [];
          if (c.subCategories) {
              c.subCategories.forEach(sub => {
                  const displayName = prefix ? `${prefix} › ${sub.name}` : sub.name;
                  // The path for this subcategory includes the parent's path + current parent id + this sub id
                  const currentPath = [...parentPath, sub.id];
                  
                  list.push({ 
                      id: sub.id, 
                      name: displayName,
                      pathIds: currentPath
                  });
                  
                  // Recurse
                  list = [...list, ...flatten(sub, displayName, currentPath)];
              });
          }
          return list;
      }
      
      // Initial call with the root category in the path
      return flatten(parent, '', [parent.id]);
  }, [selectedCategory, categories]);

  const handleDetectLocation = () => {
      if (!navigator.geolocation) {
          alert('Geolocation is not supported by your browser');
          return;
      }
      setDetectingLoc(true);

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
          (position) => {
              setFormData({
                  ...formData,
                  lat: position.coords.latitude.toFixed(6),
                  lng: position.coords.longitude.toFixed(6)
              });
              setDetectingLoc(false);
          },
          (error) => {
              console.error("Geolocation Error:", error);
              let msg = 'Unable to retrieve your location.';
              switch(error.code) {
                  case error.PERMISSION_DENIED:
                      msg = "User denied the request for Geolocation.";
                      break;
                  case error.POSITION_UNAVAILABLE:
                      msg = "Location information is unavailable.";
                      break;
                  case error.TIMEOUT:
                      msg = "The request to get user location timed out.";
                      break;
                  default:
                      msg = "An unknown error occurred.";
                      break;
              }
              alert(`${msg} Please ensure location permissions are enabled for this site.`);
              setDetectingLoc(false);
          },
          options
      );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine all category IDs associated with this selection
    let catIds: string[] = [];
    
    if (selectedCategory) {
        if (selectedSubCategory) {
            const selectedSub = subCategoriesList.find(s => s.id === selectedSubCategory);
            if (selectedSub) {
                catIds = selectedSub.pathIds;
            } else {
                catIds = [selectedCategory, selectedSubCategory];
            }
        } else {
            catIds = [selectedCategory];
        }
    }

    const lat = parseFloat(formData.lat) || 0;
    const lng = parseFloat(formData.lng) || 0;

    onSubmit({
      ...formData,
      categoryIds: catIds,
      id: Math.random().toString(36).substr(2, 9),
      maskedContact: formData.contact, // Use real contact for now
      rating: 4.5, // Default rating for new vendors
      isVerified: false,
      isApproved: false, // Default to false for self-registration
      imageUrl: 'https://picsum.photos/300/200', // Placeholder
      priceStart: 0,
      location: { lat, lng, address: formData.address }
    });
    
    alert("Registration submitted! Your business will be listed after Admin approval.");
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md border border-gray-100 max-w-2xl mx-auto my-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Register as a Service Partner</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input 
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Royal Events"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700">Primary Category</label>
            <select 
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white"
                value={selectedCategory}
                onChange={e => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubCategory('');
                }}
            >
                <option value="">Select Category</option>
                {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700">Sub-Category</label>
            <select 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary bg-white disabled:bg-gray-50 disabled:text-gray-400"
                value={selectedSubCategory}
                onChange={e => setSelectedSubCategory(e.target.value)}
                disabled={!selectedCategory || subCategoriesList.length === 0}
                required={subCategoriesList.length > 0}
            >
                <option value="">Select Sub-Category</option>
                {subCategoriesList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            </div>
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Number</label>
          <input 
            required
            type="tel"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
            value={formData.contact}
            onChange={e => setFormData({...formData, contact: e.target.value})}
            placeholder="+91 98765 43210"
          />
        </div>

        {/* Location Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center gap-1"><MapPin className="w-4 h-4"/> Business Location</label>
                <button 
                    type="button" 
                    onClick={handleDetectLocation}
                    disabled={detectingLoc}
                    className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded shadow-sm hover:bg-gray-100 flex items-center gap-1 transition"
                >
                    {detectingLoc ? <Loader2 className="w-3 h-3 animate-spin"/> : <Crosshair className="w-3 h-3"/>}
                    Detect My Location
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                    <label className="text-xs text-gray-500">Latitude</label>
                    <input 
                        type="number" step="any"
                        className="w-full border border-gray-300 rounded py-1 px-2 text-sm"
                        value={formData.lat}
                        onChange={e => setFormData({...formData, lat: e.target.value})}
                        placeholder="0.0000"
                        required
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500">Longitude</label>
                    <input 
                        type="number" step="any"
                        className="w-full border border-gray-300 rounded py-1 px-2 text-sm"
                        value={formData.lng}
                        onChange={e => setFormData({...formData, lng: e.target.value})}
                        placeholder="0.0000"
                        required
                    />
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Full Address</label>
              <textarea 
                required
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Shop No, Street, Landmark..."
              />
            </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description of Services</label>
          <textarea 
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Tell customers what you offer..."
          />
        </div>

        <div className="flex justify-between pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded-md shadow hover:bg-[#7E6885] transition font-bold">Register Business</button>
        </div>
      </form>
    </div>
  );
};

export default VendorRegistration;
