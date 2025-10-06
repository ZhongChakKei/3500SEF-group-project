// Simple JWT Authentication Server for Testing
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Secret key for JWT (In production, use environment variables!)
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Test user database (hardcoded for testing)
const users = [
    {
        id: 1,
        username: 'admin',
        password: 'password123', // In production, use bcrypt to hash passwords!
        email: 'admin@test.com',
        role: 'admin'
    },
    {
        id: 2,
        username: 'user',
        password: 'user123',
        email: 'user@test.com',
        role: 'user'
    }
];

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
    
    // Create JWT token
    const token = jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
    );
    
    // Send response
    res.json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
});

// Protected route example - Verify JWT token
app.get('/api/protected', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Access granted to protected route',
        user: req.user
    });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(403).json({
            success: false,
            message: 'No token provided'
        });
    }
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        
        req.user = decoded;
        next();
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve login page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 JWT Authentication Server running on http://localhost:${PORT}`);
    console.log(`\nTest the login with:`);
    console.log(`  Username: admin`);
    console.log(`  Password: password123`);
    console.log(`\nOr:`);
    console.log(`  Username: user`);
    console.log(`  Password: user123`);
});
