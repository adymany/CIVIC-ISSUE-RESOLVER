// Utility functions for authentication

// Signup function
async function signup(email, password, name) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to signup');
  }
  
  return data;
}

// Login function
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to login');
  }
  
  return data;
}

// Logout function
async function logout() {
  // In a real implementation, you would clear the session/cookie
  // For now, we'll just return a resolved promise
  return Promise.resolve();
}

// Get current user (mock implementation)
async function getCurrentUser() {
  // In a real implementation, you would check the session/cookie
  // For now, we'll return null to indicate no user is logged in
  return null;
}

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser
};

module.exports.default = {
  signup,
  login,
  logout,
  getCurrentUser
};