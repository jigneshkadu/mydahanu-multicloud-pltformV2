
import React from 'react';
import { X, UserCircle, HelpCircle, Gift, Rocket, Briefcase, ShoppingBag, Plane, Tag, ShieldCheck, LogOut, LogIn } from 'lucide-react';
import { User } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: () => void;
  onAdminPanel: () => void;
  onLogout: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, user, onLogin, onAdminPanel, onLogout }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="bg-[#1a1c2e] text-white p-5 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                 <UserCircle className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                {user ? (
                    <div className="flex flex-col">
                        <span className="font-bold text-sm truncate">{user.name}</span>
                        <span className="text-xs text-gray-400 truncate">{user.email}</span>
                    </div>
                ) : (
                    <div className="font-bold text-sm">Hello, Sign in</div>
                )}
              </div>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X className="w-6 h-6 text-gray-300" /></button>
        </div>

        {/* Menu Items */}
        <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-6">
            
            {/* Admin Section - Always Visible */}
            <div className="border-b border-gray-100 pb-4">
                 <h3 className="font-bold text-gray-900 mb-3 px-2 text-sm uppercase tracking-wider">Admin</h3>
                 <button onClick={() => { onAdminPanel(); onClose(); }} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-700 font-medium">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Admin Panel
                 </button>
            </div>

            {/* Programs & Features */}
            <div className="border-b border-gray-100 pb-4">
                <h3 className="font-bold text-gray-900 mb-3 px-2 text-sm uppercase tracking-wider">Programs & Features</h3>
                <div className="space-y-1">
                    {[
                        { icon: Gift, label: 'Gift Cards & Mobile Recharges' },
                        { icon: Rocket, label: 'Launchpad' },
                        { icon: Briefcase, label: 'Business' },
                        { icon: ShoppingBag, label: 'Handloom and Handicrafts' },
                        { icon: Plane, label: 'Flight Tickets' },
                        { icon: Tag, label: 'Clearance store' },
                    ].map((item, idx) => (
                        <button key={idx} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-600 transition-colors">
                            <item.icon className="w-4 h-4 text-gray-400" /> {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Help & Settings */}
            <div>
                <h3 className="font-bold text-gray-900 mb-3 px-2 text-sm uppercase tracking-wider">Help & Settings</h3>
                <div className="space-y-1">
                    <button className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-600 transition-colors">
                        <UserCircle className="w-4 h-4 text-gray-400" /> Your Account
                    </button>
                    <button className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-gray-600 transition-colors">
                        <HelpCircle className="w-4 h-4 text-gray-400" /> Customer Service
                    </button>
                    {user ? (
                        <button onClick={() => { onLogout(); onClose(); }} className="w-full text-left px-3 py-2.5 hover:bg-red-50 rounded-lg flex items-center gap-3 text-sm text-red-600 font-bold mt-2 transition-colors">
                           <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    ) : (
                        <button onClick={() => { onLogin(); onClose(); }} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-primary font-bold mt-2 transition-colors">
                           <LogIn className="w-4 h-4" /> Sign In
                        </button>
                    )}
                </div>
            </div>

        </div>
      </div>
    </>
  );
};

export default SideMenu;
