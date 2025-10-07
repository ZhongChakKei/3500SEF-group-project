# 🚀 Quick Start (Local Demo – No AWS Required)

You can explore a simplified offline version in `LocalDemo/` with mock auth and sample data.

### Run Local Demo
```powershell
cd LocalDemo
npm install
npm run dev
```
Open the shown URL (typically http://localhost:5173).

Features in demo:
- Product list & detail (sample JSON)
- Mock login/logout (no Cognito)

Not included:
- Real Cognito OAuth
- Inventory reservations / orders
- Tailwind styling (kept minimal)

To extend: copy additional JSON from `dataset/` to `LocalDemo/src/data/` and add new Zustand stores & routes.

---

# Distributed Inventory & Sales Management System

A full-stack serverless inventory management application built with React, AWS Lambda, DynamoDB, and Cognito authentication. Features real-time stock tracking, product/variant management, and multi-location inventory with reservation capabilities.

## 🚀 Features

- **Authentication**: AWS Cognito OAuth 2.0 with PKCE flow and Hosted UI
- **Product Management**: Browse products, view variants with detailed specifications, add new products and variants
- **Inventory Tracking**: Real-time stock levels across multiple warehouse locations
- **Stock Reservation**: Reserve inventory with conflict detection (409 handling)
- **Order Management**: Create and track orders with line items
- **Protected Routes**: Role-based access control with automatic token refresh
- **Modern UI**: Responsive design with TailwindCSS, loading skeletons, and smooth animations

## 🏗️ Architecture

**Frontend**: React 18 + TypeScript + Vite + TailwindCSS  
**Backend**: AWS Lambda (Node.js 18) with Function URL  
**Database**: DynamoDB (single-table design with PK/SK pattern)  
**Authentication**: AWS Cognito User Pool with Hosted UI  
**Hosting**: AWS Amplify (CI/CD from GitHub)

## 📋 Prerequisites

### For Local Development:
- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)

### For AWS Deployment:
- AWS Account with appropriate permissions
- AWS CLI configured (for Lambda deployment)
- GitHub account (for Amplify CI/CD)

---

## 🖥️ Local Development Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd webApp
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `frontend/` directory (placeholders added):

```env
# AWS Cognito Configuration
VITE_COGNITO_REGION=us-east-2
VITE_COGNITO_USER_POOL_ID=<your-user-pool-id>
VITE_COGNITO_CLIENT_ID=<your-app-client-id>
VITE_COGNITO_DOMAIN=<your-domain>.auth.us-east-2.amazoncognito.com

# OAuth Configuration
VITE_OAUTH_SCOPES=openid profile email read.inventory reserve.stock

# Local Development URLs
VITE_API_BASE_URL=http://localhost:3000
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_LOGOUT_URI=http://localhost:5173/
```

> **Note**: For local development, you can use your AWS Lambda Function URL as `VITE_API_BASE_URL` if you don't have a local backend running. (Real function URL redacted.)

### 4. Run Development Server
```bash
npm run dev
```

Visit: **http://localhost:5173**

### 5. Testing Locally

The callback page includes a 5-second authentication sync delay to ensure Cognito tokens are properly exchanged before redirecting to the dashboard.

---

## ☁️ AWS Deployment Guide

### Step 1: Create DynamoDB Table

1. Go to **AWS Console → DynamoDB → Tables → Create table**
2. Configure:
   - **Table name**: `dist-inventory`
   - **Partition key**: `PK` (String)
   - **Sort key**: `SK` (String)
   - **Table settings**: On-demand capacity
3. Click **Create table**

### Step 2: Deploy Lambda Function

#### A. Prepare Lambda Package
```bash
cd lambda
npm install
```

#### B. Create Lambda Function (First Time)
```bash
# Create function
aws lambda create-function \
  --function-name dist-inventory-api \
  --runtime nodejs18.x \
  --role arn:aws:iam::<account-id>:role/<lambda-execution-role> \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --environment Variables={TABLE_NAME=dist-inventory,REQUIRE_AUTH=false}
```

#### C. Create Function URL
```bash
aws lambda create-function-url-config \
  --function-name dist-inventory-api \
  --auth-type NONE \
  --cors AllowOrigins="*",AllowMethods="GET,POST,PUT,DELETE",AllowHeaders="*"
```

Save the Function URL (e.g., `https://<your-function-id>.lambda-url.us-east-2.on.aws/`)

#### D. Update Lambda Code (For Updates)
```powershell
# PowerShell (Windows)
cd lambda
Compress-Archive -Path index.mjs,package.json,node_modules -DestinationPath function.zip -Force
aws lambda update-function-code --function-name dist-inventory-api --zip-file fileb://function.zip
```

