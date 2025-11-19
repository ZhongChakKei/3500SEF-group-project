# AWS Lambda Deployment Guide for Amplify

## Overview
Since AWS Amplify hosts static sites, your backend needs to run as a **serverless AWS Lambda function** with MongoDB Atlas. This guide shows you how to deploy it.

## Architecture
- **Frontend**: AWS Amplify (static React app)
- **Backend**: AWS Lambda + Function URL (serverless API)
- **Database**: MongoDB Atlas (cloud-hosted)

## Prerequisites
1. AWS Account
2. MongoDB Atlas account with cluster set up
3. AWS CLI installed: `pip install awscli`
4. AWS SAM CLI installed: `pip install aws-sam-cli`

## Quick Setup (3 Options)

### 🚀 Option 1: Deploy with AWS SAM (Recommended)

**1. Install SAM CLI**
```powershell
# Windows (using Chocolatey)
choco install aws-sam-cli

# Or download installer from:
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
```

**2. Configure AWS credentials**
```powershell
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1 (or your preferred region)
```

**3. Deploy Lambda function**
```powershell
cd lambda
npm install

sam deploy --guided
```

During deployment, provide:
- Stack Name: `retail-api`
- AWS Region: `us-east-1` (same as your Amplify app)
- MongoDB URI: Your connection string
- MongoDB Database: `retail-db`
- Allowed Origin: Your Amplify URL (e.g., `https://main.xxxxx.amplifyapp.com`)

**4. Get your API URL**
After deployment completes, SAM outputs your Lambda Function URL:
```
FunctionUrl = https://xxxxxxxxx.lambda-url.us-east-1.on.aws/
```

**5. Update Amplify environment variables**
```powershell
# In Amplify Console:
# App Settings > Environment variables > Manage variables
# Add: VITE_API_BASE_URL = https://your-lambda-url.lambda-url.us-east-1.on.aws
```

---

### ⚡ Option 2: Manual Lambda Deployment

**1. Create deployment package**
```powershell
cd lambda
npm install

# Create zip file
Compress-Archive -Path index.mjs,node_modules,package.json -DestinationPath function.zip -Force
```

**2. Create Lambda function via AWS Console**
- Go to AWS Lambda console
- Click "Create function"
- Name: `retail-inventory-api`
- Runtime: Node.js 18.x
- Architecture: x86_64
- Click "Create function"

**3. Upload code**
- In Lambda console, go to "Code" tab
- Click "Upload from" > ".zip file"
- Upload `function.zip`

**4. Set environment variables**
- Go to "Configuration" > "Environment variables"
- Add:
  ```
  MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
  MONGODB_DB = retail-db
  ALLOWED_ORIGIN = https://your-amplify-app.amplifyapp.com
  ```

**5. Create Function URL**
- Go to "Configuration" > "Function URL"
- Click "Create function URL"
- Auth type: NONE
- Configure CORS:
  - Allow origins: `https://your-amplify-app.amplifyapp.com` (or `*` for testing)
  - Allow methods: GET, POST, PUT, DELETE, OPTIONS
  - Allow headers: Content-Type, Authorization
- Click "Save"

**6. Copy Function URL**
Use this URL as your `VITE_API_BASE_URL` in Amplify

---

### 🔧 Option 3: Use AWS CLI

**1. Create deployment package**
```powershell
cd lambda
npm install
Compress-Archive -Path index.mjs,node_modules,package.json -DestinationPath function.zip -Force
```

**2. Create IAM role for Lambda**
```powershell
aws iam create-role --role-name lambda-retail-api-role --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}'

aws iam attach-role-policy --role-name lambda-retail-api-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

**3. Create Lambda function**
```powershell
aws lambda create-function `
  --function-name retail-inventory-api `
  --runtime nodejs18.x `
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-retail-api-role `
  --handler index.handler `
  --zip-file fileb://function.zip `
  --timeout 30 `
  --memory-size 512 `
  --environment Variables="{MONGODB_URI=your-connection-string,MONGODB_DB=retail-db,ALLOWED_ORIGIN=*}"
```

**4. Create Function URL**
```powershell
aws lambda create-function-url-config `
  --function-name retail-inventory-api `
  --auth-type NONE `
  --cors AllowOrigins="*",AllowMethods="GET,POST,PUT,DELETE,OPTIONS",AllowHeaders="Content-Type"

# Get the URL
aws lambda get-function-url-config --function-name retail-inventory-api
```

---

## Load Sample Data into MongoDB

```powershell
cd migration
npm install

$env:MONGODB_URI="your-mongodb-connection-string"
$env:MONGODB_DB="retail-db"

node load-sample-data.mjs
```

## Update Amplify Frontend

### Method 1: Via Amplify Console
1. Go to AWS Amplify Console
2. Select your app
3. Go to "App settings" > "Environment variables"
4. Add/Update:
   ```
   VITE_API_BASE_URL = https://xxxxx.lambda-url.us-east-1.on.aws
   ```
