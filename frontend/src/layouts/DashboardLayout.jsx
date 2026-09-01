import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2, BedDouble, Users, CalendarCheck,
  CreditCard, Star, BarChart3, LogOut, Hotel,
  ChevronRight, Sparkles, Compass, Shield, Award,
  Menu, X, Bell
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isGuest = user?.role === 'Guest';

  const navItems = isGuest
    ? [
        { name: 'The Collection', path: '/dashboard', icon: Compass },
        { name: 'My Reservations', path: '/bookings', icon: CalendarCheck },
        { name: 'My Reviews & Accolades', path: '/reviews', icon: Star },
      ]
    : [
        { name: 'Executive Overview', path: '/dashboard', icon: Hotel },
        { name: 'Resort Properties', path: '/properties', icon: Building2 },
        { name: 'Suites & Rooms', path: '/rooms', icon: BedDouble },
        { name: 'VIP Guest Directory', path: '/guests', icon: Users },
        { name: 'Reservations Ledger', path: '/bookings', icon: CalendarCheck },
        { name: 'Financial Records', path: '/payments', icon: CreditCard },
        { name: 'Accolades & Reviews', path: '/reviews', icon: Star },
        { name: 'Analytics & Reports', path: '/reports', icon: BarChart3 },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#04120e] text-slate-100 selection:bg-[#d4af37] selection:text-black">

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed lg:sticky top-0 h-screen flex flex-col z-50 transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: collapsed ? '80px' : '260px',
          background: 'linear-gradient(180deg, #06241b 0%, #03130e 100%)',
          borderRight: '1px solid rgba(212, 175, 55, 0.18)',
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-[#d4af37]/10">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-xl shadow-lg cursor-pointer flex-shrink-0 border border-[#f3e5ab]/40"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #c5a02e 100%)',
                color: '#041510',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
              }}
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand navigation" : "Collapse navigation"}
            >
              K
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-serif text-sm font-semibold tracking-wide text-white whitespace-nowrap leading-tight">
                  KAVERI STAYS
                </h1>
                <p className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#f3e5ab]">
                  {isGuest ? 'Exclusive Member' : 'Management Suite'}
                </p>
              </div>
            )}
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Tier Ribbon */}
        {!collapsed && (
          <div className="mx-4 mt-4 px-3 py-2 rounded-xl bg-white/10 border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#f3e5ab]">
                {isGuest ? 'Diamond Elite' : 'Executive Console'}
              </span>
            </div>
            {isGuest && (
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                5,000 Pts
              </span>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group ${
                  isActive ? 'nav-active' : 'nav-inactive'
                }`}
                title={collapsed ? item.name : ''}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-[#f3e5ab] group-hover:text-white'
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}
                {!collapsed && isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-white flex-shrink-0 opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.05] border border-white/15">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                {user?.username?.[0]?.toUpperCase() || 'K'}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.username}</p>
                <span className="text-[10px] text-[#f3e5ab] font-medium tracking-wide">
                  {user?.role || 'Valued Guest'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#f3e5ab] hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN VIEWPORT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* ── LUXURY TOP HEADER ── */}
        <header
          className="sticky top-0 z-30 px-6 lg:px-10 py-4 flex items-center justify-between border-b border-[#d4af37]/10"
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#f3e5ab]">
                {isGuest ? 'Welcome to Exclusivity' : 'Enterprise Administration'}
              </p>
              <h2 className="font-serif text-lg lg:text-xl font-medium text-white tracking-wide">
                {isGuest ? `Welcome, ${user?.username || 'Guest'}` : 'Executive Operations Console'}
              </h2>
            </div>
          </div>

          {/* Right Header Status */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-mono font-medium text-slate-300">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />

            {/* Role & Status Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs font-semibold text-[#f3e5ab]">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span>{user?.role || 'Guest'}</span>
            </div>
          </div>
        </header>

        {/* ── CONTENT CONTAINER ── */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto animate-fadeInUp">
          {children}
        </main>
      </div>
    </div>
  );
};
