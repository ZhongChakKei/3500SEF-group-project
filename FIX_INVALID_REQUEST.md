# ⚠️ IMPORTANT: Cognito Configuration Required

## The "Invalid request" Error

You're seeing this error because your AWS Cognito App Client is not configured to accept the redirect URI from your local development environment.

## What You Need to Do

### Step 1: Log into AWS Console
1. Go to AWS Console: https://console.aws.amazon.com/
2. Navigate to **Cognito** service
3. Select your User Pool (region: `us-east-2`)

### Step 2: Update App Client Settings
1. Click on **App clients** in the left sidebar
2. Find your app client: `1b4hb6sm1ajh5egefiu88p72rd`
3. Click **Edit**

### Step 3: Add Localhost Callback URLs

Add these URLs to **Allowed callback URLs**:
```
http://localhost:5173/callback
https://main.d2vza85iha5pln.amplifyapp.com/callback
```

Add these URLs to **Allowed sign-out URLs**:
```
http://localhost:5173/
https://main.d2vza85iha5pln.amplifyapp.com/
```

### Step 4: Verify OAuth 2.0 Settings

Make sure these are enabled:
- ✅ **Authorization code grant**
- ✅ OAuth Scopes: `email`, `openid`, `phone`

### Step 5: Save and Test

1. Click **Save changes**
2. Go back to your app: http://localhost:5173/
3. Click "Sign In with AWS Cognito" again

## Current Configuration

Your `.env` file is now configured for **local development**:

```bash
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_LOGOUT_URI=http://localhost:5173/
```

## For Production Deployment

When deploying to AWS Amplify, update `.env` to:

```bash
VITE_REDIRECT_URI=https://main.d2vza85iha5pln.amplifyapp.com/callback
VITE_LOGOUT_URI=https://main.d2vza85iha5pln.amplifyapp.com/
```

Or better yet, set these as environment variables in the Amplify Console.

## Why This Happens

Cognito requires you to explicitly whitelist all redirect URIs for security. This prevents attackers from redirecting your users to malicious sites after authentication.

The error "Invalid request" means:
- ❌ The redirect_uri in the request doesn't match any allowed callback URLs
- ✅ Your client ID and domain are correct
- ✅ Your scopes are valid

## Quick AWS Console Links

- Cognito Console: https://us-east-2.console.aws.amazon.com/cognito/v2/idp/user-pools
- Your Cognito Domain: https://us-east-2yby9toshl.auth.us-east-2.amazoncognito.com

---

**After updating Cognito settings, restart your dev server:**

\`\`\`powershell
# Press Ctrl+C in the terminal running the dev server
# Then restart:
cd frontend
npm run dev
\`\`\`
