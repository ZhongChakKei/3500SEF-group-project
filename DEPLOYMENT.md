# AWS Amplify Deployment Guide

## Prerequisites
- AWS Account with Amplify access
- GitHub repository connected to AWS Amplify
- Backend and Frontend code pushed to your repository

## Step 1: Configure AWS Amplify

### 1.1 Connect Your Repository
1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Choose "GitHub" as your repository service
4. Select your repository: `ZhongChakKei/3500SEF-group-project`
5. Select branch: `main`

### 1.2 Configure Build Settings
The build settings are already defined in `amplify.yml`. AWS Amplify will automatically detect and use this file.

## Step 2: Configure Environment Variables

In AWS Amplify Console, go to **App settings** → **Environment variables** and add the following:

### Backend Environment Variables (Required)

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production` | Secret key for JWT signing (⚠️ Use a strong random string in production!) |
| `JWT_EXPIRES_IN` | `24h` | Token expiration time |
| `PORT` | `3001` | Backend API port |
| `NODE_ENV` | `production` | Node environment |

### Frontend Environment Variables (Required)

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_API_BASE` | `https://your-backend-api-url.amplifyapp.com/api` | Backend API endpoint |

**Note:** Replace `your-backend-api-url.amplifyapp.com` with your actual backend URL after deployment.

## Step 3: Generate Secure JWT Secret

For production, generate a strong JWT secret key:

### Using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Using OpenSSL:
```bash
openssl rand -base64 64
```

Copy the generated string and use it as your `JWT_SECRET` in AWS Amplify environment variables.

## Step 4: Deploy

1. After configuring environment variables, save changes
2. AWS Amplify will automatically trigger a deployment
3. Monitor the build process in the Amplify Console
4. Once deployed, you'll get two URLs:
   - Frontend URL: `https://main.xxxxxxxxx.amplifyapp.com`
   - Backend URL: `https://backend.xxxxxxxxx.amplifyapp.com`

## Step 5: Update Frontend API Configuration

After backend deployment:

1. Copy your backend API URL
2. Update the `VITE_API_BASE` environment variable in AWS Amplify Console
3. Trigger a new frontend deployment (or it will redeploy automatically)

## Step 6: Test Your Deployment

### Test Backend API:
```bash
# Health check
curl https://your-backend-url.amplifyapp.com/api/health

# Login test
curl -X POST https://your-backend-url.amplifyapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Test Frontend:
1. Open your frontend URL in a browser
2. Try demo logins:
   - **Admin**: admin@example.com / admin123
   - **User**: user@example.com / user123
3. Test protected routes and role-based access

## Demo User Accounts

Your deployed application includes these demo accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | admin |
| user@example.com | user123 | user |

**⚠️ Security Warning:** Change or remove these demo accounts in production!

## Troubleshooting

### Backend Issues:
- Check CloudWatch logs in AWS Console
- Verify environment variables are set correctly
- Ensure JWT_SECRET is set

### Frontend Issues:
- Verify VITE_API_BASE points to correct backend URL
- Check browser console for CORS errors
- Ensure backend is deployed and accessible

### CORS Issues:
If you encounter CORS errors, update the CORS configuration in `backend/src/app.js`:
```javascript
app.use(cors({
  origin: 'https://your-frontend-url.amplifyapp.com',
  credentials: true
}));
```

## Continuous Deployment

AWS Amplify automatically deploys when you push to the `main` branch:

1. Make code changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. AWS Amplify automatically detects changes and redeploys

## Production Checklist

Before going live:

- [ ] Generate and set a strong JWT_SECRET
- [ ] Update CORS origins to production URL
- [ ] Remove or change demo user accounts
- [ ] Set up proper database (replace in-memory user store)
- [ ] Enable HTTPS (Amplify does this automatically)
- [ ] Set up monitoring and logging
- [ ] Configure custom domain (optional)
- [ ] Test all authentication flows
- [ ] Test role-based access control

## Custom Domain (Optional)

1. Go to AWS Amplify Console
2. Navigate to **App settings** → **Domain management**
3. Click **Add domain**
4. Follow the wizard to configure your custom domain
5. Update environment variables with new domain

## Support

For issues or questions:
- Check AWS Amplify documentation
- Review CloudWatch logs
- Check this repository's Issues section

---

**Last Updated:** October 3, 2025
**Project:** 3500SEF Group Project
**Repository:** github.com/ZhongChakKei/3500SEF-group-project
