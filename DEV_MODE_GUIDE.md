# 🛠️ Development Mode Activated!

## What is Dev Mode?

Dev Mode allows you to **bypass authentication** and access all protected pages without logging in. This is perfect for:
- Testing the UI without setting up Cognito
- Developing features locally
- Quick prototyping

## How to Use

### ✅ Dev Mode is NOW ENABLED

I've added `VITE_DEV_MODE=true` to your `.env` file.

### Accessing Your Pages

**Option 1: Use the Dev Mode Button (Landing Page)**
1. Go to http://localhost:5173/
2. Click the gray button: **"🛠️ Dev Mode: Skip to Dashboard"**
3. You'll be taken directly to the dashboard!

**Option 2: Direct URL Access**
You can now directly visit any protected route:

- **Dashboard:** http://localhost:5173/dashboard
- **Products:** http://localhost:5173/products
- **Inventory:** http://localhost:5173/inventory
- **Product Detail:** http://localhost:5173/products/1

### Navigation

Once you're in the dashboard, you'll see the **navigation sidebar/header** with links to:
- Dashboard
- Products
- Inventory
- And more!

## Toggling Dev Mode

### Turn OFF Dev Mode (Require Authentication)
Edit `.env` and change:
```bash
VITE_DEV_MODE=false  # or remove this line
```

Then restart the dev server.

### Turn ON Dev Mode (Bypass Authentication)
```bash
VITE_DEV_MODE=true
```

## What Changes Were Made

1. **App.tsx** - Updated `ProtectedRoute` to check for dev mode
2. **.env** - Added `VITE_DEV_MODE=true`
3. **LandingPage.tsx** - Added a "Skip to Dashboard" button in dev mode

## Your Available Pages

### 📊 Dashboard (`/dashboard`)
- Low stock alerts
- Open orders
- Transfers
- Overview stats

### 📦 Products (`/products`)
- Product listing
- Search and filter
- Product details

### 📋 Inventory (`/inventory`)
- Stock levels
- Location management
- Inventory tracking

### 🔍 Product Detail (`/products/:id`)
- Variant selection
- Stock reservation
- Product information

## Important Notes

⚠️ **Dev mode is only active in development** (`npm run dev`)
- Production builds will ignore this setting
- Always test with real authentication before deploying

🔒 **Security:**
- Dev mode should NEVER be enabled in production
- The `.env` file is gitignored, so it won't be committed
- For production, set proper environment variables in Amplify Console

## Quick Links

- Landing: http://localhost:5173/
- Dashboard: http://localhost:5173/dashboard
- Products: http://localhost:5173/products
- Inventory: http://localhost:5173/inventory

---

**Next Step:** Refresh your browser or click the "Skip to Dashboard" button!
