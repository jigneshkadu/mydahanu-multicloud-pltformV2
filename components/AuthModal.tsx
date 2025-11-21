import React, { useState } from 'react';
import { X, Smartphone, Mail, Briefcase } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, isVendor: boolean) => void;
  initialMode?: 'USER' | 'VENDOR';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, initialMode = 'USER' }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [userType, setUserType] = useState<'USER' | 'VENDOR'>(initialMode);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'INPUT' | 'OTP'>('INPUT');

  if (!isOpen) return null;

  const handleSendOtp = () => {
    if (mobile.length < 10) return alert('Enter valid mobile number');
    setStep('OTP');
    // Simulate sending OTP
    alert(`OTP sent to ${mobile}: 1234`);
  };

  const handleVerify = () => {
    if (otp === '1234') {
      // Simulate email generation
      const email = mobile + (userType === 'VENDOR' ? '@vendor.com' : '@user.com');
      onLoginSuccess(email, userType === 'VENDOR');
      onClose();
    } else {
      alert('Invalid OTP');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-md w-full max-w-3xl h-[550px] flex overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-white md:text-gray-500 z-10">
          <X className="w-6 h-6" />
        </button>

        {/* Left Side - Branding */}
        <div className={`w-2/5 p-8 flex flex-col justify-between text-white hidden md:flex transition-colors duration-300 ${userType === 'VENDOR' ? 'bg-secondary' : 'bg-primary'}`}>
          <div>
            <h2 className="text-3xl font-bold mb-4">
                {userType === 'VENDOR' ? 'Partner Login' : (isLoginMode ? 'Login' : 'Sign up')}
            </h2>
            <p className="text-gray-100 text-sm">
              {userType === 'VENDOR' 
                ? 'Manage your orders, update your catalog and grow your business.'
                : (isLoginMode 
                    ? 'Get access to your Orders, Wishlist and Recommendations' 
                    : 'We do not share your personal details with anyone.')
              }
            </p>
          </div>
          <div className="flex justify-center">
             <div className={`w-32 h-32 rounded-full opacity-50 blur-xl ${userType === 'VENDOR' ? 'bg-yellow-300' : 'bg-blue-500'}`}></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-8 flex flex-col justify-center bg-white">
          {/* Tabs */}
          <div className="flex border-b mb-6">
             <button 
                className={`flex-1 py-2 text-sm font-semibold ${userType === 'USER' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                onClick={() => { setUserType('USER'); setStep('INPUT'); }}
             >
                User Login
             </button>
             <button 
                className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1 ${userType === 'VENDOR' ? 'text-secondary border-b-2 border-secondary' : 'text-gray-400'}`}
                onClick={() => { setUserType('VENDOR'); setStep('INPUT'); }}
             >
                <Briefcase className="w-3 h-3" /> Vendor / Partner
             </button>
          </div>

          {step === 'INPUT' ? (
            <>
              <div className="mb-6 relative">
                <label className="block text-gray-500 text-xs font-bold mb-1">Enter Mobile Number</label>
                <div className={`flex items-center border-b-2 py-2 ${userType === 'VENDOR' ? 'focus-within:border-secondary' : 'focus-within:border-primary'} border-gray-300`}>
                  <Smartphone className="w-5 h-5 text-gray-400 mr-2" />
                  <input 
                    type="tel" 
                    className="w-full outline-none text-gray-800"
                    placeholder="XXXXXXXXXX"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mb-4">
                By continuing, you agree to MultiServe's <span className="text-primary cursor-pointer">Terms of Use</span> and <span className="text-primary cursor-pointer">Privacy Policy</span>.
              </p>

              <button 
                onClick={handleSendOtp}
                className={`w-full text-white font-bold py-3 rounded-sm shadow hover:shadow-lg transition ${userType === 'VENDOR' ? 'bg-secondary hover:bg-orange-600' : 'bg-primary hover:bg-blue-600'}`}
              >
                Request OTP
              </button>

              <div className="mt-8 text-center text-sm">
                 {userType === 'USER' && (
                     <div className="flex items-center justify-center gap-4 mb-4">
                        <button className="text-primary font-semibold">Google</button>
                        <span className="text-gray-300">|</span>
                        <button className="text-primary font-semibold">Microsoft</button>
                     </div>
                 )}
                 
                 <div 
                   className={`${userType === 'VENDOR' ? 'text-secondary' : 'text-primary'} font-medium cursor-pointer mt-4`} 
                   onClick={() => setIsLoginMode(!isLoginMode)}
                 >
                   {isLoginMode ? `New to Dahanu? Create an account` : "Existing User? Log in"}
                 </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">Verify OTP</h3>
              <p className="text-sm text-gray-500 mb-6">Sent to {mobile}</p>
               <div className="mb-6 relative">
                <div className={`flex items-center border-b-2 py-2 ${userType === 'VENDOR' ? 'focus-within:border-secondary' : 'focus-within:border-primary'} border-gray-300`}>
                  <input 
                    type="text" 
                    className="w-full outline-none text-gray-800 text-center text-2xl tracking-widest"
                    placeholder="Enter OTP"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={handleVerify}
                className={`w-full text-white font-bold py-3 rounded-sm shadow hover:shadow-lg transition ${userType === 'VENDOR' ? 'bg-secondary' : 'bg-primary'}`}
              >
                Verify & Login
              </button>
              <button 
                onClick={() => setStep('INPUT')} 
                className={`mt-4 text-sm font-bold w-full text-center ${userType === 'VENDOR' ? 'text-secondary' : 'text-primary'}`}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;