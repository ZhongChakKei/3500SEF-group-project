# JWT Login Testing Page

A simple JWT authentication system for testing purposes.

## 📁 Files Created

- `login.html` - Frontend login page
- `login.js` - Client-side JavaScript
- `server.js` - Backend server with JWT authentication
- `package.json` - Node.js dependencies

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
npm install
```

### 2. Start the Server

```powershell
npm start
```

Or for development with auto-reload:

```powershell
npm run dev
```

The server will run on `http://localhost:3000`

### 3. Open the Login Page

Simply open `login.html` in your browser, or if you want to serve it:

```powershell
# Open directly
start login.html
```

## 🔑 Test Credentials

**Admin User:**
- Username: `admin`
- Password: `password123`

**Regular User:**
- Username: `user`
- Password: `user123`

## 🧪 API Endpoints

### Login
```
POST http://localhost:3000/api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

### Protected Route (Example)
```
GET http://localhost:3000/api/protected
Authorization: Bearer YOUR_JWT_TOKEN
```

### Health Check
```
GET http://localhost:3000/api/health
```

## 🔒 Features

- ✅ Simple JWT authentication
- ✅ Token storage in localStorage
- ✅ Token expiration (1 hour)
- ✅ Protected route example
- ✅ CORS enabled
- ✅ Clean, modern UI
- ✅ Error handling
- ✅ Loading states

## 📝 Notes

### Security Warning ⚠️

This is for **TESTING PURPOSES ONLY**. In production:

1. **Never hardcode passwords** - Use bcrypt or similar to hash passwords
2. **Store JWT_SECRET in environment variables** - Don't commit secrets
3. **Use HTTPS** - Always use secure connections in production
4. **Implement rate limiting** - Prevent brute force attacks
5. **Add input validation** - Sanitize all user inputs
6. **Use secure token storage** - Consider httpOnly cookies instead of localStorage
7. **Implement refresh tokens** - For better security
8. **Add CSRF protection** - Prevent cross-site request forgery

## 🛠️ Testing with cURL

### Login Request
```powershell
curl -X POST http://localhost:3000/api/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"password123\"}'
```

### Protected Route with Token
```powershell
curl -X GET http://localhost:3000/api/protected `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎨 Customization

### Change JWT Secret
Edit `server.js`:
```javascript
const JWT_SECRET = 'your-new-secret-key';
```

### Change Token Expiration
Edit `server.js`:
```javascript
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' }); // 2 hours
```

### Add More Users
Edit the `users` array in `server.js`:
```javascript
const users = [
    {
        id: 3,
        username: 'newuser',
        password: 'newpass',
        email: 'newuser@test.com',
        role: 'user'
    }
];
```

## 🐛 Troubleshooting

### "Connection error. Is the server running?"
- Make sure the server is running (`npm start`)
- Check if port 3000 is available
- Verify the API_URL in `login.js` matches your server URL

### CORS Errors
- The server has CORS enabled by default
- If you're using a different port, update the CORS settings in `server.js`

### Token Not Saving
- Check browser console for errors
- Verify localStorage is enabled in your browser
- Clear browser cache and try again

## 📦 Dependencies

- **express**: Web framework for Node.js
- **jsonwebtoken**: JWT creation and verification
- **cors**: Enable CORS for cross-origin requests
- **nodemon**: Auto-restart server during development (dev dependency)

## 🎯 Next Steps

To extend this for a real application:

1. Add a database (MongoDB, PostgreSQL, etc.)
2. Implement password hashing with bcrypt
3. Add user registration endpoint
4. Implement refresh tokens
5. Add password reset functionality
6. Create a dashboard/protected page
7. Add role-based access control
8. Implement logout functionality

Enjoy testing! 🚀
