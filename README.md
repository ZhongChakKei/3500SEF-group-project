# 3500SEF-group-project

Demo POS web app with JWT authentication using React (Vite) frontend and Node.js Express backend.

## Features

✅ **JWT Authentication System**
- Secure login/register with JWT tokens
- Role-based access control (Admin/User)
- Password hashing with bcrypt
- Protected routes and API endpoints
- Token refresh capability

✅ **User Roles**
- **Admin**: Full access to all features including Settings and Products
- **User**: Limited access to main features
- Optional authentication - visitors can browse most pages without logging in

✅ **Demo Accounts**
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## Structure

- `frontend/` — React app with Vite, routing, and JWT authentication
- `backend/` — Express server with JWT authentication, bcrypt password hashing
- `amplify.yml` — AWS Amplify deployment configuration
- `DEPLOYMENT.md` — Detailed deployment guide for AWS Amplify

## Quick start (Windows PowerShell)

### 1. Backend Setup

```powershell
cd backend
npm install
# Copy .env.example to .env and configure
cp .env.example .env
# Start backend server
npm start
```

Backend runs at http://localhost:3001

### 2. Frontend Setup

```powershell
cd frontend
npm install
# Start frontend dev server
npm run dev
```

Frontend runs at http://localhost:5173

## Environment Variables

### Backend (.env)
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_BASE=http://localhost:3001/api
```

## API Endpoints

### Public Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Protected Endpoints (require authentication)
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/protected` - Test protected endpoint

### Admin Only Endpoints
- `GET /api/admin-only` - Test admin-only endpoint

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed AWS Amplify deployment instructions.

### Quick Deploy to AWS Amplify

1. Connect your GitHub repository to AWS Amplify
2. Configure environment variables in Amplify Console:
   - `JWT_SECRET` (generate a strong random key)
   - `JWT_EXPIRES_IN=24h`
   - `NODE_ENV=production`
   - `VITE_API_BASE` (your backend API URL)
3. Push to `main` branch - auto-deployment will trigger
4. Test your deployed application

## Development

### Project Structure
```
webApp/
├── backend/
│   ├── src/
│   │   ├── app.js                   # Express app
│   │   ├── controllers/             # Business logic
│   │   ├── middleware/              # Auth middleware
│   │   ├── models/                  # Data models
│   │   ├── routes/                  # API routes
│   │   └── utils/                   # JWT, password utilities
│   ├── .env                         # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   ├── lib/                     # API client
│   │   ├── modules/                 # Feature modules
│   │   │   ├── auth/                # Authentication
│   │   │   ├── layout/              # Layout components
│   │   │   └── ...                  # Other features
│   │   └── main.jsx                 # App entry point
│   └── package.json
├── amplify.yml                      # AWS Amplify config
└── DEPLOYMENT.md                    # Deployment guide
```

### Testing Authentication

1. **Login with demo accounts**:
   - Click "Admin Login" or "User Login" in sidebar
   - Or use the login form at `/auth`

2. **Test role-based access**:
   - Admin can access Settings and Products
   - User cannot access admin-only pages
   - Try accessing `/settings` with both roles

3. **Test API endpoints**:
   - Go to Settings (admin only)
   - Click "Test Admin-Only Endpoint"
   - Click "Test Protected Endpoint"

## Security Notes

⚠️ **Important for Production:**
- Generate a strong `JWT_SECRET` using crypto
- Change or remove demo user accounts
- Use a real database instead of in-memory storage
- Enable rate limiting
- Implement password reset functionality
- Add email verification
- Set up proper logging and monitoring

## Next steps

- ✅ JWT authentication implemented
- ✅ Role-based access control
- ✅ AWS Amplify deployment ready
- 🔲 Replace in-memory storage with database (DynamoDB/MongoDB)
- 🔲 Add password reset functionality
- 🔲 Implement email verification
- 🔲 Add audit logging
- 🔲 Flesh out modules: stock, transfers, loyalty, export, etc.

## Tech Stack

**Frontend:**
- React 18
- React Router 6
- Axios
- Vite

**Backend:**
- Node.js
- Express
- JWT (jsonwebtoken)
- bcryptjs
- CORS

**Deployment:**
- AWS Amplify
- GitHub integration for CI/CD
