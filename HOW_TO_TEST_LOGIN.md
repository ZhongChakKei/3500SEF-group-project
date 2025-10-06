# 🔐 How to Test the Login Flow

## ⚠️ Important: Don't Navigate Directly to /callback

The `/callback` page should **only be accessed via redirect from Cognito** after a successful login. 

If you navigate directly to `/callback`, you'll see an error because:
- There's no authorization code in the URL
- There's no PKCE verifier stored in sessionStorage

## ✅ Correct Login Flow

### Step 1: Start at the Landing Page
```
http://localhost:5173/
```

### Step 2: Click "Sign In with AWS Cognito"
This will:
1. Generate a PKCE code verifier and challenge
2. Store the verifier in sessionStorage
3. Redirect you to Cognito's hosted UI

### Step 3: Authenticate with Cognito
Enter your credentials on the Cognito login page

### Step 4: Automatic Redirect
After successful authentication, Cognito will redirect you to:
```
http://localhost:5173/callback?code=xxxxx
```

### Step 5: Token Exchange
The app will:
1. Extract the authorization code from the URL
2. Retrieve the PKCE verifier from sessionStorage
3. Exchange the code + verifier for access tokens
4. Store tokens in localStorage
5. Automatically redirect to /dashboard

## 🧪 Testing Instructions

1. **Start Fresh**
   ```powershell
   # Open browser DevTools
   # Go to: Application tab → Storage → Clear site data
   ```

2. **Visit Landing Page**
   ```
   http://localhost:5173/
   ```

3. **Click Login Button**
   - The button says "Sign In with AWS Cognito"

4. **Login at Cognito**
   - Use your Cognito user credentials

5. **Watch the Magic**
   - You'll see "Completing login..." briefly
   - Then automatically redirected to dashboard!

## 🐛 Troubleshooting

### Error: "Missing PKCE verifier"
**Cause:** You navigated directly to `/callback` or sessionStorage was cleared

**Solution:** Go back to http://localhost:5173/ and click the login button

### Error: "Invalid request" at Cognito
**Cause:** The redirect_uri is not in Cognito's allowed callback URLs

**Solution:** Add `http://localhost:5173/callback` to your Cognito App Client settings

### Stuck on "Completing login..."
**Cause:** Token exchange might be failing

**Solution:** 
1. Open browser DevTools → Console
2. Check for error messages
3. Verify your `.env` file has correct values:
   ```
   VITE_COGNITO_CLIENT_ID=1b4hb6sm1ajh5egefiu88p72rd
   VITE_COGNITO_DOMAIN=us-east-2yby9toshl.auth.us-east-2.amazoncognito.com
   VITE_REDIRECT_URI=http://localhost:5173/callback
   ```

### Error: CORS Policy
**Cause:** The Cognito domain is blocking your request

**Solution:** This is expected - Cognito token endpoint doesn't need CORS since it's a server-to-server call. If you see this, check your network tab for the actual error.

## 📋 Quick Test Checklist

- [ ] Landing page loads at http://localhost:5173/
- [ ] "Sign In with AWS Cognito" button is visible
- [ ] Click button redirects to Cognito login page
- [ ] Cognito URL includes: `redirect_uri=http://localhost:5173/callback`
- [ ] After login, redirected back to localhost:5173/callback?code=...
- [ ] See "Completing login..." message
- [ ] Automatically redirected to /dashboard
- [ ] Dashboard shows protected content

## 🎯 Current Status

Your app is now configured with:
- ✅ Proper error handling for missing PKCE verifier
- ✅ Automatic redirect to home page on errors
- ✅ Improved error messages in CallbackPage
- ✅ Token exchange with error handling
- ✅ Automatic navigation to dashboard after successful login

**Next:** Go to http://localhost:5173/ and test the complete flow!
