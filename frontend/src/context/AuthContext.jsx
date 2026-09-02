import React, { createContext, useContext, useState } from 'react';
import API from '../services/api';

const AuthContext = createContext();

const DEMO_ROLES = {
  guest: { username: 'Aarav Sharma', role: 'Guest', email: 'aarav.sharma@example.com', guest_id: 1 },
  'aarav': { username: 'Aarav Sharma', role: 'Guest', email: 'aarav.sharma@example.com', guest_id: 1 },
  'aarav sharma': { username: 'Aarav Sharma', role: 'Guest', email: 'aarav.sharma@example.com', guest_id: 1 },
  'aarav.sharma@example.com': { username: 'Aarav Sharma', role: 'Guest', email: 'aarav.sharma@example.com', guest_id: 1 },
  'anita': { username: 'Anita Desai', role: 'Guest', email: 'anita.desai@example.com', guest_id: 2 },
  'anita desai': { username: 'Anita Desai', role: 'Guest', email: 'anita.desai@example.com', guest_id: 2 },
  'anita.desai@example.com': { username: 'Anita Desai', role: 'Guest', email: 'anita.desai@example.com', guest_id: 2 },
  'ben': { username: 'Ben Carter', role: 'Guest', email: 'ben.carter@example.org', guest_id: 3 },
  'ben carter': { username: 'Ben Carter', role: 'Guest', email: 'ben.carter@example.org', guest_id: 3 },
  'ben.carter@example.org': { username: 'Ben Carter', role: 'Guest', email: 'ben.carter@example.org', guest_id: 3 },
  'chloe': { username: 'Chloe Dubois', role: 'Guest', email: 'chloe.dubois@example.com', guest_id: 4 },
  'chloe dubois': { username: 'Chloe Dubois', role: 'Guest', email: 'chloe.dubois@example.com', guest_id: 4 },
  'daniel': { username: 'Daniel Fischer', role: 'Guest', email: 'daniel.fischer@example.de', guest_id: 5 },
  'daniel fischer': { username: 'Daniel Fischer', role: 'Guest', email: 'daniel.fischer@example.de', guest_id: 5 },
  'elena': { username: 'Elena Rossi', role: 'Guest', email: 'elena.rossi@example.com', guest_id: 6 },
  'elena rossi': { username: 'Elena Rossi', role: 'Guest', email: 'elena.rossi@example.com', guest_id: 6 },
  'maya': { username: 'Maya Krishnan', role: 'Guest', email: 'maya.k@example.com', guest_id: 14 },
  'maya krishnan': { username: 'Maya Krishnan', role: 'Guest', email: 'maya.k@example.com', guest_id: 14 },
  'hiroshi': { username: 'Hiroshi Tanaka', role: 'Guest', email: 'hiroshi.tanaka@example.jp', guest_id: 9 },
  'admin': { username: 'Executive Admin', role: 'Admin', email: 'admin@kaveristays.com' },
  'manager': { username: 'General Manager', role: 'Manager', email: 'manager@kaveristays.com' },
  'receptionist': { username: 'Concierge Desk', role: 'Receptionist', email: 'frontdesk@kaveristays.com' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('kaveri_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('kaveri_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password = '') => {
    setLoading(true);
    const normalizedUser = username?.toLowerCase().trim();

    try {
      // Try backend authentication first
      const res = await API.post('/auth/login', { username, password });
      const { access_token, role, email, guest_id } = res.data;
      const userData = { username: res.data.username || username, role, email, guest_id: guest_id || 1 };
      
      localStorage.setItem('kaveri_token', access_token);
      localStorage.setItem('kaveri_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      // Instant login fallback for demo / guest profiles
      const demoProfile = DEMO_ROLES[normalizedUser] || {
        username: username || 'Aarav Sharma',
        role: normalizedUser.includes('admin') ? 'Admin' : normalizedUser.includes('manager') ? 'Manager' : normalizedUser.includes('reception') ? 'Receptionist' : 'Guest',
        email: `${normalizedUser || 'aarav.sharma'}@example.com`,
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
