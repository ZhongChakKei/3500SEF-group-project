# Distributed Inventory & Sales Management System

A full-stack serverless retail management application for tracking inventory, products, and sales across multiple stores.

## 🚀 Features

- **Product Management**: Add, view, edit, and archive products with images
- **Store Management**: Create and manage multiple store locations
- **Inventory Tracking**: Real-time stock levels across all stores with low stock alerts
- **Sales Analytics**: Dashboard with charts, recent sales, and summary metrics
- **Authentication**: AWS Cognito OAuth 2.0 integration
- **Modern UI**: Responsive design with TailwindCSS and Chart.js

## 🏗️ Tech Stack

**Frontend**: React 18 + TypeScript + Vite + TailwindCSS  
**Backend**: AWS Lambda (Node.js) with Function URL  
**Database**: MongoDB Atlas  
**Authentication**: AWS Cognito  
**Hosting**: AWS Amplify

## 📋 Prerequisites

- Node.js 18+
- AWS Account
- MongoDB Atlas account
- Git

## 🖥️ Local Development

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd webApp/frontend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` in `frontend/` and fill in your values:

```bash
cp .env.example .env
```

Or create `.env` manually with your configuration (see `.env.example` for template).

### 3. Run Development Server
```bash
npm run dev
```

Visit: **http://localhost:5173**

## ☁️ AWS Deployment

### 1. Setup MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database: `retail-db`
3. Get connection string and save for Lambda

### 2. Deploy Lambda Function

```bash
cd lambda
npm install
```

Create deployment package:
```powershell
Compress-Archive -Path index.mjs,package.json,node_modules -DestinationPath lambda.zip -Force
```

In AWS Console:
1. **Lambda → Create function**
2. Runtime: Node.js 18.x
3. Upload `lambda.zip`
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `MONGODB_DB`: `retail-db`
5. **Configuration → Function URL → Create** (CORS enabled)
6. Save the Function URL

### 3. Setup AWS Cognito

1. **Create User Pool**
   - Sign-in: Email
   - App client type: Public client
   - OAuth scopes: `openid`, `profile`, `email`

2. **Configure URLs**
   - Callback: `https://main.s1368277.click/callback`
   - Logout: `https://main.s1368277.click/`

3. **Create Domain** (e.g., `your-app.auth.us-east-2.amazoncognito.com`)

### 4. Deploy to AWS Amplify

1. Push to GitHub
2. **Amplify → New app → Host web app**
3. Connect GitHub repository
4. Add environment variables:
   ```
   VITE_API_BASE_URL=<lambda-function-url>
   VITE_COGNITO_REGION=us-east-2
   VITE_COGNITO_USER_POOL_ID=<user-pool-id>
   VITE_COGNITO_CLIENT_ID=<client-id>
   VITE_COGNITO_DOMAIN=<domain>.auth.us-east-2.amazoncognito.com
   VITE_OAUTH_SCOPES=openid profile email
   VITE_REDIRECT_URI=https://main.s1368277.click/callback
   VITE_LOGOUT_URI=https://main.s1368277.click/
   ```
5. Deploy

### 5. Load Sample Data

Sample data available in `dataset/`:
- `items.json` - Products
- `stores.json` - Store locations
- `storeStocks.json` - Inventory levels
- `storeSales.json` - Sales history

Use the UI to add data or import via API



## 📁 Project Structure

```
webApp/
├── frontend/
│   ├── src/
│   │   ├── components/          # UI components
│   │   ├── pages/               # Page routes
│   │   ├── services/            # API client
│   │   ├── context/             # Auth context
│   │   └── utils/               # Utilities
│   └── package.json
├── lambda/
│   ├── index.mjs                # MongoDB Lambda handler
│   └── package.json
└── dataset/                     # Sample data
    ├── items.json
    ├── stores.json
    ├── storeStocks.json
    └── storeSales.json
```

## 🛠️ API Endpoints

- **GET** `/api/items` - List all items
- **POST** `/api/items` - Create item
- **PUT** `/api/items/:id` - Update item
- **DELETE** `/api/items/:id` - Delete item

- **GET** `/api/stores` - List all stores
- **POST** `/api/stores` - Create store
- **PUT** `/api/stores/:id` - Update store

- **GET** `/api/inventory` - Get inventory
- **POST** `/api/inventory` - Update inventory

- **GET** `/api/sales` - Get sales data

---

## 🛠️ Common Issues

- **Blank page**: Check `frontend/public/_redirects` exists
- **CORS errors**: Enable CORS in Lambda Function URL
- **Build fails**: Verify environment variables in Amplify
- **MongoDB connection**: Check Atlas connection string and network access

---

## 📄 License

Educational project - HKMU Software Engineering 3500SEF
