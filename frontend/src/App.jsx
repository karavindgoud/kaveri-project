import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Home } from './pages/Home';
import { Properties } from './pages/Properties';
import { Vacancies } from './pages/Vacancies';
import { MyBookings } from './pages/MyBookings';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
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
          {/* Public Guest-Facing Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/vacancies" element={<Vacancies />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/login" element={<Login />} />

          {/* Hotelier Executive Management Console */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Rooms /></ProtectedRoute>} />
          <Route path="/guests" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Guests /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Payments /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Reports /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
