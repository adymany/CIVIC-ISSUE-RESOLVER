// Utility functions for authentication and role checking

// Check if user is authenticated (in a real app, this would check for a valid session/token)
export function isAuthenticated() {
  // For now, we'll assume the user is authenticated if they can access protected pages
  // In a real application, you would check for a valid session or JWT token
  if (typeof window !== 'undefined') {
    // Check if there's a user object in localStorage or sessionStorage
    return !!(localStorage.getItem('user') || sessionStorage.getItem('user'));
  }
  return false;
}

// Get current user role
export function getUserRole() {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        return user.role || 'USER';
      } catch (e) {
        console.error('Error parsing user data:', e);
        // Clear invalid user data
        clearUser();
      }
    }
  }
  return 'USER'; // Default to USER role
}

// Check if user is admin
export function isAdmin() {
  return getUserRole() === 'ADMIN';
}

// Check if user is a regular user
export function isUser() {
  return getUserRole() === 'USER';
}

// Store user data after login
export function storeUser(user) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

// Clear user data on logout
export function clearUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  }
}

// Get current user ID
export function getCurrentUserId() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id || null;
      } catch (e) {
        // Clear invalid user data
        clearUser();
        return null;
      }
    }
  }
  return null;
}

// Redirect to login page
export function redirectToLogin(router) {
  if (typeof window !== 'undefined') {
    router.push('/auth');
  }
}

// Redirect to home page
export function redirectToHome(router) {
  if (typeof window !== 'undefined') {
    router.push('/');
  }
}

// Signup function
export async function signup(email, password, name, mobile, role) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name, mobile, role }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to signup');
  }
  
  return data;
}

// Login function
export async function login(email, password, mobile) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, mobile }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to login');
  }
  
  // Store user data
  storeUser(data.user);
  
  return data;
}

// Send OTP function
export async function sendOTP(mobile) {
  const response = await fetch('/api/auth/otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send OTP');
  }
  
  return data;
}

// Verify OTP function
export async function verifyOTP(mobile, otp) {
  const response = await fetch('/api/auth/otp', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile, otp }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to verify OTP');
  }
  
  return data;
}

// Logout function
export async function logout() {
  // Clear user data
  clearUser();
  // In a real implementation, you would also invalidate the session/cookie on the server
  return Promise.resolve();
}

// Get current user (mock implementation)
export async function getCurrentUser() {
  if (typeof window !== 'undefined') {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        console.error('Error parsing user data:', e);
        // Clear invalid user data
        clearUser();
        return null;
      }
    }
  }
  return null;
}