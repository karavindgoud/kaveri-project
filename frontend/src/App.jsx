import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Properties } from './pages/Properties';
import { Rooms } from './pages/Rooms';
import { Guests } from './pages/Guests';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { Reviews } from './pages/Reviews';
import { Reports } from './pages/Reports';
import { ColorCursor } from './components/ColorCursor';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
};

const STAFF_ROLES = ['Admin', 'Manager', 'Receptionist'];

export const App = () => {
  return (
    <AuthProvider>
      <ColorCursor />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Properties /></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Rooms /></ProtectedRoute>} />
          <Route path="/guests" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Guests /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Payments /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Reports /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