### Step 3: Configure AWS Cognito

1. **Create User Pool**:
   - Go to **AWS Console → Cognito → User Pools → Create**
   - Name: `dist-inventory-users`
   - Sign-in options: Email
   - Password policy: Default
   - MFA: Optional (recommended: OFF for development)

2. **Configure App Client**:
   - In your User Pool → **App integration → App clients → Create**
   - **App client name**: `dist-inventory-client`
   - **Authentication flows**: Authorization Code Grant (with PKCE)
   - **Confidential client**: NO (public client, no secret)
   - **OAuth scopes**: `openid`, `profile`, `email`

3. **Set Callback URLs**:
   - For local: `http://localhost:5173/callback`
   - For production: `https://<your-app>.amplifyapp.com/callback`

4. **Set Logout URLs**:
   - For local: `http://localhost:5173/`
   - For production: `https://<your-app>.amplifyapp.com/`

5. **Configure Domain**:
   - Go to **App integration → Domain**
   - Choose **Cognito domain** or custom domain
   - Domain prefix: `dist-inv-demo` (or your choice)

6. **Create Test User**:
   ```bash
   aws cognito-idp admin-create-user \
     --user-pool-id <your-user-pool-id> \
     --username testuser@example.com \
     --temporary-password TempPass123! \
     --user-attributes Name=email,Value=testuser@example.com Name=email_verified,Value=true
   ```

### Step 4: Deploy to AWS Amplify

#### A. Push to GitHub
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

#### B. Connect to Amplify
1. Go to **AWS Console → Amplify → New app → Host web app**
2. Select **GitHub** and authorize
3. Choose your repository and branch (`main`)
4. **Build settings** (auto-detected for Vite):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

#### C. Configure Environment Variables in Amplify
Go to **App settings → Environment variables** and add:

| Variable | Value (Example) |
|----------|-----------------|
| `VITE_API_BASE_URL` | `https://<your-function-id>.lambda-url.us-east-2.on.aws` |
| `VITE_COGNITO_REGION` | `us-east-2` |
| `VITE_COGNITO_USER_POOL_ID` | `<your-user-pool-id>` |
| `VITE_COGNITO_CLIENT_ID` | `<your-app-client-id>` |
| `VITE_COGNITO_DOMAIN` | `<your-domain>.auth.us-east-2.amazoncognito.com` |
| `VITE_OAUTH_SCOPES` | `openid profile email` |
| `VITE_REDIRECT_URI` | `https://<your-app>.amplifyapp.com/callback` |
| `VITE_LOGOUT_URI` | `https://<your-app>.amplifyapp.com/` |

> **Important**: These are build-time variables. After changing them, you must redeploy.

#### D. Add SPA Routing Rule
The build automatically includes `frontend/public/_redirects`:
```
/*    /index.html   200
```
This ensures React Router works on direct URL access.

#### E. Deploy
Click **Save and deploy**. Your app will be available at: `https://<app-id>.amplifyapp.com`

### Step 5: Load Sample Data

#### Option A: Use the UI
1. Log in to your deployed app
2. Navigate to **Products** → **+ Add Product**
3. Fill in product details and submit
4. On product detail page → **+ Add Variant**

#### Option B: Bulk Import Script
Create `scripts/loadData.mjs`:
```javascript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import fs from 'fs';

const client = new DynamoDBClient({ region: 'us-east-2' });
const ddb = DynamoDBDocumentClient.from(client);

const products = JSON.parse(fs.readFileSync('../dataset/products.json', 'utf8'));

const items = products.map(p => ({
  PutRequest: {
    Item: {
      PK: 'TYPE#PRODUCT',
      SK: `PRODUCT#${p.product_id}`,
      productId: p.product_id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      default_image: p.default_image
    }
  }
}));

// Batch write in chunks of 25
for (let i = 0; i < items.length; i += 25) {
  await ddb.send(new BatchWriteCommand({
    RequestItems: { 'dist-inventory': items.slice(i, i + 25) }
  }));
}
console.log('Data loaded!');
```

Run:
```bash
node scripts/loadData.mjs
```

---

## 🔧 Configuration Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Lambda Function URL (e.g., `https://xxx.lambda-url.us-east-2.on.aws`) |
| `VITE_COGNITO_REGION` | Yes | AWS region for Cognito (e.g., `us-east-2`) |
| `VITE_COGNITO_USER_POOL_ID` | Yes | Cognito User Pool ID (e.g., `<your-user-pool-id>`) |
| `VITE_COGNITO_CLIENT_ID` | Yes | App client ID (no secret) |
| `VITE_COGNITO_DOMAIN` | Yes | Cognito domain (e.g., `your-app.auth.region.amazoncognito.com`) |
| `VITE_OAUTH_SCOPES` | Yes | Space-separated scopes (e.g., `openid profile email`) |
| `VITE_REDIRECT_URI` | Yes | OAuth callback URL (must match Cognito config) |
| `VITE_LOGOUT_URI` | Yes | Post-logout redirect URL |

