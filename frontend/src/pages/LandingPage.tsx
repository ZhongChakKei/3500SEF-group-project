import React from 'react';
import { Link } from 'react-router-dom';
import { env } from '../utils/env';

const LandingPage: React.FC = () => {
  const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_DEV_MODE === 'true';
  
  const handleLogin = () => {
    const scopes = env.oauthScopes.join(' ');
    
    const loginUrl = `https://${env.cognitoDomain}/login?client_id=${env.cognitoClientId}&response_type=code&scope=${scopes.replace(/ /g, '+')}&redirect_uri=${encodeURIComponent(env.redirectUri)}`;
    
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Distributed Inventory System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your inventory and sales across multiple locations with ease
          </p>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl p-10 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-3">
              Secure Access Required
            </h2>
            <p className="text-gray-600 mb-8">
              Sign in with your organization account to access the inventory management system
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full max-w-md mx-auto py-4 px-6 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-300"
          >
            Sign In with AWS Cognito
          </button>

          {DEV_MODE && (
            <Link
              to="/dashboard"
              className="block w-full max-w-md mx-auto mt-4 py-4 px-6 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center"
            >
              🛠️ Dev Mode: Skip to Dashboard
            </Link>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Powered by AWS Cognito • Secure Authentication
              {DEV_MODE && <span className="ml-2 text-orange-600 font-semibold">• DEV MODE ACTIVE</span>}
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/50 backdrop-blur rounded-lg p-6">
            <div className="text-3xl mb-2">📦</div>
            <h3 className="font-semibold text-gray-900 mb-2">Product Management</h3>
            <p className="text-sm text-gray-600">Track and manage products across locations</p>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-6">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Inventory</h3>
            <p className="text-sm text-gray-600">Monitor stock levels in real-time</p>
          </div>
          <div className="bg-white/50 backdrop-blur rounded-lg p-6">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
            <p className="text-sm text-gray-600">Enterprise-grade security and reliability</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
