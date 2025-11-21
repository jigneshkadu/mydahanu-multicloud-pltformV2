import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, User as UserIcon, MapPin, Settings } from 'lucide-react';
import { UserRole, User } from '../types';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onMenuClick: () => void;
  onAdminClick: () => void;
  onPartnerClick: () => void;
  onVendorDashboardClick: () => void;
  locationText: string;
  onSearch: (query: string) => void;
  onLogoClick: () => void;
  onAdminLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    user, onLoginClick, onLogoutClick, onMenuClick, onAdminClick, onPartnerClick, onVendorDashboardClick,
    locationText, onSearch, onLogoClick, onAdminLogin
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <button onClick={onMenuClick} className="lg:hidden p-1">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex flex-col cursor-pointer" onClick={onLogoClick}>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold italic tracking-wider">DAHANU</span>
            </div>
            <a href="#" className="text-xs text-gray-200 hover:underline italic flex items-center gap-0.5">
              Multiservice <span className="text-yellow-400">✦</span>
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative hidden md:flex">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
             <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for services, products, and more (AI Enabled)"
            className="w-full py-2.5 pl-10 pr-4 rounded-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="hidden"></button>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-6 font-medium">
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-gray-100">
                {user.name}
              </button>
              <div className="absolute right-0 top-full w-48 bg-white text-gray-800 shadow-lg rounded-sm hidden group-hover:block pt-2">
                 <div className="flex flex-col">
                    <button className="px-4 py-2 hover:bg-gray-50 text-left">My Profile</button>
                    {user.role === UserRole.ADMIN && (
                        <button onClick={onAdminClick} className="px-4 py-2 hover:bg-gray-50 text-left font-semibold text-primary">Admin Console</button>
                    )}
                    {user.role === UserRole.VENDOR && (
                        <button onClick={onVendorDashboardClick} className="px-4 py-2 hover:bg-gray-50 text-left font-semibold text-secondary">Vendor Dashboard</button>
                    )}
                    <button onClick={onLogoutClick} className="px-4 py-2 hover:bg-gray-50 text-left">Logout</button>
                 </div>
              </div>
            </div>
          ) : (
            <button onClick={onLoginClick} className="bg-white text-primary px-8 py-1 font-bold rounded-sm shadow-sm hover:bg-gray-100">
              Login
            </button>
          )}

          <div className="hidden lg:flex flex-col items-start text-xs">
             <span className="font-bold flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</span>
             <span className="truncate max-w-[100px]">{locationText}</span>
          </div>

          <button onClick={onPartnerClick} className="flex items-center gap-1 text-white hover:text-yellow-300 transition">
            <span className="hidden lg:inline">Partner with us</span>
          </button>
          
          <button onClick={onLogoClick} className="flex items-center gap-1">
             <span className="hidden lg:inline">Home</span>
          </button>

          <button onClick={onAdminLogin} className="flex items-center gap-1 text-white hover:text-yellow-300 transition" title="Admin Login">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Search (Visible only on small screens) */}
      <div className="md:hidden px-2 pb-2">
        <form onSubmit={handleSearchSubmit} className="relative">
           <input 
             type="text" 
             placeholder="Search services..." 
             className="w-full py-2 px-4 rounded-sm text-gray-800 focus:outline-none"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
           <Search className="absolute right-3 top-2.5 h-5 w-5 text-primary" />
        </form>
      </div>
    </header>
  );
};

export default Header;