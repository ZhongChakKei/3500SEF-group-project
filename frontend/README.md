# Distributed Inventory & Sales Management Frontend

React + Vite + TypeScript + Tailwind demo consuming AWS Lambda Function URL + Cognito Hosted UI (PKCE) for auth.

## Features
- Cognito Hosted UI (Authorization Code + PKCE)
- Protected Routes (Dashboard, Products, Product Detail, Inventory)
- Product listing, variant detail with per-location availability
- Reserve stock flow (POST /reserve) with 409 handling
- Order creation placeholder (POST /orders)
- Reusable API client with Bearer token injection
- Tailwind design + skeleton loaders

## Stack
- React 18 + Vite + TS
- Tailwind CSS
- AWS Cognito (Hosted UI)
- AWS Lambda Function URL (single function routing by path)
- DynamoDB single-table (backend handled in Lambda)

## Environment Variables (`.env`)
Create `.env.local` by copying `.env.example`:
```
VITE_API_BASE_URL=https://<lambda-function-url>
VITE_COGNITO_REGION=us-east-2
VITE_COGNITO_USER_POOL_ID=us-east-2_XXXXXXX
VITE_COGNITO_CLIENT_ID=<app-client-id-no-secret>
VITE_COGNITO_DOMAIN=<your-domain>.auth.us-east-2.amazoncognito.com
VITE_OAUTH_SCOPES=openid profile email read.inventory reserve.stock
VITE_REDIRECT_URI=https://<your-amplify-app>/callback
VITE_LOGOUT_URI=https://<your-amplify-app>/
```

## Cognito Setup (us-east-2)
1. Create a User Pool (Name: `dist-inventory-users`).
2. Attributes: email required.
3. App Client: Enable Cognito Hosted UI, do NOT generate client secret.
4. Allowed callback URLs: `https://<your-amplify-app>/callback` (and `http://localhost:5173/callback` for local).
5. Allowed logout URLs: `https://<your-amplify-app>/` (and `http://localhost:5173/`).
6. OAuth Flows: Authorization Code Grant.
7. OAuth Scopes: `openid`, `profile`, `email`, plus any custom API scopes (e.g., `read.inventory`, `reserve.stock`).
8. Domain: Configure a Cognito domain prefix (e.g., `dist-inv-demo`).

## Lambda Function URL Backend (Summary)
Expected routes (JSON):
```
GET /products
GET /variants?product_id=P-...
GET /inventory?variant_id=V-...
GET /inventory?location_id=STO-CWB
POST /reserve { variantId, locationId, qty }
POST /orders  { orderId, locationId, lines:[{variantId,qty,price}] }
```
The Lambda must validate the access token scopes and interact with DynamoDB table `dist-inventory`.

## Running Locally
```bash
cd frontend
npm install
npm run dev
```
Visit: http://localhost:5173

Add local callback/logout URIs in Cognito while developing.

## Deploy to Amplify
1. Commit everything and push to GitHub.
2. In Amplify Console: New App → Host Web App → Connect repository.
3. Framework: Vite (detected automatically).
4. Add environment variables in Amplify build settings.
5. Deploy.

## Code Structure
```
frontend/
  src/
    context/AuthContext.tsx        # Auth provider (PKCE)
    services/apiClient.ts          # Axios with token
    services/inventoryService.ts   # Domain API calls
    pages/                         # Route pages
    components/Layout.tsx          # Shell layout + nav
    types/                         # Shared types
    utils/env.ts                   # Env access
```

## Auth Flow (PKCE)
1. User clicks login → redirect to Hosted UI with `code_challenge`.
2. Cognito redirects back with `code` → exchange for tokens.
3. Tokens stored (localStorage) with expiry.
4. `Authorization: Bearer <access_token>` added to each API call.
5. 401 → redirect to /login.

## Reserve Flow
1. User enters qty + clicks Reserve at location.
2. POST `/reserve` with `variantId`, `locationId`, `qty`.
3. On 200: success message + refresh variant inventory.
4. On 409: show conflict message (e.g., insufficient available).

## TODO / Extension Ideas
- Add toast system + error boundary
- Implement order creation UI
- Add SKU copy button & image loading from S3
- Replace sequential variant inventory fetch with batched call
- Add pagination and advanced filtering for products

## License
MIT (Educational demo)
