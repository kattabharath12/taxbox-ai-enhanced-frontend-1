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

  const register = async (userData) => {
    console.log('Making registration request to:', axios.defaults.baseURL + '/register');
    const response = await axios.post('/register', userData);
    return response.data;
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
