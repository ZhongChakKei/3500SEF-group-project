// JWT Login Page - Client Side JavaScript

// Use relative URL since we're serving from the same server
const API_URL = ''; // Empty string means same origin

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');
    const messageDiv = document.getElementById('message');
    const tokenDisplay = document.getElementById('tokenDisplay');
    
    // Disable button and show loading
    loginBtn.disabled = true;
    btnText.innerHTML = '<span class="loading"></span>';
    messageDiv.style.display = 'none';
    tokenDisplay.classList.remove('show');
    
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Success
            messageDiv.className = 'message success';
            messageDiv.textContent = data.message || 'Login successful!';
            messageDiv.style.display = 'block';
            
            // Store token
            localStorage.setItem('jwt_token', data.token);
            
            // Display token
            document.getElementById('tokenText').textContent = data.token;
            tokenDisplay.classList.add('show');
            
            // Clear form
            document.getElementById('loginForm').reset();
            
            console.log('JWT Token:', data.token);
            console.log('User Info:', data.user);
            
        } else {
            // Error
            messageDiv.className = 'message error';
            messageDiv.textContent = data.message || 'Login failed!';
            messageDiv.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Login error:', error);
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Connection error. Is the server running?';
        messageDiv.style.display = 'block';
    } finally {
        // Re-enable button
        loginBtn.disabled = false;
        btnText.textContent = 'Login';
    }
});

// Check if token exists on page load
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        const tokenDisplay = document.getElementById('tokenDisplay');
        document.getElementById('tokenText').textContent = token;
        tokenDisplay.classList.add('show');
        
        const messageDiv = document.getElementById('message');
        messageDiv.className = 'message success';
        messageDiv.textContent = 'Token found in storage!';
        messageDiv.style.display = 'block';
    }
});
