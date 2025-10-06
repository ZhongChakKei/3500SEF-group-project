import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { env } from '../utils/env';
import { jwtDecode } from 'jwt-decode';

interface DecodedIdToken {
  sub: string;
  email?: string;
  name?: string;
  [k: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: DecodedIdToken | null;
  login: () => void;
  logout: () => void;
  handleRedirectCallback: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'auth_tokens_v1';

interface TokenBundle {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_at: number; // epoch ms
}

function buildCognitoUrl(path: string, params: Record<string, string>) {
  const url = new URL(`https://${env.cognitoDomain}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

function generatePKCECodes(): Promise<{ verifier: string; challenge: string }> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = btoa(String.fromCharCode(...Array.from(randomBytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)).then(buf => {
    const challenge = btoa(String.fromCharCode(...Array.from(new Uint8Array(buf))))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return { verifier, challenge };
  });
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<TokenBundle | null>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  });
  const [user, setUser] = useState<DecodedIdToken | null>(() => {
    if (tokens?.id_token) {
      try { return jwtDecode(tokens.id_token); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!tokens?.access_token && (!!tokens.expires_at && Date.now() < tokens.expires_at - 5000);

  const login = useCallback(async () => {
    const { verifier, challenge } = await generatePKCECodes();
    sessionStorage.setItem('pkce_verifier', verifier);
    const authorizeUrl = buildCognitoUrl('oauth2/authorize', {
      response_type: 'code',
      client_id: env.cognitoClientId,
      redirect_uri: env.redirectUri,
      scope: env.oauthScopes.join(' '),
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });
    window.location.assign(authorizeUrl);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTokens(null);
    setUser(null);
    const logoutUrl = buildCognitoUrl('logout', {
      client_id: env.cognitoClientId,
      logout_uri: env.logoutUri,
    });
    window.location.assign(logoutUrl);
  }, []);

  const exchangeCode = async (code: string, verifier: string) => {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.cognitoClientId,
      code,
      redirect_uri: env.redirectUri,
      code_verifier: verifier,
    });
    const resp = await fetch(`https://${env.cognitoDomain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!resp.ok) throw new Error('Token exchange failed');
    const json = await resp.json();
    const expires_at = Date.now() + json.expires_in * 1000;
    const bundle: TokenBundle = { ...json, expires_at };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
    setTokens(bundle);
    try { setUser(jwtDecode(bundle.id_token)); } catch { setUser(null); }
  };

  const handleRedirectCallback = useCallback(async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (!code) return;
    
    const verifier = sessionStorage.getItem('pkce_verifier');
    if (!verifier) {
      console.error('Missing PKCE verifier - redirecting to login');
      // Clear the URL and redirect to landing page
      window.location.href = '/';
      return;
    }
    
    setLoading(true);
    try {
      await exchangeCode(code, verifier);
      sessionStorage.removeItem('pkce_verifier'); // Clean up
      // Clean URL
      url.searchParams.delete('code');
      url.searchParams.delete('state');
      window.history.replaceState({}, document.title, url.pathname);
    } catch (error) {
      console.error('Token exchange failed:', error);
      sessionStorage.removeItem('pkce_verifier');
      // Redirect to login on error
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  }, []);

  const getAccessToken = useCallback(async () => {
    if (!tokens) return null;
    if (Date.now() < tokens.expires_at - 5000) return tokens.access_token;
    // (Optional) refresh flow could be implemented here if refresh_token exists.
    return null; // Force re-login for simplicity.
  }, [tokens]);

  useEffect(() => {
    // On mount, validate stored tokens
    if (tokens && Date.now() > tokens.expires_at) {
      localStorage.removeItem(STORAGE_KEY);
      setTokens(null);
      setUser(null);
    }
  }, []); // eslint-disable-line

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    handleRedirectCallback,
    getAccessToken,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
