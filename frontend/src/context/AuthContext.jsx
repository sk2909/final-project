import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to decode JWT token
const decodeJwtToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token'); // Also get the token
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Re-verify the ID from the token in case it wasn't saved correctly before
        const decodedToken = decodeJwtToken(savedToken.replace('Bearer ', '')); // Remove 'Bearer ' prefix
        if (decodedToken && decodedToken.id) {
          setUser({ ...parsedUser, id: decodedToken.id }); // Ensure ID is present
        } else {
          setUser(parsedUser); // Fallback if ID not in token
        }
      } catch (e) {
        console.error("Failed to parse saved user or token:", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8090/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        const token = data.token.replace('Bearer ', ''); // Remove 'Bearer ' prefix for decoding
        const decodedToken = decodeJwtToken(token);

        let userId = null;
        if (decodedToken && decodedToken.id) {
          userId = decodedToken.id;
        } else {
          console.warn("User ID not found in decoded token payload.");
        }

        const userObj = {
          id: userId, // Set the ID from the decoded token
          email,
          name: email.split('@')[0],
          role: data.role || ''
        };

        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('token', data.token); // Store the full token with 'Bearer '
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const { role, ...dataToSend } = userData;
      const response = await fetch('http://localhost:8090/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (err) {
      console.error("Registration failed:", err);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};