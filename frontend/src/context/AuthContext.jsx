import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on load
  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await api.getMe();
        // Construct user object based on the profile
        setUser({
          userId: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          role: profile.role,
          phone: profile.phone,
          headline: profile.headline,
          resumeUrl: profile.resumeUrl,
        });
      } catch (err) {
        console.error('Session validation failed:', err);
        // Clear corrupt token
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('token', res.token);
      setUser({
        userId: res.userId,
        email: res.email,
        fullName: res.fullName,
        role: res.role,
      });
      // Fetch details to get profile data
      const profile = await api.getMe();
      setUser({
        userId: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        phone: profile.phone,
        headline: profile.headline,
        resumeUrl: profile.resumeUrl,
      });
      return profile;
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password, role, phone) => {
    setLoading(true);
    try {
      const res = await api.register({ fullName, email, password, role, phone });
      // Newly registered users must not be automatically logged in; they must verify first.
      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getMe();
      setUser({
        userId: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        phone: profile.phone,
        headline: profile.headline,
        resumeUrl: profile.resumeUrl,
      });
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
