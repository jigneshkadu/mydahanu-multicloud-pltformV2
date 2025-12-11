
import React, { useState, useEffect } from 'react';
import { X, Loader2, ShoppingBag, Stethoscope, Truck, PartyPopper, Layers } from 'lucide-react';
import { requestOtp, verifyOtp } from '../services/otpService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, role: 'USER' | 'VENDOR' | 'ADMIN', isNewUser: boolean) => void;
  initialMode?: 'USER' | 'VENDOR' | 'ADMIN';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialMode = 'USER' }) => {
  const [userType, setUserType] = useState<'USER' | 'VENDOR' | 'ADMIN'>(initialMode);
  const [viewState, setViewState] = useState<'MOBILE_INPUT' | 'OTP'>('MOBILE_INPUT');
  
  // Form Fields
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState(''); // Used for Admin ID
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState(''); // For Admin
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUserType(initialMode);
    setViewState('MOBILE_INPUT');
    setMobile('');
    setEmail('');
    setOtp('');
    setPassword('');
    setIsLoading(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    // Admin Login Logic (No OTP)
    if (userType === 'ADMIN') {
        if (email.trim().toLowerCase() === 'admin' && (password === 'admin' || password === 'admin123')) {
            onLoginSuccess('admin@dahanu.com', 'ADMIN', false);
            onClose();
        } else {
            alert('Invalid Admin Credentials. \nHint: \nUser: admin \nPass: admin123');
        }
        return;
    }

    // User/Vendor Logic
    if (mobile.length < 10) return alert('Enter valid 10-digit mobile number');
    
    setIsLoading(true);
    
    // Call OTP Service - Pass the ID of the container for Recaptcha
    const result = await requestOtp(mobile, 'recaptcha-container');
    
    setIsLoading(false);

    if (result.success) {
        setViewState('OTP');
    } else {
        alert(result.message);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 4) return alert('Please enter the OTP');

    setIsLoading(true);
    
    // Call OTP Verification Service
    const result = await verifyOtp(mobile, otp);
    
    setIsLoading(false);

    if (result.success) {
      const generatedEmail = `${mobile}@${userType.toLowerCase()}.com`;
      onLoginSuccess(generatedEmail, userType, true);
      onClose();
    } else {
      alert(result.message);
    }
  };

  const handleSocialLogin = (provider: 'Google' | 'Microsoft') => {
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          const mockEmail = `user_${Math.floor(Math.random() * 1000)}@${provider.toLowerCase()}.com`;
          onLoginSuccess(mockEmail, 'USER', true);
          onClose();
      }, 1500);
  };

  // Render Helper: Social Buttons (Small text/icon style to fit layout)
  const renderSocialLinks = () => (
    <div className="flex items-center justify-center gap-6 mt-8">
        <button 
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
            </svg>
            Google
        </button>
        <div className="h-4 w-px bg-gray-300"></div>
        <button 
            onClick={() => handleSocialLogin('Microsoft')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
            <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H1z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            Microsoft
        </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="bg-white rounded w-full max-w-3xl flex overflow-hidden relative shadow-2xl h-[528px]">
        {/* Close Button updated to be visible on white background */}
        <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 z-50 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* --- LEFT PANEL (Primary Blue) --- */}
        <div className="w-2/5 bg-primary p-10 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">
                    {userType === 'ADMIN' ? 'Admin' : 'Login'}
                </h2>
                <p className="text-lg text-white/90 leading-snug font-medium">
                    {userType === 'ADMIN' 
                        ? 'Secure access for system management.' 
                        : 'Get access to your Orders, Wishlist and Recommendations'}
                </p>
            </div>
            
            {/* Custom Multiservice Platform Icon */}
            <div className="absolute bottom-0 left-0 right-0 top-0 flex items-end justify-center pb-12 pointer-events-none">
                <div className="relative scale-110">
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150"></div>
                    <div className="w-40 h-40 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center relative">
                         {/* Services Grid */}
                         <div className="grid grid-cols-2 gap-4 p-4">
                            <div className="bg-white/20 p-2 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg flex items-center justify-center">
                                 <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg flex items-center justify-center">
                                 <Truck className="w-6 h-6 text-white" />
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg flex items-center justify-center">
                                 <PartyPopper className="w-6 h-6 text-white" />
                            </div>
                         </div>
                         {/* Center Hub */}
                         <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary">
                                <Layers className="w-6 h-6 text-primary" />
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- RIGHT PANEL (WHITE) --- */}
        <div className="w-3/5 bg-white p-10 flex flex-col justify-between relative">
            
            <div className="flex-1 flex flex-col">
                {/* Tabs for User/Vendor */}
                {userType !== 'ADMIN' && (
                    <div className="flex gap-6 mb-8 border-b border-gray-200 pb-1">
                        <button 
                            onClick={() => { setUserType('USER'); setViewState('MOBILE_INPUT'); }}
                            className={`text-sm font-semibold pb-2 transition-colors ${userType === 'USER' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            User Login
                        </button>
                        <button 
                            onClick={() => { setUserType('VENDOR'); setViewState('MOBILE_INPUT'); }}
                            className={`text-sm font-semibold pb-2 transition-colors ${userType === 'VENDOR' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            Vendor / Partner
                        </button>
                    </div>
                )}

                {/* --- MOBILE INPUT STATE --- */}
                {viewState === 'MOBILE_INPUT' && (
                    <div className="space-y-6 mt-2">
                         {userType === 'ADMIN' ? (
                             // Admin Fields
                             <>
                                <div className="relative group">
                                     <input 
                                         type="text" 
                                         className="w-full py-2 border-b border-gray-300 focus:border-primary outline-none text-gray-800 transition-colors bg-transparent peer"
                                         value={email}
                                         onChange={(e) => setEmail(e.target.value)}
                                         placeholder=" "
                                     />
                                     <label className="absolute left-0 top-2 text-gray-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-primary peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs">Admin ID</label>
                                 </div>
                                 <div className="relative group">
                                     <input 
                                         type="password" 
                                         className="w-full py-2 border-b border-gray-300 focus:border-primary outline-none text-gray-800 transition-colors bg-transparent peer"
                                         value={password}
                                         onChange={(e) => setPassword(e.target.value)}
                                         placeholder=" "
                                     />
                                     <label className="absolute left-0 top-2 text-gray-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-primary peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs">Password</label>
                                 </div>
                                 <div className="text-xs text-gray-400">Demo Credentials: admin / admin123</div>
                                 <button onClick={handleSendOtp} className="w-full bg-secondary text-white font-bold py-3 rounded-sm shadow-sm hover:bg-orange-600 transition">
                                     Login
                                 </button>
                             </>
                         ) : (
                             // Mobile Field
                             <>
                                 <div className="relative group">
                                    <input 
                                        type="tel" 
                                        className="w-full py-2 border-b border-gray-300 focus:border-primary outline-none text-gray-800 transition-colors bg-transparent peer"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                        maxLength={10}
                                        placeholder=" "
                                    />
                                    <label className="absolute left-0 top-2 text-gray-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-primary peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs">Enter Mobile Number</label>
                                 </div>
                                 
                                 <p className="text-xs text-gray-400 mt-6 leading-relaxed">
                                    By continuing, you agree to MultiServe's <span className="text-primary cursor-pointer">Terms of Use</span> and <span className="text-primary cursor-pointer">Privacy Policy</span>.
                                 </p>

                                 <div id="recaptcha-container"></div>

                                 <button 
                                    onClick={handleSendOtp}
                                    disabled={isLoading}
                                    className="w-full bg-secondary text-white font-bold py-3 rounded-sm shadow-sm hover:bg-orange-600 transition mt-2 flex items-center justify-center"
                                 >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request OTP'}
                                 </button>
                             </>
                         )}
                    </div>
                )}

                {/* --- OTP STATE --- */}
                {viewState === 'OTP' && (
                    <div className="space-y-6 mt-4">
                        <div className="text-sm text-gray-600">
                            Please enter the OTP sent to <br/>
                            <span className="font-medium text-gray-900">+91 {mobile}</span> 
                            <button onClick={() => { setViewState('MOBILE_INPUT'); setOtp(''); }} className="text-primary ml-2 text-xs font-bold">Change</button>
                        </div>

                        <div className="relative group">
                            <input 
                                type="text" 
                                className="w-full py-2 border-b border-gray-300 focus:border-primary outline-none text-gray-800 transition-colors bg-transparent peer text-center tracking-[0.5em] font-bold"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                autoFocus
                                placeholder=" "
                            />
                            <label className="absolute left-0 top-2 text-gray-500 text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-primary peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs">Enter OTP</label>
                        </div>

                        <button 
                            onClick={handleVerify}
                            disabled={isLoading}
                            className="w-full bg-secondary text-white font-bold py-3 rounded-sm shadow-sm hover:bg-orange-600 transition mt-4 flex items-center justify-center"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Area (Socials & Create Account) */}
            {userType !== 'ADMIN' && (
                <div className="mt-auto">
                    {viewState === 'MOBILE_INPUT' && renderSocialLinks()}
                    <div className="mt-8 text-center">
                        <button className="text-primary font-bold text-sm hover:underline">
                            New to Dahanu? Create an account
                        </button>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