### Lambda Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TABLE_NAME` | `dist-inventory` | DynamoDB table name |
| `REQUIRE_AUTH` | `false` | Enable JWT validation (`true`/`false`) |
| `OAUTH_ISSUER` | - | Cognito issuer URL (required if `REQUIRE_AUTH=true`) |

---

## 🗂️ Project Structure

```
webApp/
├── frontend/                       # React frontend
│   ├── public/
│   │   └── _redirects             # SPA routing for Amplify
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.tsx         # Navigation and layout wrapper
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Cognito OAuth provider
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx    # Public home page
│   │   │   ├── LoginPage.tsx      # Initiates OAuth flow
│   │   │   ├── CallbackPage.tsx   # Handles OAuth redirect (5s delay)
│   │   │   ├── DashboardPage.tsx  # Main dashboard
│   │   │   ├── ProductsPage.tsx   # Product listing with Add button
│   │   │   ├── AddProductPage.tsx # Create new product form
│   │   │   ├── ProductDetailPage.tsx # Variant details
│   │   │   ├── AddVariantPage.tsx # Create new variant form
│   │   │   └── InventoryPage.tsx  # Location-based inventory
│   │   ├── services/
│   │   │   ├── apiClient.ts       # Axios with auth interceptor
│   │   │   └── inventoryService.ts # API method wrappers
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── env.ts             # Environment variable resolver
│   │   ├── App.tsx                # Route configuration
│   │   └── main.tsx               # React entry point
│   ├── package.json
│   └── vite.config.ts
├── lambda/
│   ├── index.mjs                  # Lambda handler (all routes)
│   ├── authMiddleware.mjs         # JWT validation (optional)
│   ├── package.json
│   └── README.md
├── dataset/                        # Sample CSV/JSON data
│   ├── products.json
│   ├── variants.json
│   ├── inventory.json
│   └── locations.json
└── amplify.yml                     # Amplify build configuration
```

---

## 🔐 Authentication Flow (PKCE)

1. User clicks **Login** → App generates `code_verifier` and `code_challenge`
2. Redirect to Cognito Hosted UI: `https://<domain>.auth.region.amazoncognito.com/oauth2/authorize?response_type=code&client_id=...&code_challenge=...`
3. User enters credentials → Cognito redirects to `/callback?code=...`
4. **CallbackPage** waits 5 seconds (displays loading animation)
5. App exchanges `code` + `code_verifier` for tokens via `POST /oauth2/token`
6. Tokens stored in `localStorage`: `access_token`, `id_token`, `refresh_token`, `expires_at`
7. All API requests include: `Authorization: Bearer <access_token>`
8. On 401 response → Auto-redirect to `/login`

---

## 🛠️ API Endpoints (Lambda)

### Products
- **GET** `/products` - List all products
- **POST** `/products` - Create new product
  ```json
  {
    "product_id": "P-001",
    "title": "iPhone 15 Pro",
    "brand": "Apple",
    "category": "Smartphone",
    "default_image": "https://...",
    "attributes": {"color": "Natural Titanium", "weight": "187g"}
  }
  ```

### Variants
- **GET** `/variants?product_id=P-001` - List variants for product
- **POST** `/variants` - Create new variant
  ```json
  {
    "variant_id": "V-001",
    "product_id": "P-001",
    "sku": "IPH15P-256-NT",
    "color": "Natural Titanium",
    "storage_gb": 256,
    "ram_gb": 8,
    "price": 999.00,
    "cost": 750.00,
    "barcode": "194253000000"
  }
  ```

### Inventory
- **GET** `/inventory?variant_id=V-001` - Get inventory for variant across locations
- **GET** `/inventory?location_id=STO-CWB` - Get all inventory at location
- **POST** `/reserve` - Reserve stock
  ```json
  {
    "variantId": "V-001",
    "locationId": "STO-CWB",
    "qty": 2
  }
  ```
  Returns `409 Conflict` if insufficient available stock.

