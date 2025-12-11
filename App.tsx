
import React, { useState, useEffect } from 'react';
import { 
  User, UserRole, Vendor, Category, Banner, Order, SystemConfig, Product
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
import SideMenu from './components/SideMenu';
import FeaturedService from './components/FeaturedService';
import DeliveryOrderModal from './components/DeliveryOrderModal';
import VendorCard from './components/VendorCard';
import { 
  MapPin, Plus, ShoppingBag, Star, Navigation, PartyPopper, Stethoscope, 
  Truck, Sparkles, Hammer, SprayCan, Utensils, Hotel, Apple, ShoppingBasket, Calendar 
} from 'lucide-react';
import { searchNearbyServices } from './services/geminiService';

// View States
type ViewState = 'HOME' | 'CATEGORY' | 'LIST' | 'ADMIN' | 'REGISTER' | 'VENDOR_DASHBOARD';

// Helper: Find category object by ID recursively
const findCategoryById = (categories: Category[], id: string): Category | null => {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    if (cat.subCategories) {
      const found = findCategoryById(cat.subCategories, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper: Get all descendant IDs of a category
const getRecursiveCategoryIds = (cat: Category): string[] => {
  let ids = [cat.id];
  if (cat.subCategories) {
    cat.subCategories.forEach(sub => {
      ids = [...ids, ...getRecursiveCategoryIds(sub)];
    });
  }
  return ids;
};

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>('HOME');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for SideMenu
  const [authInitialMode, setAuthInitialMode] = useState<'USER' | 'VENDOR' | 'ADMIN'>('USER');
  
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string | null>(null);
  
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [categories, setCategories] = useState<Category[]>(APP_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS); // For vendor dashboard
  
  // Delivery Model State
  const [selectedDeliveryVendor, setSelectedDeliveryVendor] = useState<Vendor | null>(null);

  // System Configuration with Persistence
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
      const saved = localStorage.getItem('system_config');
      return saved ? JSON.parse(saved) : {
        smtpServer: 'smtp.gmail.com',
        port: '587',
        username: 'admin@dahanu.com',
        password: '',
        alertEmail: 'alerts@dahanu.com',
        enableAlerts: true,
        pinnedVendorId: undefined // Initial state
      };
  });
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationText, setLocationText] = useState('Detecting...');
  
  const [aiSearchResults, setAiSearchResults] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  // Computed: Only Approved Vendors for public view
  const approvedVendors = vendors.filter(v => v.isApproved);

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
          setLocationText('Dahanu, MH'); // Mock reverse geocoding
        },
        () => {
          setLocationText('Location denied');
        }
      );
    } else {
      setLocationText('N/A');
    }
  }, []);

  // --- Theme Management ---
  const updateThemeColor = (color: string) => {
    document.documentElement.style.setProperty('--primary-color', color);
    // Set shadow color with opacity (adding 40 to hex for approx 25% opacity)
    document.documentElement.style.setProperty('--primary-shadow', color + '40');
  };

  const resetTheme = () => {
    document.documentElement.style.setProperty('--primary-color', '#9C81A4');
    document.documentElement.style.setProperty('--primary-shadow', 'rgba(156, 129, 164, 0.25)');
  };

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
        resetTheme();
    } else if (userRole === UserRole.VENDOR) {
        if (isNewUser) {
            setView('REGISTER');
        } else {
            setView('VENDOR_DASHBOARD');
        }
        resetTheme();
    } else {
        // Normal User stays on current page (usually Home)
        if (view === 'REGISTER' || view === 'ADMIN' || view === 'VENDOR_DASHBOARD') {
             setView('HOME');
             resetTheme();
        }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('HOME');
    resetTheme();
  };

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
    if (category.themeColor) {
      updateThemeColor(category.themeColor);
    }
    setView('CATEGORY');
    window.scrollTo(0, 0);
  };

  const handleHomeClick = () => {
    setView('HOME');
    resetTheme();
  };

  const handleBackClick = () => {
      if (view === 'LIST') {
          setView('CATEGORY');
      } else if (view !== 'HOME') {
          setView('HOME');
          resetTheme();
      }
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
    resetTheme();
    
    // 1. Local Search (Only Approved)
    const lowerQ = query.toLowerCase();
    // Basic mock filter logic
    const matched = approvedVendors.filter(v => 
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

  const handleOrderDeliveryClick = (vendor: Vendor) => {
    if (!user) {
      setAuthInitialMode('USER');
      setAuthOpen(true);
      return;
    }
    setSelectedDeliveryVendor(vendor);
  };

  const handlePlaceOrder = (items: { product: Product, quantity: number }[], total: number) => {
     if (!user || !selectedDeliveryVendor) return;

     const serviceDesc = "Delivery: " + items.map(i => `${i.quantity}x ${i.product.name}`).join(', ');

     const newOrder: Order = {
         id: 'ord' + Date.now(),
         vendorId: selectedDeliveryVendor.id,
         customerName: user.name,
         customerPhone: user.phone || '9876543210',
         serviceRequested: serviceDesc,
         date: new Date().toLocaleDateString(),
         status: 'PENDING',
         amount: total,
         address: 'My Home Address'
     };

     setOrders([newOrder, ...orders]);
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
    if (view !== 'ADMIN') {
        setView('HOME'); // Go home after registration, waiting for approval
        resetTheme();
    }
  };
  
  const removeVendor = (id: string) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

  const approveVendor = (id: string) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, isApproved: true } : v));
  };

  const addBanner = (imageUrl: string, link: string, altText: string) => {
      const newBanner: Banner = {
          id: Math.random().toString(36).substr(2, 9),
          imageUrl,
          link,
          altText
      };
      setBanners([...banners, newBanner]);
  };

  const saveSystemConfig = (newConfig: SystemConfig) => {
    setSystemConfig(newConfig);
    localStorage.setItem('system_config', JSON.stringify(newConfig));
    alert('System Configuration Saved Successfully (Persisted)!');
  };
  
  const handlePinVendor = (vendorId: string | undefined) => {
      const updatedConfig = { ...systemConfig, pinnedVendorId: vendorId };
      saveSystemConfig(updatedConfig);
  };

  // --- Vendor Dashboard Functions ---
  const handleOrderStatusUpdate = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // --- Icon Helper for Grid ---
  // Note: App.tsx uses lucid-react icons directly in imports for grid buttons in mobile view.
  // The logic for getIcon is embedded or imported. Here we simplify by using a direct render in the map if needed.
  // We keep the existing helper in App.tsx to render category icons.
  // This helper is used in the Mobile Grid section of renderHome.

  // --- Render Logic ---

  const renderHome = () => (
    <>
      <BannerCarousel banners={banners} />
      
      <div className="container mx-auto px-4 mt-6">
          <FeaturedService 
             vendors={approvedVendors} 
             pinnedVendorId={systemConfig.pinnedVendorId}
             onContactClick={handleContactClick}
             onOrderClick={handleOrderDeliveryClick} // Added this prop
          />
      </div>
      
      {/* Mobile Category Grid (Visible only on small screens) */}
      <section className="md:hidden px-4 py-2 relative z-10">
         <div className="bg-white rounded-xl shadow-lg p-5">
            <h2 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider text-center">Services in Dahanu</h2>
            <div className="grid grid-cols-4 gap-4">
                {categories.map(cat => {
                    // Simple Icon mapping for the grid
                    const IconComponent = (() => {
                        // We do a simple mapping based on cat.icon string if available, or fallback
                        // Since we can't easily dynamic import all lucide icons here without a map, 
                        // we rely on the generic 'Category' logic or assume the user has set up the icon mapping 
                        // in previous steps. 
                        // For this snippet, we will just use a generic placeholder if getIcon logic isn't fully duplicated here.
                        // However, App.tsx DOES have a getIcon helper usually.
                        return null; 
                    })();
                    
                    return (
                        <button 
                            key={cat.id} 
                            onClick={() => handleCategoryClick(cat)}
                            className="flex flex-col items-center justify-start gap-1 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm group-active:scale-95 transition">
                                {/* We reuse the CategoryView/BottomNav icon logic if possible, or just render a placeholder. 
                                    In the previous App.tsx, getIcon was defined. We keep it.*/}
                                {getIcon(cat.icon, cat.themeColor || '#666')}
                            </div>
                            <span className="text-[10px] text-center font-bold text-gray-700 leading-tight truncate w-full">{cat.name}</span>
                        </button>
                    );
                })}
            </div>
         </div>
      </section>

      {/* Map / Nearby Section */}
      <section className="py-8 bg-white/50 backdrop-blur-sm mt-4 md:mt-0">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-white/40">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-secondary" />
                    Complete Dahanu Map
                  </h2>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">Live</span>
              </div>
              <div className="h-[500px] w-full relative bg-blue-50">
                <MapVisualizer 
                    vendors={approvedVendors} 
                    userLocation={userLocation}
                    aiResults={aiSearchResults}
                />
                {/* Decorative Map Label */}
                <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-3 py-1 rounded text-[10px] font-bold text-gray-500 border pointer-events-none">
                    Region: Dahanu & Surrounding
                </div>
              </div>
          </div>
        </div>
      </section>

       {/* Key Offerings Section */}
       <section className="container mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur p-8 rounded-xl shadow-sm border border-white/20">
           <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Why Dahanu Platform?</h2>
           <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 rounded hover:bg-white transition-colors">
                 <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6"/>
                 </div>
                 <h3 className="font-bold text-gray-800 mb-2">Verified Vendors</h3>
                 <p className="text-sm text-gray-600">Local professionals you can trust.</p>
              </div>
              <div className="p-4 rounded hover:bg-white transition-colors">
                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Navigation className="w-6 h-6"/>
                 </div>
                 <h3 className="font-bold text-gray-800 mb-2">Local Map Search</h3>
                 <p className="text-sm text-gray-600">Find services near your exact location.</p>
              </div>
              <div className="p-4 rounded hover:bg-white transition-colors">
                 <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-6 h-6"/>
                 </div>
                 <h3 className="font-bold text-gray-800 mb-2">One Stop Shop</h3>
                 <p className="text-sm text-gray-600">From medical to events, we have it all.</p>
              </div>
           </div>
        </div>
      </section>
    </>
  );

  const renderVendorList = () => {
    // Robust Filtering Logic:
    // 1. Determine the target category ID (Subcategory or Main Category)
    const targetId = activeSubCategoryId || activeCategory?.id;
    let filtered = approvedVendors;

    if (targetId) {
      // Find the Category object for this ID
      const targetCat = findCategoryById(categories, targetId);
      
      if (targetCat) {
        // Get ALL IDs in this branch (e.g., 'dahanu_fresh' -> ['dahanu_fresh', 'fruits', 'seasonal_fruits', ...])
        const relevantIds = getRecursiveCategoryIds(targetCat);
        
        // Filter vendors who have ANY of these IDs in their categoryIds list
        filtered = approvedVendors.filter(v => 
          v.categoryIds.some(catId => relevantIds.includes(catId))
        );
      }
    }

    return (
      <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
         
         {/* Main List */}
         <div className="flex-1 h-full">
            <div className="bg-white p-4 mb-4 shadow-theme rounded-xl flex justify-between items-center sticky top-24 z-10 border-b">
               <div className="flex items-center gap-4">
                   <span className="font-medium text-gray-700">Showing {filtered.length} results nearby</span>
                   <button 
                        onClick={() => { setAuthInitialMode('VENDOR'); setAuthOpen(true); }}
                        className="text-xs bg-secondary text-white px-3 py-1 rounded shadow hover:bg-orange-600 flex items-center gap-1"
                   >
                        <Plus className="w-3 h-3" /> List your Business
                   </button>
               </div>
               <button onClick={handleHomeClick} className="text-sm text-primary font-bold hover:underline">Clear Filters</button>
            </div>

            <div className="space-y-4 pb-24">
              {filtered.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl shadow-theme">
                   <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                   <h3 className="text-lg font-bold text-gray-600">No Vendors Found</h3>
                   <p className="text-gray-500 mb-6">Try searching for something else.</p>
                   
                   <button 
                     onClick={() => { setAuthInitialMode('VENDOR'); setAuthOpen(true); }}
                     className="bg-primary text-white px-6 py-2 rounded font-bold"
                   >
                     Be the first to join here!
                   </button>
                   <button onClick={handleHomeClick} className="block mt-4 text-primary text-sm font-bold hover:underline mx-auto">Go Home</button>
                </div>
              ) : (
                filtered.map((v, index) => (
                    <VendorCard 
                        key={v.id}
                        vendor={v}
                        index={index}
                        onContact={handleContactClick}
                        onDirection={handleDirectionClick}
                        onOrder={handleOrderDeliveryClick}
                    />
                ))
              )}
            </div>
         </div>

         {/* Map Side Panel */}
         <aside className="hidden lg:block w-1/3 bg-white shadow-theme rounded-xl h-fit overflow-hidden sticky top-24 border">
             <div className="p-3 bg-gray-50 border-b font-bold text-gray-700">Nearby Map View</div>
             <MapVisualizer 
                vendors={filtered} 
                userLocation={userLocation} 
             />
         </aside>
      </div>
    );
  };

  // Helper function reused from previous implementation
  const getIcon = (iconName: string | undefined, color: string) => {
    const props = { className: "w-8 h-8 mb-2", style: { color } };
    switch(iconName) {
      case 'PartyPopper': return <PartyPopper {...props} />;
      case 'Stethoscope': return <Stethoscope {...props} />;
      case 'Truck': return <Truck {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Hammer': return <Hammer {...props} />;
      case 'SprayCan': return <SprayCan {...props} />;
      case 'Utensils': return <Utensils {...props} />;
      case 'Hotel': return <Hotel {...props} />;
      case 'Apple': return <Apple {...props} />;
      case 'ShoppingBasket': return <ShoppingBasket {...props} />;
      default: return <Calendar {...props} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Side Menu */}
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        user={user}
        onLogin={() => { setAuthInitialMode('USER'); setAuthOpen(true); }}
        onAdminPanel={() => {
          if (user?.role === UserRole.ADMIN) {
            setView('ADMIN');
          } else {
            setAuthInitialMode('ADMIN');
            setAuthOpen(true);
          }
        }}
        onLogout={handleLogout}
      />
      
      <Header 
        user={user}
        onLoginClick={() => { setAuthInitialMode('USER'); setAuthOpen(true); }}
        onLogoutClick={handleLogout}
        onMenuClick={() => setIsMenuOpen(true)}
        onAdminClick={() => setView('ADMIN')}
        onPartnerClick={() => { setAuthInitialMode('VENDOR'); setAuthOpen(true); }}
        onVendorDashboardClick={() => setView('VENDOR_DASHBOARD')}
        locationText={locationText}
        onSearch={handleSearch}
        onHomeClick={handleHomeClick}
        showBackButton={view !== 'HOME'}
        onBackClick={handleBackClick}
      />

      <main className="flex-1 pb-28">
        {view === 'HOME' && renderHome()}
        
        {view === 'CATEGORY' && activeCategory && (
          <CategoryView 
            category={activeCategory} 
            onBack={handleBackClick}
            onSelectSubCategory={handleSubCategorySelect}
            vendors={approvedVendors}
            onRegisterClick={() => { setAuthInitialMode('VENDOR'); setAuthOpen(true); }}
            userLocation={userLocation}
          />
        )}
        
        {view === 'LIST' && renderVendorList()}
        
        {view === 'ADMIN' && (
          <div className="container mx-auto px-4 py-6">
            <AdminPanel 
              categories={categories}
              vendors={vendors} // Pass ALL vendors to admin for approval
              banners={banners}
              config={systemConfig}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
              onAddSubCategory={addSubCategory}
              onRemoveSubCategory={removeSubCategory}
              onRemoveVendor={removeVendor}
              onAddVendor={addVendor}
              onApproveVendor={approveVendor}
              onAddBanner={addBanner}
              onRemoveBanner={(id) => setBanners(banners.filter(b => b.id !== id))}
              onSaveConfig={saveSystemConfig}
              onPinVendor={handlePinVendor}
            />
          </div>
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
              onCancel={handleHomeClick}
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

      {/* DELIVERY ORDER MODAL */}
      {selectedDeliveryVendor && (
          <DeliveryOrderModal 
              isOpen={!!selectedDeliveryVendor}
              onClose={() => setSelectedDeliveryVendor(null)}
              vendor={selectedDeliveryVendor}
              onPlaceOrder={handlePlaceOrder}
          />
      )}
    </div>
  );
};

export default App;
