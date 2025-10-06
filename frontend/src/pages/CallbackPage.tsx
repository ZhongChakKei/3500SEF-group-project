import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WAIT_DURATION_SECONDS = 5;

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, handleRedirectCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [hasProcessedCallback, setHasProcessedCallback] = useState(false);

  const hasAuthCode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return Boolean(params.get('code'));
  }, [location.search]);

  useEffect(() => {
    if (!hasAuthCode) {
      setError('No authorization code found');
      setSecondsLeft(null);
      const timeoutId = setTimeout(() => navigate('/', { replace: true }), 2000);
      return () => clearTimeout(timeoutId);
    }

    setError(null);

    if (hasProcessedCallback) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      const success = await handleRedirectCallback();
      if (cancelled) return;

      if (success) {
        setHasProcessedCallback(true);
      } else {
        setError('Unable to complete sign-in');
        setTimeout(() => navigate('/', { replace: true }), 3000);
        setHasProcessedCallback(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasAuthCode, navigate, handleRedirectCallback, hasProcessedCallback]);

  useEffect(() => {
    if (!hasAuthCode || !hasProcessedCallback) {
      return;
    }

    if (loading || !isAuthenticated) {
      setSecondsLeft(null);
      return;
    }

    setSecondsLeft((current) => (current === null ? WAIT_DURATION_SECONDS : current));
  }, [hasAuthCode, hasProcessedCallback, loading, isAuthenticated]);

  useEffect(() => {
    if (secondsLeft === null) {
      return;
    }

    if (secondsLeft <= 0) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const timerId = setTimeout(() => {
      setSecondsLeft((current) => (current === null ? null : current - 1));
    }, 1000);

    return () => clearTimeout(timerId);
  }, [secondsLeft, navigate]);

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

  const isFinalizing = secondsLeft !== null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
        <p className="text-sm text-gray-500">
          {isFinalizing ? 'Securing your workspace...' : 'Completing login...'}
        </p>
        <p className="text-xs text-gray-400">
          {isFinalizing
            ? 'Just a moment while we prepare your dashboard.'
            : 'Exchanging your authorization code for access tokens.'}
        </p>
      </div>
    </div>
  );
};
export default CallbackPage;
