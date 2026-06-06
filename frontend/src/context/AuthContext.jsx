import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    // Don't set user — registration now requires OTP verification
    return data;
  };

  const verifyOTP = async (email, otp) => {
    const { data } = await API.post('/auth/verify-otp', { email, otp });
    setUser(data);
    return data;
  };

  const resendOTP = async (email) => {
    const { data } = await API.post('/auth/resend-otp', { email });
    return data;
  };

  const logout = async () => {
    await API.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOTP, resendOTP, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
