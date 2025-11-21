
import React, { useState, useEffect } from 'react';
import { 
  User, UserRole, Vendor, Category, Banner, Order 
} from './types';
import { 
  APP_CATEGORIES, INITIAL_BANNERS, MOCK_VENDORS, MOCK_ORDERS 
} from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import BannerCarousel from './components/BannerCarousel';
import AuthModal from './components/AuthModal';
import VendorRegistration from './components/VendorRegistration';
import AdminPanel from './components/AdminPanel';
import VendorDashboard from './components/VendorDashboard';
import MapVisualizer from './components/MapVisualizer';
import CategoryView from './components/CategoryView';
import BottomNav from './components/BottomNav';
import { PhoneCall, Star, CheckCircle, MapPin, ShoppingBag, Plus, Navigation } from 'lucide-react';
import { searchNearbyServices } from './services/geminiService';

// View States
type ViewState = 'HOME' | 'CATEGORY' | 'LIST' | 'ADMIN' | 'REGISTER' | 'VENDOR_DASHBOARD';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>('HOME');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'USER' | 'VENDOR' | 'ADMIN'>('USER');
  
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string | null>(null);
  
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [categories, setCategories] = useState<Category[]>(APP_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS); // For vendor dashboard
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationText, setLocationText] = useState('Detecting...');
  
  const [aiSearchResults, setAiSearchResults] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  // --- Effects ---
  useEffect(() => {
    // Simulate Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationText('Mumbai, IN'); // Mock reverse geocoding
        },
        () => {
          setLocationText('Location denied');
        }
      );
    } else {
      setLocationText('N/A');
    }
  }, []);

  // --- Handlers ---

  const handleLoginSuccess = (email: string, role: 'USER' | 'VENDOR' | 'ADMIN', isNewUser: boolean) => {
    let userRole = UserRole.USER;
    if (role === 'ADMIN') userRole = UserRole.ADMIN;
    else if (role === 'VENDOR') userRole = UserRole.VENDOR;

    setUser({
      id: 'u' + Math.floor(Math.random() * 1000),
      name: email.split('@')[0] || 'User',
      email: email,
      role: userRole,
      phone: '9876543210'
    });
    setAuthOpen(false);

    // Redirection Logic
    if (userRole === UserRole.ADMIN) {
        setView('ADMIN');
    } else if (userRole === UserRole.VENDOR) {
        if (isNewUser) {
            setView('REGISTER');
        } else {
            setView('VENDOR_DASHBOARD');
        }
    } else {
        // Normal User stays on current page (usually Home)
        if (view === 'REGISTER' || view === 'ADMIN' || view === 'VENDOR_DASHBOARD') {
             setView('HOME');
        }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('HOME');
  };

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
    setView('CATEGORY');
    window.scrollTo(0, 0);
  };

  const handleSubCategorySelect = (subCatId: string) => {
    setActiveSubCategoryId(subCatId);
    setView('LIST');
    window.scrollTo(0, 0);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setView('HOME'); // Show results on home map
    
    // 1. Local Search
    const lowerQ = query.toLowerCase();
    // Basic mock filter logic
    const matched = vendors.filter(v => 
      v.name.toLowerCase().includes(lowerQ) || 
      v.description.toLowerCase().includes(lowerQ) ||
      v.categoryIds.some(c => c.includes(lowerQ))
    );
    
    // 2. AI Search
    let aiText = '';
    if (userLocation) {
       aiText = await searchNearbyServices(query, userLocation.lat, userLocation.lng);
    } else {
       aiText = "Please enable location for AI search.";
    }

    setAiSearchResults(aiText);
    setIsSearching(false);
  };

  const handleContactClick = (vendor: Vendor) => {
    if (!user) {
        setAuthInitialMode('USER');
        setAuthOpen(true);
        return;
    }
    if (window.confirm(`Do you want to call ${vendor.name}?\n\nNumber: ${vendor.contact}`)) {
        window.location.href = `tel:${vendor.contact}`;
    }
  };

  const handleDirectionClick = (vendor: Vendor) => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${vendor.location.lat},${vendor.location.lng}`;
      window.open(url, '_blank');
  };

  // --- Admin Functions ---
  const addCategory = (name: string) => {
    const newCat: Category = { id: name.toLowerCase().replace(/\s/g, '_'), name: name, subCategories: [] };
    setCategories([...categories, newCat]);
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const addSubCategory = (parentId: string, name: string) => {
    setCategories(categories.map(cat => {
      if (cat.id === parentId) {
         const newSub: Category = { id: name.toLowerCase().replace(/\s/g, '_'), name };
         return { ...cat, subCategories: [...(cat.subCategories || []), newSub] };
      }
      return cat;
    }));
  };

  const removeSubCategory = (parentId: string, subId: string) => {
    setCategories(categories.map(cat => {
        if (cat.id === parentId && cat.subCategories) {
           return { ...cat, subCategories: cat.subCategories.filter(s => s.id !== subId) };
        }
        return cat;
    }));
  };

  const addVendor = (v: Partial<Vendor>) => {
    setVendors([...vendors, v as Vendor]);
    // Only redirect to dashboard if not adding from Admin Panel (which lacks auth context here mostly)
    // But since we use this for both, we can check View state or just not redirect if Admin.
    if (view !== 'ADMIN') {
        setView('VENDOR_DASHBOARD');
    }
  };
  
  const removeVendor = (id: string) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

  // --- Vendor Dashboard Functions ---
  const handleOrderStatusUpdate = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // --- Render Logic ---

  const renderHome = () => (
    <>
      <BannerCarousel banners={banners} />
      
      {/* Key Offerings Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
           <h2 className="text-lg font-bold mb-4 text-gray-800">Key Offerings</h2>
           <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                 <p><strong className="text-gray-800">Digital Marketing:</strong> SEO, Social media, and branding services.</p>
                 <p><strong className="text-gray-800">Web Development:</strong> Custom websites, apps and e-commerce solutions.</p>
                 <p><strong className="text-gray-800">Graphic Design:</strong> Logos, banners, and complete visual identity.</p>
              </div>
              <div className="space-y-2">
                 <p><strong className="text-gray-800">IT Consulting:</strong> Cloud solutions, tech support and strategy.</p>
                 <p><strong className="text-gray-800">24/7 Support:</strong> Dedicated team ready for your emergency needs.</p>
              </div>
           </div>
        </div>
      </section>

      {/* Map / Nearby Section */}
      <section className="bg-white py-8 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
             Nearby Services <span className="text-xs font-normal text-gray-500 ml-2">(AI Powered)</span>
          </h2>
          <div className="h-[400px]">
            <MapVisualizer 
                vendors={vendors} 
                userLocation={userLocation}
                aiResults={aiSearchResults}
            />
          </div>
        </div>
      </section>
    </>
  );

  const renderVendorList = () => {
    // Filter Logic
    let filtered = vendors;
    if (activeSubCategoryId) {
      filtered = vendors.filter(v => v.categoryIds.includes(activeSubCategoryId));
    } else if (activeCategory) {
       filtered = vendors; 
    }

    return (
      <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
         
         {/* Main List */}
         <div className="flex-1 h-full overflow-y-auto pr-2">
            <div className="bg-white p-4 mb-4 shadow-sm rounded flex justify-between items-center sticky top-0 z-10 border-b">
               <div className="flex items-center gap-4">
                   <span className="font-medium text-gray-700">Showing {filtered.length} results nearby</span>
                   <button 
                        onClick={() => { setAuthInitialMode('VENDOR'); setAuthOpen(true); }}
                        className="text-xs bg-secondary text-white px-3 py-1 rounded shadow hover:bg-orange-600 flex items-center gap-1"
                   >
                        <Plus className="w-3 h-3" /> List your Business
                   </button>
               </div>
               <button onClick={() => setView('HOME')} className="text-sm text-blue-600 font-bold hover:underline">Clear Filters</button>
            </div>

            <div className="space-y-4 pb-24">
              {filtered.length === 0 ? (
                <div className="bg-white p-12 text-center rounded shadow-sm">
                   <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                   <h3 className="text-lg font-bold text-gray-600">No Vendors Found</h3>
                   <p className="text-gray-500 mb-6">Try searching for something else.</p>
                   
                   <button 
                     onClick={() => { setAuthInitialMode('VENDOR'); setAuthOpen(true); }}
                     className="bg-primary text-white px-6 py-2 rounded font-bold"
                   >
                     Be the first to join here!
                   </button>
                   <button onClick={() => setView('HOME')} className="block mt-4 text-primary text-sm font-bold hover:underline mx-auto">Go Home</button>
                </div>
              ) : (
                filtered.map((v, index) => (
                  <div key={v.id} className="bg-white p-4 rounded shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-4 group border-l-4 border-l-transparent hover:border-l-[#2874f0]">
                    <div className="w-full md:w-48 h-32 bg-gray-100 rounded overflow-hidden relative shrink-0">
                       <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                       {v.isVerified && <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3"/> VERIFIED</div>}
                       
                       {/* Location Marker Badge */}
                       <div className="absolute bottom-1 right-1 bg-[#2874f0] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">
                          {String.fromCharCode(65 + index)}
                       </div>
                    </div>
                    <div className="flex-1">
                       <h3 className="text-lg font-bold text-gray-800 flex justify-between">
                           {v.name}
                       </h3>
                       <div className="flex items-center gap-2 text-sm mb-2">
                          <span className="bg-green-600 text-white px-1.5 rounded text-xs font-bold flex items-center">{v.rating} <Star className="w-3 h-3 ml-0.5 fill-current"/></span>
                          <span className="text-gray-500">120 Ratings</span>
                       </div>
                       <p className="text-sm text-gray-600 mb-2 line-clamp-2">{v.description}</p>
                       <div className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                          <MapPin className="w-3 h-3" /> {v.location.address}
                       </div>
                    </div>
                    <div className="flex flex-col justify-between items-end min-w-[140px]">
                       <div className="text-xl font-bold">₹{v.priceStart}<span className="text-xs font-normal text-gray-500"> onwards</span></div>
                       <div className="w-full space-y-2">
                            <button 
                                onClick={() => handleContactClick(v)}
                                className="bg-primary text-white px-6 py-2.5 rounded-sm font-bold shadow hover:bg-blue-600 w-full flex items-center justify-center gap-2 transition-colors"
                            >
                                <PhoneCall className="w-4 h-4" /> Contact
                            </button>
                            <button 
                                onClick={() => handleDirectionClick(v)}
                                className="bg-white border border-primary text-primary px-6 py-2.5 rounded-sm font-bold shadow-sm hover:bg-blue-50 w-full flex items-center justify-center gap-2 transition-colors"
                            >
                                <Navigation className="w-4 h-4" /> Direction
                            </button>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
         </div>

         {/* Map Side Panel */}
         <aside className="hidden lg:block w-1/3 bg-white shadow-sm rounded h-full overflow-hidden sticky top-24 border">
             <MapVisualizer 
                vendors={filtered} 
                userLocation={userLocation} 
             />
         </aside>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f3f6]">
      <Header 
        user={user}
        onLoginClick={() => { setAuthInitialMode('USER'); setAuthOpen(true); }}
        onLogoutClick={handleLogout}
        onMenuClick={() => {}}
        onAdminClick={() => setView('ADMIN')}
        onPartnerClick={() => { setAuthInitialMode('VENDOR'); setAuthOpen(true); }}
        onVendorDashboardClick={() => setView('VENDOR_DASHBOARD')}
        locationText={locationText}
        onSearch={handleSearch}
        onLogoClick={() => setView('HOME')}
        onAdminLogin={() => { setAuthInitialMode('ADMIN'); setAuthOpen(true); }}
      />

      <main className="flex-1 pb-28">
        {view === 'HOME' && renderHome()}
        
        {view === 'CATEGORY' && activeCategory && (
          <CategoryView 
            category={activeCategory} 
            onBack={() => setView('HOME')}
            onSelectSubCategory={handleSubCategorySelect}
            vendors={vendors}
            onRegisterClick={() => { setAuthInitialMode('VENDOR'); setAuthOpen(true); }}
            userLocation={userLocation}
          />
        )}
        
        {view === 'LIST' && renderVendorList()}
        
        {view === 'ADMIN' && (
          <AdminPanel 
            categories={categories}
            vendors={vendors}
            banners={banners}
            onAddCategory={addCategory}
            onRemoveCategory={removeCategory}
            onAddSubCategory={addSubCategory}
            onRemoveSubCategory={removeSubCategory}
            onRemoveVendor={removeVendor}
            onAddVendor={addVendor}
            onAddBanner={() => {}}
            onRemoveBanner={(id) => setBanners(banners.filter(b => b.id !== id))}
          />
        )}
        
        {view === 'VENDOR_DASHBOARD' && user && (
           <VendorDashboard 
             vendor={MOCK_VENDORS[0]} // Using mock vendor data for current user
             orders={orders}
             onUpdateStatus={handleOrderStatusUpdate}
           />
        )}

        {view === 'REGISTER' && (
           <VendorRegistration 
              categories={categories}
              onSubmit={addVendor}
              onCancel={() => setView('HOME')}
           />
        )}
      </main>

      <Footer onAdminLoginClick={() => { setAuthInitialMode('ADMIN'); setAuthOpen(true); }} />
      
      <BottomNav 
        categories={categories} 
        onCategoryClick={handleCategoryClick} 
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
        initialMode={authInitialMode}
      />
    </div>
  );
};

export default App;
