
import React from 'react';
import { ArrowLeft, ArrowRight, Calendar, PartyPopper, Stethoscope, Truck, Sparkles, Hammer, SprayCan, Utensils, Hotel, PlusCircle } from 'lucide-react';
import { Category, Vendor } from '../types';
import MapVisualizer from './MapVisualizer';

interface CategoryViewProps {
  category: Category;
  onBack: () => void;
  onSelectSubCategory: (id: string) => void;
  vendors: Vendor[];
  onRegisterClick?: () => void;
  userLocation: { lat: number; lng: number } | null;
}

// Helper to get all child IDs recursively
const getAllCategoryIds = (cat: Category): string[] => {
  let ids = [cat.id];
  if (cat.subCategories) {
    cat.subCategories.forEach(sub => {
      ids = [...ids, ...getAllCategoryIds(sub)];
    });
  }
  return ids;
};

const CategoryView: React.FC<CategoryViewProps> = ({ category, onBack, onSelectSubCategory, vendors, onRegisterClick, userLocation }) => {
  // Dynamic Icon mapping
  const getIcon = (iconName: string | undefined) => {
    switch (iconName) {
      case 'PartyPopper': return <PartyPopper className="w-8 h-8 text-white" />;
      case 'Stethoscope': return <Stethoscope className="w-8 h-8 text-white" />;
      case 'Truck': return <Truck className="w-8 h-8 text-white" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8 text-white" />;
      case 'Hammer': return <Hammer className="w-8 h-8 text-white" />;
      case 'SprayCan': return <SprayCan className="w-8 h-8 text-white" />;
      case 'Utensils': return <Utensils className="w-8 h-8 text-white" />;
      case 'Hotel': return <Hotel className="w-8 h-8 text-white" />;
      default: return <Calendar className="w-8 h-8 text-white" />;
    }
  };

  // Filter vendors relevant to this category tree
  const categoryVendorIds = getAllCategoryIds(category);
  const relevantVendors = vendors.filter(v => v.categoryIds.some(id => categoryVendorIds.includes(id)));

  // Count vendors for a specific subcategory
  const getVendorCount = (cat: Category) => {
    const relevantIds = getAllCategoryIds(cat);
    return vendors.filter(v => v.categoryIds.some(id => relevantIds.includes(id))).length;
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-[80vh]">
      <button 
        onClick={onBack}
        className="flex items-center gap-1 text-primary font-medium hover:underline mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center shadow-md">
            {getIcon(category.icon)}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
        </div>
        
        {onRegisterClick && (
            <button 
              onClick={onRegisterClick}
              className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg shadow hover:bg-orange-600 transition font-bold"
            >
              <PlusCircle className="w-5 h-5" /> List your Business
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {category.subCategories?.map((subCat) => (
          <div key={subCat.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col h-full">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{subCat.name}</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                {subCat.description || `Browse vendors for ${subCat.name}`}
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
               <span className="bg-blue-50 text-primary px-3 py-1 rounded-full text-xs font-bold">
                 {getVendorCount(subCat)} Vendors
               </span>
               
               <button 
                 onClick={() => onSelectSubCategory(subCat.id)}
                 className="flex items-center gap-1 text-primary font-bold text-sm hover:translate-x-1 transition-transform"
               >
                 View List <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </div>
        ))}

        {/* Add Service / Register CTA Card */}
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
           <div className="bg-white p-3 rounded-full mb-4 shadow-sm">
             <PlusCircle className="w-8 h-8 text-primary" />
           </div>
           <h3 className="text-lg font-bold text-gray-800 mb-2">Own a Service?</h3>
           <p className="text-sm text-gray-600 mb-4">Join our platform and reach thousands of customers in Dahanu.</p>
           <button 
             onClick={onRegisterClick} 
             className="text-primary font-bold hover:underline"
           >
             Register Now &rarr;
           </button>
        </div>
        
        {(!category.subCategories || category.subCategories.length === 0) && (
            <div className="col-span-3 text-center py-12 text-gray-400">
                No sub-categories found. <button onClick={() => onSelectSubCategory(category.id)} className="text-primary underline">View all {category.name}</button>
            </div>
        )}
      </div>

      {/* Nearby Map Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          Nearby {category.name} Providers
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Map View</span>
        </h2>
        <div className="h-[300px] w-full">
          <MapVisualizer 
            vendors={relevantVendors} 
            userLocation={userLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryView;

