
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
  Truck, Sparkles, Hammer, SprayCan, Utensils, Hotel, Apple, ShoppingBasket, Calendar, ArrowLeft, ShieldCheck, Zap, Headphones, CreditCard
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
  
  const isAdminRoute = window.location.pathname === '/admin';

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
  
  // Admin Route Handling
  useEffect(() => {
    if (isAdminRoute) {
        if (!user || user.role !== UserRole.ADMIN) {
            setAuthInitialMode('ADMIN');
            setAuthOpen(true);
        } else {
            setView('ADMIN');
        }
    }
  }, [isAdminRoute, user]);

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
        if (isAdminRoute) {
            // Stay on admin route
        } else {
            // Redirect to admin route if logged in from main site (though main site link is removed)
             window.location.href = '/admin';
             return;
        }
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
    if (isAdminRoute) {
        window.location.href = '/';
    } else {
        setView('HOME');
        resetTheme();
    }
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

  // --- Render Functions ---

  const renderHome = () => (
    <div className="container mx-auto px-4 py-4 space-y-6 animate-fade-in pb-20">
      <BannerCarousel banners={banners} />
      
      {/* Emergency Bar REMOVED */}

      <div className="mt-2">
           <FeaturedService 
              vendors={approvedVendors} 
              pinnedVendorId={systemConfig.pinnedVendorId}
              onContactClick={handleContactClick}
              onOrderClick={handleOrderDeliveryClick}
           />
      </div>

      {/* Key Features Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
              { icon: ShieldCheck, title: "Verified Professionals", desc: "Background checked" },
              { icon: Zap, title: "Fast Delivery", desc: "On-time service" },
              { icon: Headphones, title: "24/7 Support", desc: "Always here for you" },
              { icon: CreditCard, title: "Secure Payments", desc: "Safe transactions" }
          ].map((feature, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <feature.icon className="w-5 h-5"/>
                  </div>
                  <div className="min-w-0">
                      <h4 className="font-bold text-xs text-gray-800 truncate">{feature.title}</h4>
                      <p className="text-[10px] text-gray-500 truncate">{feature.desc}</p>
                  </div>
              </div>
          ))}
      </div>

      {userLocation && (
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-primary"/> Near You
                 </h3>
                 {isSearching && <span className="text-xs text-gray-500 animate-pulse">Searching...</span>}
              </div>
              <div className="h-48 md:h-64 rounded-lg overflow-hidden relative">
                  <MapVisualizer 
                      vendors={approvedVendors} 
                      userLocation={userLocation}
                      aiResults={aiSearchResults}
                  />
              </div>
           </div>
      )}

      <div>
          <h3 className="font-bold text-lg text-gray-800 mb-3">Explore Services</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.map(cat => (
                  <button 
                      key={cat.id} 
                      onClick={() => handleCategoryClick(cat)}
                      className="flex flex-col items-center justify-center p-3 md:p-4 bg-white rounded-xl shadow-sm border border-transparent hover:border-primary/20 hover:shadow-md transition group"
                  >
                      <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${cat.themeColor || '#9C81A4'}15` }}
                      >
                          {getIcon(cat.icon, cat.themeColor || '#9C81A4')}
                      </div>
                      <span className="text-xs font-bold text-center text-gray-800 line-clamp-2">{cat.name}</span>
                  </button>
              ))}
          </div>
      </div>
    </div>
  );

  const renderVendorList = () => {
     let displayedVendors = approvedVendors;
     
     if (activeSubCategoryId) {
         displayedVendors = displayedVendors.filter(v => v.categoryIds.includes(activeSubCategoryId!));
     } else if (activeCategory) {
         const allIds = getRecursiveCategoryIds(activeCategory);
         displayedVendors = displayedVendors.filter(v => v.categoryIds.some(id => allIds.includes(id)));
     }

     let title = "Services";
     if (activeSubCategoryId) {
         const sub = findCategoryById(categories, activeSubCategoryId);
         title = sub ? sub.name : "Service Providers";
     } else if (activeCategory) {
         title = activeCategory.name;
     }

     return (
         <div className="container mx-auto px-4 py-6 min-h-screen">
             <button onClick={handleBackClick} className="flex items-center gap-1 text-gray-600 hover:text-primary mb-4 font-medium transition">
                 <ArrowLeft className="w-4 h-4" /> Back to Categories
             </button>

             <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500">{displayedVendors.length} results found</p>
                 </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 {displayedVendors.map((vendor, index) => (
                     <VendorCard 
                        key={vendor.id} 
                        vendor={vendor} 
                        index={index} 
                        onContact={handleContactClick}
                        onDirection={handleDirectionClick}
                        onOrder={handleOrderDeliveryClick}
                     />
                 ))}
             </div>
             
             {displayedVendors.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                     <ShoppingBag className="w-12 h-12 mb-3 opacity-20"/>
                     <p>No providers listed here yet.</p>
                     <button onClick={() => { setAuthInitialMode('VENDOR'); setAuthOpen(true); }} className="mt-4 text-primary font-bold hover:underline">
                         Register your business
                     </button>
                 </div>
             )}
         </div>
     );
  };

  // --- Admin Page Render ---
  if (isAdminRoute) {
      return (
          <div className="min-h-screen bg-gray-50 font-sans">
              {user?.role === UserRole.ADMIN ? (
                 <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow-sm">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
                            <p className="text-sm text-gray-500">System Management Console</p>
                        </div>
                        <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded border border-red-100 font-bold hover:bg-red-100 transition">Logout</button>
                    </div>
                    <AdminPanel 
                      categories={categories}
                      vendors={vendors}
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
              ) : (
                 <div className="flex items-center justify-center min-h-screen bg-[#1a1c2e]">
                    <AuthModal 
                        isOpen={true} 
                        onClose={() => window.location.href = '/'} 
                        onLoginSuccess={handleLoginSuccess}
                        initialMode="ADMIN"
                    />
                 </div>
              )}
          </div>
      );
  }

  // --- Public Site Render ---
  return (
    <div className="flex flex-col min-h-screen">
      {/* Side Menu */}
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        user={user}
        onLogin={() => { setAuthInitialMode('USER'); setAuthOpen(true); }}
        onLogout={handleLogout}
      />
      
      <Header 
        user={user}
        onLoginClick={() => { setAuthInitialMode('USER'); setAuthOpen(true); }}
        onLogoutClick={handleLogout}
        onMenuClick={() => setIsMenuOpen(true)}
        onAdminClick={() => { /* Admin link removed from public header, but just in case logic needed */ window.location.href = '/admin'; }}
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

      <Footer />
      
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
