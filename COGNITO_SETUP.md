# Cognito Authentication Setup

This document explains the authentication flow configured for the Distributed Inventory System.

## Overview

The application uses AWS Cognito for authentication with the Authorization Code + PKCE flow. Users start at a landing page and are redirected to Cognito for secure login.

## Authentication Flow

```
1. User visits landing page (/)
   ↓
2. Clicks "Sign In with AWS Cognito"
   ↓
3. Redirected to Cognito Hosted UI login page
   ↓
4. User enters credentials and authenticates
   ↓
5. Cognito redirects back to /callback with authorization code
   ↓
6. App exchanges code for tokens (access, ID, refresh)
   ↓
7. User is redirected to /dashboard (authenticated)
```

## Configuration

### Environment Variables (`.env`)

```bash
# Cognito Configuration
VITE_COGNITO_DOMAIN=us-east-2yby9toshl.auth.us-east-2.amazoncognito.com
VITE_COGNITO_CLIENT_ID=1b4hb6sm1ajh5egefiu88p72rd
VITE_COGNITO_REGION=us-east-2

# OAuth Scopes
VITE_OAUTH_SCOPES=email openid phone

# Redirect URIs
VITE_REDIRECT_URI=https://main.d2vza85iha5pln.amplifyapp.com/callback
VITE_LOGOUT_URI=https://main.d2vza85iha5pln.amplifyapp.com/
```

### Cognito Login URL

The full Cognito login URL is constructed as:
```
https://us-east-2yby9toshl.auth.us-east-2.amazoncognito.com/login
  ?client_id=1b4hb6sm1ajh5egefiu88p72rd
  &response_type=code
  &scope=email+openid+phone
  &redirect_uri=https://main.d2vza85iha5pln.amplifyapp.com/callback
```

## AWS Cognito Setup Requirements

Ensure your Cognito User Pool has:

1. **App Client Settings:**
   - Client ID: `1b4hb6sm1ajh5egefiu88p72rd`
   - Enabled flows: Authorization code grant
   - OAuth scopes: email, openid, phone

2. **Callback URLs (Allowed):**
   - Production: `https://main.d2vza85iha5pln.amplifyapp.com/callback`
   - Local dev: `http://localhost:5173/callback`

3. **Sign out URLs (Allowed):**
   - Production: `https://main.d2vza85iha5pln.amplifyapp.com/`
   - Local dev: `http://localhost:5173/`

4. **Domain:**
   - `us-east-2yby9toshl.auth.us-east-2.amazoncognito.com`

## Local Development

For local testing, update your Cognito App Client to allow:
- Callback URL: `http://localhost:5173/callback`
- Sign out URL: `http://localhost:5173/`

Then update `.env`:
```bash
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_LOGOUT_URI=http://localhost:5173/
```

Run the dev server:
```powershell
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173/

## Pages

- **`/`** - Landing page with login button (public)
- **`/callback`** - OAuth callback handler (public)
- **`/login`** - Alternative login page (public)
- **`/dashboard`** - Main dashboard (protected)
- **`/products`** - Product listing (protected)
- **`/inventory`** - Inventory management (protected)

## Security Notes

- PKCE (Proof Key for Code Exchange) is enabled for enhanced security
- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Access tokens are automatically attached to API requests
- Expired tokens trigger automatic logout and redirect to landing page

## Troubleshooting

### "Invalid redirect_uri"
- Ensure the callback URL is registered in Cognito App Client settings
- Check for trailing slashes and exact URL match

### "User is not authenticated"
- Check browser console for token exchange errors
- Verify Cognito client ID and domain are correct
- Ensure CORS is properly configured on your API

### Local development not working
- Add `http://localhost:5173/callback` to Cognito allowed callbacks
- Clear browser localStorage and try again
- Check `.env` file is loaded (restart Vite server)
