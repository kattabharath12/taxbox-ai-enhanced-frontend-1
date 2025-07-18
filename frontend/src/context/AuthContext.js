import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // TEMPORARILY HARDCODE THE API URL FOR TESTING
  const API_BASE_URL = 'https://taxbox-ai-enhanced-backend-1-production.up.railway.app';
  
  // Log for debugging
  console.log('API_BASE_URL set to:', API_BASE_URL);
  
  axios.defaults.baseURL = API_BASE_URL;

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get('/users/me');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post('/token', formData);
    const { access_token } = response.data;

    localStorage.setItem('token', access_token);
    setToken(access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

    await fetchUser();
    return response.data;
  };

  // UPDATED REGISTER FUNCTION - TESTS MULTIPLE ENDPOINTS
  const register = async (userData) => {
    // Try different possible endpoints
    const endpoints = ['/register', '/api/register', '/api/v1/register', '/auth/register', '/users/register'];
    
    for (const endpoint of endpoints) {
      try {
        console.log('Trying registration request to:', axios.defaults.baseURL + endpoint);
        const response = await axios.post(endpoint, userData);
        console.log('SUCCESS with endpoint:', endpoint);
        return response.data;
      } catch (error) {
        console.log('Failed with endpoint:', endpoint, 'Error:', error.response?.status || error.message);
        // If it's not a 404, it might be a different error, so continue trying
        if (error.response?.status !== 404) {
          // Log non-404 errors but continue to next endpoint
          console.log('Non-404 error details:', error.response?.data);
        }
      }
    }
    
    // If all endpoints failed, throw the last error
    throw new Error('Registration endpoint not found. Tried: ' + endpoints.join(', '));
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
