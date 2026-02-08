import { createContext, useState, useContext, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await userService.getProfile();
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const { data } = await authService.login({ username, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return true;
  };

  const register = async (userData) => {
    const { data } = await authService.register(userData);
    localStorage.setItem('token', data.token);
    await fetchUserProfile();
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
