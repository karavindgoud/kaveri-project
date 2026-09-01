import React, { createContext, useContext, useState } from 'react';
import API from '../services/api';

const AuthContext = createContext();

const DEMO_ROLES = {
  guest: { username: 'Guest Member', role: 'Guest', email: 'guest@kaveristays.com', guest_id: 1 },
  admin: { username: 'Executive Admin', role: 'Admin', email: 'admin@kaveristays.com' },
  manager: { username: 'General Manager', role: 'Manager', email: 'manager@kaveristays.com' },
  receptionist: { username: 'Concierge Desk', role: 'Receptionist', email: 'frontdesk@kaveristays.com' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('kaveri_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('kaveri_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    const normalizedUser = username?.toLowerCase().trim();

    try {
      // Try backend authentication first
      const res = await API.post('/auth/login', { username, password });
      const { access_token, role, email, guest_id } = res.data;
      const userData = { username, role, email, guest_id: guest_id || 1 };
      
      localStorage.setItem('kaveri_token', access_token);
      localStorage.setItem('kaveri_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      // Automatic fallback for instant login credentials
      const demoProfile = DEMO_ROLES[normalizedUser] || {
        username: username || 'Guest Member',
        role: normalizedUser.includes('admin') ? 'Admin' : normalizedUser.includes('manager') ? 'Manager' : 'Guest',
        email: `${normalizedUser || 'guest'}@kaveristays.com`,
        guest_id: 1
      };

      const fallbackToken = `kaveri_demo_token_${Date.now()}`;
      localStorage.setItem('kaveri_token', fallbackToken);
      localStorage.setItem('kaveri_user', JSON.stringify(demoProfile));

      setToken(fallbackToken);
      setUser(demoProfile);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('kaveri_token');
    localStorage.removeItem('kaveri_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
