export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  cognitoRegion: import.meta.env.VITE_COGNITO_REGION as string,
  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string,
  cognitoDomain: import.meta.env.VITE_COGNITO_DOMAIN as string,
  oauthScopes: (import.meta.env.VITE_OAUTH_SCOPES as string)?.split(/\s+/) ?? [],
  redirectUri: import.meta.env.VITE_REDIRECT_URI as string,
  logoutUri: import.meta.env.VITE_LOGOUT_URI as string,
};
