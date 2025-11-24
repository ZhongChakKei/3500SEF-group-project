# 🚀 Quick Start (Local Demo – No AWS Required)

You can explore a simplified offline version in `LocalDemo/` with mock auth and sample data.
test
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

A full-stack serverless inventory management application built with React, AWS Lambda, DynamoDB, and Cognito authentication. Features real-time stock tracking, product/variant management, multi-store inventory, and comprehensive sales analytics.

## 🚀 Features

- **Authentication**: AWS Cognito OAuth 2.0 with PKCE flow and Hosted UI
- **Product Management**: 
  - Browse products with image support
  - Add new products with full details (ID, name, type, price, images)
  - Modify existing products
  - Archive/unarchive products (soft delete)
  - Filter between active and archived products
- **Store Management**:
  - Create new stores with location details
  - Close/reopen stores with status tracking
  - Multi-store inventory tracking
  - Store-specific sales analytics
- **Inventory Tracking**: 
  - Real-time stock levels across multiple stores
  - Ideal stock vs. actual stock comparison
  - Available quantity tracking (removed reserved quantity)
  - Low stock alerts and notifications
  - Store-specific inventory views with tabs
- **Sales Dashboard**:
  - Daily sales charts with trend visualization
  - Recent sales table with store and item details
  - Summary cards for total sales, tracked items, and low stock alerts
  - Week-long sales data across multiple stores
- **Protected Routes**: Role-based access control with automatic token refresh
- **Modern UI**: Responsive design with TailwindCSS, loading skeletons, smooth animations, and modal forms

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

The `dataset/` folder contains pre-populated mock data for demonstration:

#### Available Sample Data
- **items.json**: 3 products (Bottled Water, Potato Chips, Canned Coffee) with images
- **stores.json**: 2 stores (HKS1 - Central, HKS2 - Causeway Bay)
- **storeStocks.json**: Inventory levels for all items across both stores
- **storeSales.json**: 7 days of sales data (Nov 16-22, 2025) for both stores

#### Option A: Use the UI
1. Log in to your deployed app
2. **Create Stores**:
   - Navigate to **Stores** → **+ Create New Store**
   - Fill in store details (code, address, district, city)
3. **Add Products**:
   - Navigate to **Products** → **+ Add Product**
   - Fill in product details (ID, name, type, price, image URL)
   - Upload product images to `frontend/image/` directory
4. **Manage Inventory**:
   - Navigate to **Inventory** → Select store
   - Update stock levels for each item

#### Option B: Bulk Import via API
The dataset files can be imported programmatically via POST requests to your Lambda API:

**Import Items:**
```bash
curl -X POST https://your-lambda-url/api/items \
  -H "Content-Type: application/json" \
  -d @dataset/items.json
```

**Import Stores:**
```bash
curl -X POST https://your-lambda-url/api/stores \
  -H "Content-Type: application/json" \
  -d @dataset/stores.json
```

