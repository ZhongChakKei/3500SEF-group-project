import React from 'react';
import { useAuth } from '../context/AuthContext';

// Background image placed in /public (exact filename loginBG.png as requested).
const BG_URL = '/loginBG.png';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  return (
    <div className="min-h-screen w-full flex items-stretch justify-center relative overflow-hidden bg-surface-50">
      <div
        className="absolute inset-0 bg-[color:#07111b]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-90"
        style={{ backgroundImage: `url(${BG_URL})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(7,17,27,0.85)] via-[rgba(7,17,27,0.75)] to-[rgba(7,17,27,0.9)]" aria-hidden="true" />
      <div className="relative flex flex-1 flex-col lg:flex-row">
        {/* Auth panel only on right */}
        <div className="w-full lg:max-w-md lg:w-[480px] ml-auto flex items-center p-6 sm:p-10">
          <div className="w-full text-center space-y-10">
            <h1 className="text-5xl font-bold text-white tracking-tight">Welcome!</h1>
            <div>
              <button
                onClick={login}
                className="group w-full py-4 rounded-md bg-brand-600 hover:bg-brand-500 active:bg-brand-700 transition-colors text-white font-semibold shadow-lg shadow-brand-900/30 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-[rgba(7,17,27,0.6)]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10h14M11 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Sign In
                </span>
              </button>
              <p className="text-[11px] text-surface-400 mt-6 tracking-wide">Use your organization account to continue.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
