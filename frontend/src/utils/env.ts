const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';

function resolveEnv(key: string, fallback?: string) {
  const value = import.meta.env[key as keyof ImportMetaEnv] as string | undefined;
  if (value) {
    return value;
  }

  if (fallback) {
    console.warn(`[env] Missing ${key}, falling back to runtime value: ${fallback}`);
    return fallback;
  }

  console.error(`[env] Missing required environment variable: ${key}`);
  return '';
}

export const env = {
  apiBaseUrl: resolveEnv('VITE_API_BASE_URL'),
  cognitoRegion: resolveEnv('VITE_COGNITO_REGION'),
  cognitoUserPoolId: resolveEnv('VITE_COGNITO_USER_POOL_ID'),
  cognitoClientId: resolveEnv('VITE_COGNITO_CLIENT_ID'),
  cognitoDomain: resolveEnv('VITE_COGNITO_DOMAIN'),
  oauthScopes: (resolveEnv('VITE_OAUTH_SCOPES') || '').split(/\s+/).filter(Boolean),
  redirectUri: resolveEnv('VITE_REDIRECT_URI', runtimeOrigin ? `${runtimeOrigin}/callback` : undefined),
  logoutUri: resolveEnv('VITE_LOGOUT_URI', runtimeOrigin ? `${runtimeOrigin}/logout` : undefined),
};