### Orders
- **POST** `/orders` - Create order
  ```json
  {
    "orderId": "ORD-12345",
    "locationId": "STO-CWB",
    "lines": [
      {"variantId": "V-001", "qty": 1, "price": 999.00}
    ]
  }
  ```

---

## 🐛 Troubleshooting

### Issue: Empty Products Page After Deployment
**Cause**: DynamoDB table is empty  
**Solution**: Load sample data using bulk import script or manually add products via UI

### Issue: 404 Error on `/callback` Route
**Cause**: SPA routing not configured  
**Solution**: Ensure `frontend/public/_redirects` exists and contains:
```
/*    /index.html   200
```
Rebuild and redeploy.

### Issue: `invalid_scope` OAuth Error
**Cause**: Environment variable mismatch  
**Solution**: 
1. Check Amplify environment variables match Cognito configuration
2. Verify scopes in Cognito App Client settings
3. Redeploy after changes (environment variables are build-time)

### Issue: Cognito Tokens Not Working
**Cause**: Callback page redirects too fast  
**Solution**: Already fixed with 5-second delay in `CallbackPage.tsx`

### Issue: CORS Errors from Lambda
**Cause**: Function URL CORS not configured  
**Solution**: Update CORS config:
```bash
aws lambda update-function-url-config \
  --function-name dist-inventory-api \
  --cors AllowOrigins="https://your-app.amplifyapp.com",AllowMethods="*",AllowHeaders="*"
```

### Issue: 401 Unauthorized on API Calls
**Cause**: Token expired or `REQUIRE_AUTH=true` but no issuer configured  
**Solution**:
- Check token expiry in browser DevTools → Application → Local Storage
- Verify Lambda environment variable `OAUTH_ISSUER` is set if auth is enabled
- Try logging out and back in

### Issue: Build Fails on Amplify
**Cause**: Missing dependencies or environment variables  
**Solution**:
1. Check build logs in Amplify Console
2. Verify all `VITE_*` variables are set in Amplify environment
3. Ensure `package.json` dependencies are correct

---

## 📝 Development Notes

### Callback Delay Mechanism
The app includes a 5-second authentication delay after OAuth callback to ensure Cognito's distributed token system synchronizes before redirecting. This prevents race conditions where the user reaches protected routes before tokens are fully available.

### Environment Variable Fallbacks
`src/utils/env.ts` provides runtime fallbacks for redirect URIs using `window.location.origin` if `VITE_REDIRECT_URI` is not set. This helps with local development but should not be relied upon in production.

### DynamoDB Schema (Single-Table Design)
```
PK: TYPE#PRODUCT         SK: PRODUCT#{product_id}     → Product metadata
PK: PRODUCT#{product_id} SK: VARIANT#{variant_id}     → Variant details
PK: VARIANT#{variant_id} SK: LOCATION#{location_id}   → Inventory record
PK: TYPE#LOCATION        SK: LOCATION#{location_id}   → Location metadata
```

### Adding New Features
1. Update Lambda `index.mjs` with new routes
2. Add corresponding service methods in `inventoryService.ts`
3. Create UI components/pages as needed
4. Update TypeScript types in `src/types/index.ts`
5. Test locally, then deploy Lambda + redeploy Amplify

---

## 🚢 Deployment Checklist

- [ ] DynamoDB table created (`dist-inventory`)
- [ ] Lambda function deployed with Function URL
- [ ] Lambda environment variables set (`TABLE_NAME`, `REQUIRE_AUTH`)
- [ ] Cognito User Pool created
- [ ] App client configured (no secret, PKCE enabled)
- [ ] Cognito callback URLs added (local + production)
- [ ] Cognito domain configured (choose your own prefix; redacted in README)
- [ ] Test user created in Cognito
- [ ] GitHub repository created and pushed
- [ ] Amplify app connected to repository
- [ ] Amplify environment variables configured
- [ ] Amplify build successful
- [ ] Sample data loaded into DynamoDB
- [ ] Test login flow on deployed site
- [ ] Test product listing, variant details, inventory
- [ ] Test create product/variant functionality
- [ ] Test stock reservation with conflict handling

---

## 📚 Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/guides/)
- [AWS Lambda Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)
- [AWS Cognito OAuth 2.0](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html)
- [DynamoDB Single-Table Design](https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📄 License

This project is for educational purposes. Refer to your institution's guidelines for usage and distribution.

---
_Sensitive identifiers (Function URL, User Pool ID, domain prefix) replaced with placeholders._
- Implement order creation UI
- Add SKU copy button & image loading from S3
- Replace sequential variant inventory fetch with batched call
- Add pagination and advanced filtering for products

## License
MIT (Educational demo)