**Import Inventory:**
```bash
curl -X POST https://your-lambda-url/api/inventory \
  -H "Content-Type: application/json" \
  -d @dataset/storeStocks.json
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
│   ├── image/                     # Product images directory
│   │   ├── 0001.png              # Bottled Water
│   │   ├── 0002.png              # Potato Chips
│   │   └── 0003.png              # Canned Coffee
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx         # Navigation and layout wrapper
│   │   │   ├── RecentSalesTable.tsx # Recent sales component
│   │   │   ├── SalesChart.tsx     # Sales trend chart
│   │   │   └── SummaryCard.tsx    # Dashboard summary cards
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Cognito OAuth provider
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx    # Public home page
│   │   │   ├── LoginPage.tsx      # Initiates OAuth flow
│   │   │   ├── CallbackPage.tsx   # Handles OAuth redirect (5s delay)
│   │   │   ├── DashboardPage.tsx  # Main dashboard with sales analytics
│   │   │   ├── ProductsPage.tsx   # Product listing with add/edit/archive
│   │   │   ├── StoresPage.tsx     # Store management with create/close
│   │   │   ├── AddProductPage.tsx # Create new product form
│   │   │   ├── ProductDetailPage.tsx # Variant details
│   │   │   ├── AddVariantPage.tsx # Create new variant form
│   │   │   └── InventoryPage.tsx  # Multi-store inventory tracking
│   │   ├── services/
│   │   │   ├── api.ts             # Comprehensive API client with all endpoints
│   │   │   └── inventoryService.ts # Inventory-specific API methods
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
├── dataset/                        # Sample JSON data
│   ├── items.json                 # Product items with images
│   ├── stores.json                # Store locations (2 stores)
│   ├── storeStocks.json           # Inventory levels per store
│   └── storeSales.json            # 7 days of sales data
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

### Items/Products
- **GET** `/api/items` - List all items
- **GET** `/api/items/:itemId` - Get single item
- **POST** `/api/items` - Create new item
  ```json
  {
    "itemId": "0004",
    "itemName": "Orange Juice 350ml",
    "itemType": "DRINK",
    "unitPrice": 10.5,
    "imageUrl": "/image/0004.png"
  }
  ```
- **PUT** `/api/items/:itemId` - Update item (modify product)
  ```json
  {
    "itemName": "Orange Juice 500ml",
    "unitPrice": 12.0
  }
  ```
- **DELETE** `/api/items/:itemId` - Delete item

### Stores
- **GET** `/api/stores` - List all stores
- **GET** `/api/stores/:storeId` - Get single store
- **POST** `/api/stores` - Create new store
  ```json
  {
    "storeCode": "HKS3",
    "location": {
      "addressLine1": "Shop 301, Tsim Sha Tsui Plaza",
      "district": "Tsim Sha Tsui",
      "city": "Hong Kong"
    },
    "status": "OPEN"
  }
  ```
- **PUT** `/api/stores/:storeId` - Update store (close/reopen)
  ```json
  {
    "status": "CLOSED"
  }
  ```
- **DELETE** `/api/stores/:storeId` - Delete store

### Inventory
- **GET** `/api/inventory` - Get all inventory
- **GET** `/api/inventory?storeId=store-001` - Get inventory for specific store
- **GET** `/api/inventory?itemId=0001` - Get inventory for specific item
- **GET** `/api/inventory/:storeId/:itemId` - Get specific inventory record
- **POST** `/api/inventory` - Create or update inventory
  ```json
  {
    "storeId": "store-001",
    "itemId": "0001",
    "inStock": 150,
    "idealStock": 200,
    "availableQty": 150
  }
  ```
- **PUT** `/api/inventory/:storeId/:itemId` - Update inventory quantities
  ```json
  {
    "inStock": 120,
    "idealStock": 180
  }
  ```

### Sales
- **GET** `/api/sales` - Get all sales records
- **GET** `/api/sales?storeId=store-001` - Get sales for specific store
- **GET** `/api/sales?date=2025-11-22` - Get sales for specific date
- **POST** `/api/sales` - Record new sale
  ```json
  {
    "storeId": "store-001",
    "salesDate": "2025-11-22",
    "items": [
      {"itemId": "0001", "salesQty": 35},
      {"itemId": "0002", "salesQty": 18}
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

### Database Schema

#### Items Collection
```json
{
  "itemId": "0001",
  "itemName": "Bottled Water 500ml",
  "itemType": "DRINK",
  "unitPrice": 8.5,
  "imageUrl": "/image/0001.png",
  "status": "ACTIVE" // or "ARCHIVED"
}
```

#### Stores Collection
```json
{
  "storeId": "store-001",
  "storeCode": "HKS1",
  "location": {
    "addressLine1": "Shop 101, Central Plaza",
    "district": "Central",
    "city": "Hong Kong"
  },
  "status": "OPEN" // or "CLOSED"
}
```

#### Inventory Collection
```json
{
  "storeId": "store-001",
  "itemId": "0001",
  "in-stock": 120,
  "ideal-stock": 150,
  "availableQty": 120
}
```

#### Sales Collection
```json
{
  "storeId": "store-001",
  "salesDate": "2025-11-22",
  "items": [
    {
      "itemId": "0001",
      "salesQty": 35
    }
  ]
}
```

### Adding New Features
1. Update Lambda `index.mjs` with new routes
2. Add corresponding service methods in `src/services/api.ts`
3. Create UI components/pages as needed
4. Update TypeScript interfaces in `src/services/api.ts`
5. Add product images to `frontend/image/` directory
6. Test locally, then deploy Lambda + redeploy Amplify

### Key UI Components
- **Modal Forms**: Used for creating/editing stores and products
- **Store Tabs**: Switch between different store locations in Inventory page
- **Summary Cards**: Display key metrics on Dashboard and Inventory pages
- **Sales Chart**: Line chart showing sales trends over time
- **Recent Sales Table**: Displays latest transactions with store and item details
- **Archive Toggle**: Switch between active and archived products

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
## 🎯 Recent Updates (November 2025)

### Product Management Enhancements
- ✅ Add new products with modal form (ID, name, type, price, image)
- ✅ Edit existing products inline
- ✅ Archive/unarchive products (soft delete with status tracking)
- ✅ Toggle view between active and archived products
- ✅ Product image support with display in grid layout
- ✅ Visual indicators for archived products

### Store Management Features
- ✅ Create new stores with complete location details
- ✅ Close stores (set status to CLOSED)
- ✅ Reopen closed stores (set status back to OPEN)
- ✅ Store listing with summary cards (Total, Open, Closed)
- ✅ Search and filter stores by status
- ✅ Beautiful card-based layout with status badges

### Inventory Improvements
- ✅ Removed `reservedQty` field (simplified to availableQty only)
- ✅ Multi-store inventory tracking with store tabs
- ✅ Summary cards showing total items, on hand, and low stock alerts
- ✅ Store-specific inventory views
- ✅ Real-time stock level updates

### Sales Analytics
- ✅ Dashboard with sales chart showing 7-day trends
- ✅ Recent sales table with store, item, and quantity details
- ✅ Mock data for 2 stores across 1 week (Nov 16-22, 2025)
- ✅ Total sales summary cards

### Data Updates
- ✅ Added second store (HKS2 - Causeway Bay)
- ✅ Product images linked to items (0001.png, 0002.png, 0003.png)
- ✅ 7 days of sales data for both stores
- ✅ Inventory levels populated for all items across both stores

## 📋 Future Enhancements

- [ ] Implement order creation UI with line items
- [ ] Add pagination for large product/store lists
- [ ] Advanced filtering and search capabilities
- [ ] Export sales reports to CSV/Excel
- [ ] Real-time notifications for low stock
- [ ] Bulk inventory updates
- [ ] Sales forecasting and analytics
- [ ] Multi-user roles and permissions
- [ ] Barcode scanning integration
- [ ] Mobile-responsive improvements

## 📄 License

MIT (Educational demo)

---

_Sensitive identifiers (Function URL, User Pool ID, domain prefix) replaced with placeholders._
