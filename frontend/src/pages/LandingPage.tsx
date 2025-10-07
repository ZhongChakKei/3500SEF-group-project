import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_DEV_MODE === 'true';
  const { login } = useAuth();
  const handleLogin = () => login();
  return (
    <div className="min-h-screen w-full flex items-center justify-end relative overflow-hidden bg-[#0a1929]">
      {/* Background image with proper sizing */}
      <div
        className="absolute inset-0 bg-[#0a1929]"
        style={{ 
          backgroundImage: `url(/loginBG.png)`,
          backgroundSize: 'contain',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat'
        }}
        aria-hidden="true"
      />
      {/* Subtle overlay for text contrast without hiding the illustration */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(10,25,41,0.3)] to-[rgba(10,25,41,0.85)]" aria-hidden="true" />
      
      {/* Auth panel - right side only with semi-transparent background */}
      <div className="relative w-full lg:max-w-md lg:w-[480px] flex items-center p-6 sm:p-12 min-h-screen">
        <div className="w-full text-center space-y-12 bg-[rgba(15,30,50,0.6)] backdrop-blur-md rounded-2xl p-8 sm:p-10 border border-white/10 shadow-2xl">
          <h1 className="text-6xl font-bold text-white tracking-tight drop-shadow-lg">Welcome!</h1>
          <div className="space-y-6">
            <button
              onClick={handleLogin}
              className="w-full py-4 rounded-lg bg-[#0066CC] hover:bg-[#0052A3] active:bg-[#004080] transition-colors text-white font-semibold shadow-lg shadow-black/50 focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Sign In
            </button>
            {DEV_MODE && (
              <Link to="/dashboard" className="block w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm text-center font-medium transition-colors border border-white/20">Dev: Skip to Dashboard</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
