# AWS Cognito Callback URLs Configuration Checklist

## Current Amplify URL
Your Amplify app is hosted at:
```
https://main.d2vza85iha5pln.amplifyapp.com
```

## Required Cognito Settings

### 1. App Client Settings

Go to **AWS Cognito Console**:
1. Navigate to your User Pool
2. Click **App Integration** → **App clients and analytics**
3. Select your app client: `1b4hb6sm1ajh5egefiu88p72rd`
4. Click **Edit**

### 2. Hosted UI Configuration

#### Allowed callback URLs:
```
https://main.d2vza85iha5pln.amplifyapp.com/callback
http://localhost:5176/callback
```

#### Allowed sign-out URLs:
```
https://main.d2vza85iha5pln.amplifyapp.com/
http://localhost:5176/
```

#### OAuth 2.0 Grant Types:
- ✅ Authorization code grant

#### OAuth Scopes:
- ✅ email
- ✅ openid
- ✅ phone

### 3. Domain Configuration

Your Cognito domain should be:
```
us-east-2yby9toshl.auth.us-east-2.amazoncognito.com
```

**⚠️ Important**: No hyphen between `us-east-2` and `yby9toshl`

### 4. Test the Domain

Open this URL in your browser to verify the domain works:
```
https://us-east-2yby9toshl.auth.us-east-2.amazoncognito.com/login?client_id=1b4hb6sm1ajh5egefiu88p72rd&response_type=code&redirect_uri=https://main.d2vza85iha5pln.amplifyapp.com/callback&scope=email+openid+phone
```

If this URL works, the domain is correct. If you get DNS error, the domain is wrong.

---

## Quick Verification Commands

### Check if domain resolves:
```bash
nslookup us-east-2yby9toshl.auth.us-east-2.amazoncognito.com
```

Should return an IP address (no error).

### Check if wrong domain fails:
```bash
nslookup us-east-2-yby9toshl.auth.us-east-2.amazoncognito.com
```

Should fail with "can't find" error (this is the buggy version with hyphen).

