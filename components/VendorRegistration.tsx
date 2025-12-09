import React, { useState, useMemo } from 'react';
import { Category, Vendor } from '../types';

interface VendorRegistrationProps {
  categories: Category[];
  onSubmit: (vendor: Partial<Vendor>) => void;
  onCancel: () => void;
}

const VendorRegistration: React.FC<VendorRegistrationProps> = ({ categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    description: ''
  });
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  // Helper to flatten subcategories for the dropdown
  const subCategoriesList = useMemo(() => {
    const parent = categories.find(c => c.id === selectedCategory);
    if (!parent) return [];

    const flatten = (c: Category, prefix: string = ''): {id: string, name: string}[] => {
          let list: {id: string, name: string}[] = [];
          if (c.subCategories) {
              c.subCategories.forEach(sub => {
                  const displayName = prefix ? `${prefix} › ${sub.name}` : sub.name;
                  list.push({ id: sub.id, name: displayName });
                  list = [...list, ...flatten(sub, displayName)];
              });
          }
          return list;
      }
      return flatten(parent);
  }, [selectedCategory, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const catIds = [];
    if (selectedCategory) catIds.push(selectedCategory);
    if (selectedSubCategory) catIds.push(selectedSubCategory);

    onSubmit({
      ...formData,
      categoryIds: catIds,
      id: Math.random().toString(36).substr(2, 9),
      maskedContact: formData.contact, // Use real contact for now
      rating: 0,
      isVerified: false,
      imageUrl: 'https://picsum.photos/300/200',
      priceStart: 0,
      location: { lat: 0, lng: 0, address: formData.address }
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Partner Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input 
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700">Primary Category</label>
            <select 
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:text-gray-400"
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Number</label>
          <input 
            required
            type="tel"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
            value={formData.contact}
            onChange={e => setFormData({...formData, contact: e.target.value})}
          />
          <p className="text-xs text-gray-500 mt-1">Your number will be hidden from users.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea 
            required
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description of Services</label>
          <textarea 
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded font-medium shadow hover:bg-blue-700">Register Business</button>
        </div>
      </form>
    </div>
  );
};

export default VendorRegistration;