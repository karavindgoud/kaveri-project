import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Home } from './pages/Home';
import { ColorCursor } from './components/ColorCursor';

// Lazy load non-landing pages to optimize initial bundle size & eliminate unused JS on first paint
const Properties = lazy(() => import('./pages/Properties').then(m => ({ default: m.Properties })));
const Vacancies = lazy(() => import('./pages/Vacancies').then(m => ({ default: m.Vacancies })));
const MyBookings = lazy(() => import('./pages/MyBookings').then(m => ({ default: m.MyBookings })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Rooms = lazy(() => import('./pages/Rooms').then(m => ({ default: m.Rooms })));
const Guests = lazy(() => import('./pages/Guests').then(m => ({ default: m.Guests })));
const Bookings = lazy(() => import('./pages/Bookings').then(m => ({ default: m.Bookings })));
const Payments = lazy(() => import('./pages/Payments').then(m => ({ default: m.Payments })));
const Reviews = lazy(() => import('./pages/Reviews').then(m => ({ default: m.Reviews })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-[#04120e]">
    <div className="w-7 h-7 rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37] animate-spin" />
  </div>
);

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
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
