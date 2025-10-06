import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-300 p-4">
      <div className="bg-white shadow-xl rounded-lg max-w-md w-full p-10 text-center">
        <h1 className="text-2xl font-semibold mb-3 text-brand-700">Distributed Inventory</h1>
        <p className="text-sm text-gray-500 mb-8">Secure access required. Sign in with your organization account.</p>
        <button
          onClick={login}
          className="w-full py-3 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-medium shadow focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          Login with Cognito
        </button>
        <p className="text-xs text-gray-400 mt-6">Demo system for Apple product inventory & sales management.</p>
      </div>
    </div>
  );
};
export default LoginPage;
