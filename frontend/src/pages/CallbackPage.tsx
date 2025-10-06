import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's an authorization code in the URL
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    
    if (!code) {
      setError('No authorization code found');
      setTimeout(() => navigate('/', { replace: true }), 2000);
      return;
    }

    // After authentication completes, redirect to dashboard
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, isAuthenticated, navigate, location]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-gray-500">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
        <p className="text-sm text-gray-500">Completing login...</p>
        <p className="text-xs text-gray-400">Exchanging authorization code for tokens</p>
      </div>
    </div>
  );
};
export default CallbackPage;
