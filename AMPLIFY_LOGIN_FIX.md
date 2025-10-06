# 🔧 Amplify Login Redirect Issue - Fix Guide

## Problem
After clicking the login button on your Amplify production site, you get:
- **Error**: `ERR_NAME_NOT_RESOLVED`
- **Message**: "無法連上這個網站" (Cannot connect to this site)
- **URL attempting to access**: `https://us-east-2-yby9toshl.auth...` ❌

## Root Cause
The Cognito domain URL has an **extra hyphen** causing DNS resolution to fail.

### ❌ Wrong URL (with extra hyphen):
```
us-east-2-yby9toshl.auth.us-east-2.amazoncognito.com
```

### ✅ Correct URL (no hyphen):
```
us-east-2yby9toshl.auth.us-east-2.amazoncognito.com
```

---

## ✅ Solution Steps

### Step 1: Configure AWS Amplify Environment Variables

Go to your **AWS Amplify Console** and set these environment variables:

1. Navigate to: **Amplify Console** → Your App → **Environment variables**

2. Add/Update these variables:

```bash
VITE_API_BASE_URL=https://your-lambda-function-url
VITE_COGNITO_REGION=us-east-2
VITE_COGNITO_USER_POOL_ID=us-east-2_XXXXXXX
VITE_COGNITO_CLIENT_ID=1b4hb6sm1ajh5egefiu88p72rd
VITE_COGNITO_DOMAIN=us-east-2yby9toshl.auth.us-east-2.amazoncognito.com
VITE_OAUTH_SCOPES=email openid phone
VITE_REDIRECT_URI=https://main.d2vza85iha5pln.amplifyapp.com/callback
VITE_LOGOUT_URI=https://main.d2vza85iha5pln.amplifyapp.com/
VITE_DEV_MODE=false
```

**⚠️ CRITICAL**: Make sure `VITE_COGNITO_DOMAIN` has **NO HYPHEN** between `us-east-2` and `yby9toshl`

### Step 2: Verify Cognito Callback URLs

In **AWS Cognito Console** → Your User Pool → **App Integration** → **App client settings**:

Ensure these callback URLs are configured:
- ✅ `https://main.d2vza85iha5pln.amplifyapp.com/callback`
- ✅ `https://main.d2vza85iha5pln.amplifyapp.com/` (logout URI)

### Step 3: Redeploy Your Application

After updating environment variables in Amplify:

1. Go to **Amplify Console** → Your App → **Deployments**
2. Click **Redeploy this version** or trigger a new deployment
3. Wait for the build to complete

### Step 4: Clear Browser Cache

Before testing:
1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Check "Disable cache"
4. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

### Step 5: Test Login Flow

1. Visit: `https://main.d2vza85iha5pln.amplifyapp.com/`
2. Click "Login with Cognito"
3. Should redirect to Cognito login page (without DNS error)
4. After login → redirects to `/callback` → then to `/dashboard`

---

## 🔍 How to Verify Amplify Environment Variables

### Option 1: Check Build Logs
In Amplify Console → Build logs, search for:
```
VITE_COGNITO_DOMAIN
```

You should see it printed during the build process.

### Option 2: Add Debug Endpoint (Temporary)

You can temporarily add a debug route to check loaded env variables:

```typescript
// Add to App.tsx for debugging only
console.log('Cognito Domain:', import.meta.env.VITE_COGNITO_DOMAIN);
```

Then check browser console in production.

---

## 🐛 Additional Troubleshooting

### If DNS error persists:

1. **Check the actual URL being generated**:
   - Open DevTools → Network tab
   - Click login button
   - Check the redirect URL
   - It should be: `https://us-east-2yby9toshl.auth.us-east-2.amazoncognito.com/oauth2/authorize?...`

2. **Verify environment variables are loaded**:
   - In Amplify build logs, look for:
     ```
     Environment variables set in Amplify Console:
     - VITE_COGNITO_DOMAIN
     ```

3. **Check if old build is cached**:
   - CloudFront cache might be serving old build
   - In Amplify Console → **Invalidate cache**

### If redirect works but login fails:

- Check Cognito callback URLs match exactly
- Verify PKCE flow is working (check browser console for errors)
- Ensure cookies/localStorage are not blocked

---

## 📝 Correct Configuration Summary

### Local Development (.env):
```env
VITE_COGNITO_DOMAIN=us-east-2yby9toshl.auth.us-east-2.amazoncognito.com
VITE_REDIRECT_URI=http://localhost:5176/callback
```

### Production (Amplify Environment Variables):
```env
VITE_COGNITO_DOMAIN=us-east-2yby9toshl.auth.us-east-2.amazoncognito.com
VITE_REDIRECT_URI=https://main.d2vza85iha5pln.amplifyapp.com/callback
```

**Key difference**: Only the `VITE_REDIRECT_URI` changes between environments.

---

## ✅ Expected Flow

1. User clicks "Login with Cognito" on landing page
2. Redirects to: `https://us-east-2yby9toshl.auth.us-east-2.amazoncognito.com/oauth2/authorize?...`
3. User logs in with Cognito credentials
4. Cognito redirects to: `https://main.d2vza85iha5pln.amplifyapp.com/callback?code=...`
5. Callback page exchanges code for tokens
6. User redirected to: `https://main.d2vza85iha5pln.amplifyapp.com/dashboard`

---

## 🔐 Security Notes

- `VITE_DEV_MODE=false` in production (no bypass)
- Never commit `.env` file to git (already in `.gitignore`)
- Store sensitive values only in Amplify Console environment variables

