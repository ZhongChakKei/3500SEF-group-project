# AWS Amplify Deployment Guide

## Serverless Architecture

This guide covers deploying your POS web app as a **serverless application** to AWS Amplify.

### Two Deployment Options:

1. **Quick Deployment**: Frontend only (static site) - **Recommended for now**
2. **Full Serverless**: Frontend + AWS Cognito + Lambda - **For production**

---

## Option 1: Quick Deployment (Frontend Only)

Deploy just the React frontend to AWS Amplify. The backend can run locally or on a separate service.

### Prerequisites
- AWS Account with Amplify access
- GitHub repository connected to AWS Amplify

### Step 1: Connect Your Repository

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Choose "GitHub" as your repository service
4. Select your repository: `ZhongChakKei/3500SEF-group-project`
5. Select branch: `main`

### Step 2: Configure Build Settings

AWS Amplify will automatically detect the `amplify.yml` file which is already configured for frontend-only deployment.

### Step 3: Configure Environment Variables

In AWS Amplify Console, go to **App settings** → **Environment variables**:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_API_BASE` | `https://your-backend-url/api` | Backend API endpoint |

**For development/demo:**
- You can use `http://localhost:3001/api` for testing
- Or deploy backend separately (see Option 2 below)

### Step 4: Deploy

1. Click "Save and deploy"
2. AWS Amplify will build and deploy your frontend
3. You'll get a URL like: `https://main.xxxxxxxxx.amplifyapp.com`

### Step 5: Test

Visit your Amplify URL and test:
- ✅ Frontend loads correctly
- ⚠️ Login won't work until backend is accessible

---

## Option 2: Full Serverless (Recommended for Production)

For a truly serverless architecture, use AWS Amplify with Cognito authentication.

### Why Go Serverless?

✅ **No servers to manage** - AWS handles infrastructure
✅ **Auto-scaling** - Handles any traffic level automatically  
✅ **Cost-effective** - Pay only for what you use (~$0-5/month for small projects)
✅ **Built-in security** - AWS manages authentication, encryption
✅ **High availability** - 99.99% uptime SLA

### Step 1: Install Amplify CLI

```powershell
npm install -g @aws-amplify/cli
amplify configure
```

Follow the prompts to configure with your AWS credentials.

### Step 2: Initialize Amplify in Your Project

```powershell
cd frontend
amplify init
```

Answer the prompts:
- Name: `sef-pos-app`
- Environment: `dev` or `prod`
- Editor: Visual Studio Code
- Framework: JavaScript/React
- Source directory: `src`
- Distribution directory: `dist`
- Build command: `npm run build`
- Start command: `npm run dev`

### Step 3: Add Authentication with Cognito

```powershell
amplify add auth
```

Choose:
- ✅ Default configuration
- ✅ Email for sign-in
- ✅ No advanced settings (or customize as needed)

This creates:
- AWS Cognito User Pool (manages users)
- AWS Cognito Identity Pool (for AWS resource access)
- Automatic JWT token management

### Step 4: Add API (Optional - for custom business logic)

```powershell
amplify add api
```

Choose:
- REST API
- Create a new Lambda function
- Use the provided templates or create custom endpoints

### Step 5: Push to AWS

```powershell
amplify push
```

This will:
- Create all AWS resources (Cognito, Lambda, API Gateway)
- Generate configuration file (`aws-exports.js`)
- Deploy everything to AWS

### Step 6: Update Frontend Code

Install Amplify libraries:

```powershell
npm install aws-amplify @aws-amplify/ui-react
```

### Step 7: Deploy Frontend to Amplify Hosting

```powershell
amplify add hosting
```

Choose:
- Hosting with Amplify Console
- Manual deployment (or continuous deployment)

```powershell
amplify publish
```

---

## Backend Deployment Options (If Not Using Amplify/Cognito)

If you want to keep your Express backend with JWT:

### Option A: Deploy Backend to Railway (Free Tier)

1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select backend folder
4. Add environment variables
5. Deploy

### Option B: Deploy Backend to Render (Free Tier)

1. Go to [Render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables
8. Deploy

### Option C: AWS Lambda (Serverless)

Convert your Express backend to Lambda functions using AWS SAM or Serverless Framework.

---

## Migration to AWS Cognito (Detailed)

### Update Frontend to Use Cognito

1. **Configure Amplify** (`frontend/src/main.jsx`):

```javascript
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);
```

2. **Update AuthContext** to use Cognito:

```javascript
import { Auth } from 'aws-amplify';

// Login
const login = async (email, password) => {
  try {
    const user = await Auth.signIn(email, password);
    setUser(user);
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Register
const register = async (email, password, name) => {
  try {
    await Auth.signUp({
      username: email,
      password,
      attributes: { email, name }
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Logout
const logout = async () => {
  await Auth.signOut();
  setUser(null);
};

// Get current user
const fetchUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    setUser(user);
  } catch (error) {
    setUser(null);
  }
};
```

3. **Add User Groups for Roles** (in AWS Cognito Console):
   - Create groups: `Admin`, `User`
   - Assign users to groups
   - Check group membership in your app

---

## Cost Estimates

### Current Setup (Express Backend)
- Express server on Railway/Render: $0-7/month (free tier limited)
- AWS Amplify frontend: $0-5/month
- **Total: ~$5-12/month**

### Full Serverless (AWS Amplify + Cognito)
- AWS Cognito: Free (up to 50,000 users/month)
- AWS Lambda: Free (1M requests/month)
- API Gateway: Free (1M requests/month)
- AWS Amplify: Free (1,000 build minutes/month)
- DynamoDB: Free (25GB storage, 25 RCU/WCU)
- **Total: $0-5/month** (likely $0 for small projects)

---

## Recommended Approach

### For Learning/Demo:
✅ **Deploy frontend to AWS Amplify** (static hosting)
✅ Keep backend local or use free tier service
✅ Use current JWT authentication
✅ Quick and simple

### For Production:
✅ **Use AWS Amplify + Cognito**
✅ Convert backend logic to Lambda functions  
✅ Use DynamoDB for data storage
✅ Truly serverless and scalable
✅ See `SERVERLESS.md` for detailed guide

---

## Next Steps

1. ✅ Deploy frontend to AWS Amplify now (Option 1)
2. 📖 Read `SERVERLESS.md` for serverless architecture details
3. 🔄 Later: Migrate to AWS Amplify + Cognito (Option 2)

---

**For detailed serverless architecture guide, see [SERVERLESS.md](./SERVERLESS.md)**
