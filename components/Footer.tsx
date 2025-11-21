import React from 'react';
import { Facebook, Twitter, Youtube, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#172337] text-white text-sm py-8 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <h3 className="text-gray-400 uppercase mb-4 font-bold text-xs">About</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">Corporate Info</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-gray-400 uppercase mb-4 font-bold text-xs">Help</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Payments</a></li>
            <li><a href="#" className="hover:underline">Shipping</a></li>
            <li><a href="#" className="hover:underline">Cancellation</a></li>
            <li><a href="#" className="hover:underline">Report Infringement</a></li>
          </ul>
        </div>
        <div>
           <h3 className="text-gray-400 uppercase mb-4 font-bold text-xs">Policy</h3>
           <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Return Policy</a></li>
            <li><a href="#" className="hover:underline">Terms of Use</a></li>
            <li><a href="#" className="hover:underline">Security</a></li>
            <li><a href="#" className="hover:underline">Privacy</a></li>
           </ul>
        </div>
        <div className="border-l border-gray-600 pl-4 hidden md:block">
          <h3 className="text-gray-400 uppercase mb-4 font-bold text-xs">Social</h3>
          <div className="flex gap-4">
            <Facebook className="w-5 h-5 cursor-pointer hover:text-primary" />
            <Twitter className="w-5 h-5 cursor-pointer hover:text-primary" />
            <Youtube className="w-5 h-5 cursor-pointer hover:text-primary" />
            <Instagram className="w-5 h-5 cursor-pointer hover:text-primary" />
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-6 container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-white">
        <div className="flex gap-4 mb-4 md:mb-0">
           <span>© 2024 MultiServe Platform</span>
        </div>
        <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/payment-method_69e7ec.svg" alt="Payments" className="h-4" />
      </div>
    </footer>
  );
};

export default Footer;