5. Redeploy your app

### Method 2: Via AWS CLI
```powershell
# Get your Amplify app ID
aws amplify list-apps

# Update environment variable
aws amplify update-app `
  --app-id YOUR_APP_ID `
  --environment-variables VITE_API_BASE_URL=https://xxxxx.lambda-url.us-east-1.on.aws

# Trigger new deployment
aws amplify start-job --app-id YOUR_APP_ID --branch-name main --job-type RELEASE
```

## Test Your API

```powershell
# Replace with your Lambda Function URL
$API_URL = "https://xxxxx.lambda-url.us-east-1.on.aws"

# Test health endpoint
curl "$API_URL/health"

# Test getting items
curl "$API_URL/api/items"

# Test creating an item
curl -X POST "$API_URL/api/items" `
  -H "Content-Type: application/json" `
  -d '{\"itemId\":\"0010\",\"itemName\":\"Test Item\",\"itemType\":\"SNACK\",\"unitPrice\":5.0}'
```

## MongoDB Atlas Configuration

**Allow Lambda to connect:**
1. Go to MongoDB Atlas > Network Access
2. Add IP Address
3. Choose "Allow access from anywhere" (`0.0.0.0/0`)
   - Note: Lambda IPs are dynamic, so you need to allow all IPs or use AWS PrivateLink (paid feature)
4. Alternatively, for better security, set up AWS PrivateLink between Lambda and Atlas (requires M10+ cluster)

## Update Lambda Function (after code changes)

### Using SAM:
```powershell
cd lambda
sam build
sam deploy
```

### Using AWS CLI:
```powershell
cd lambda
npm install
Compress-Archive -Path index.mjs,node_modules,package.json -DestinationPath function.zip -Force

aws lambda update-function-code `
  --function-name retail-inventory-api `
  --zip-file fileb://function.zip
```

### Using AWS Console:
1. Go to Lambda function
2. Upload new `function.zip`
3. Click "Deploy"

## Cost Estimate

**AWS Lambda:**
- Free Tier: 1M requests/month + 400,000 GB-seconds
- After free tier: ~$0.20 per 1M requests
- Your usage will likely stay in free tier

**MongoDB Atlas:**
- M0 (Free): 512 MB storage, shared CPU
- M10 (Recommended): ~$57/month, 10GB storage, dedicated cluster

**AWS Amplify:**
- Free tier: 1000 build minutes/month
- Hosting: ~$0.15 per GB served

**Total estimated cost: $0-60/month** (mostly MongoDB if you use M10)

## Troubleshooting

### Lambda timeout errors
- Increase timeout in Lambda configuration (max 15 minutes)
- Or in `template.yaml`: change `Timeout: 30` to higher value

### CORS errors in browser
- Verify `ALLOWED_ORIGIN` matches your Amplify URL exactly
- Check Function URL CORS configuration
- Ensure OPTIONS method is allowed

### MongoDB connection errors
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify connection string is correct
- Check Lambda has internet access (should by default)

### "Cannot find module" errors
- Ensure you ran `npm install` before creating zip
- Verify `node_modules` folder is included in zip
- Check Lambda handler is set to `index.handler`

## Security Best Practices

### For Production:
1. **Use AWS Secrets Manager** for MongoDB URI:
   ```powershell
   # Store secret
   aws secretsmanager create-secret `
     --name mongodb/retail-api `
     --secret-string '{\"MONGODB_URI\":\"mongodb+srv://...\"}'
   
   # Grant Lambda permission to read secret
   # Update Lambda to fetch from Secrets Manager
   ```

2. **Restrict CORS** to your Amplify domain only:
   ```
   ALLOWED_ORIGIN=https://main.d1234abcd.amplifyapp.com
   ```

3. **Add API authentication** (AWS Cognito or API Keys)

4. **Enable Lambda logging** and set up CloudWatch alarms

5. **Use MongoDB PrivateLink** for secure connectivity (M10+ clusters)

## Complete Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Sample data loaded into MongoDB
- [ ] Lambda function deployed via SAM/Console/CLI
- [ ] Function URL created and configured
- [ ] Lambda environment variables set (MONGODB_URI, etc.)
- [ ] MongoDB Network Access allows Lambda IPs
- [ ] Amplify environment variable `VITE_API_BASE_URL` updated
- [ ] Amplify app redeployed
- [ ] API endpoints tested (health, items, stores, etc.)
- [ ] Frontend can fetch data from backend
- [ ] CORS configured properly

## Next Steps

1. Deploy Lambda using your preferred method above
2. Load your data into MongoDB
3. Update Amplify with the Lambda Function URL
4. Test your application end-to-end
5. Monitor Lambda logs in CloudWatch
6. Set up proper security (Secrets Manager, restricted CORS)

Your app is now fully serverless on AWS! 🎉
