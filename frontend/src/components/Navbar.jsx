import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Hotel, Calendar, Sparkles, Building2, Search,
  CalendarCheck, User, LogOut, Shield, Menu, X, Star
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'Vacancies', path: '/vacancies' },
    { name: 'My Bookings', path: '/my-bookings' },
    { name: 'Admin ⚙', path: '/dashboard', requiresStaff: false },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#04120e]/90 backdrop-blur-xl border-b border-[#d4af37]/20 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Crest & Name */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-xl shadow-lg border border-[#f3e5ab]/50 transition-transform group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #c5a02e 100%)',
              color: '#041510',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.35)'
            }}
          >
            K
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-widest text-white block leading-none">
              KAVERI STAYS
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#d4af37] block mt-1">
              Ultra-Luxury Retreats
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path === '/properties' && location.pathname.startsWith('/properties'));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User / Sign In Action */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={user.role === 'Guest' ? '/my-bookings' : '/dashboard'}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-[#d4af37]/30 text-xs font-semibold text-[#f3e5ab] hover:border-[#d4af37] transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f3e5ab] text-black font-bold text-[10px] flex items-center justify-center">
                  {user.username?.[0]?.toUpperCase() || 'K'}
                </div>
                <span className="max-w-[120px] truncate">{user.username}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab]">
                  {user.role}
                </span>
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-gold px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider flex items-center gap-1.5 shadow-lg"
            >
              <User className="w-3.5 h-3.5" />
              <span>VIP Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#04120e] border-b border-[#d4af37]/20 px-6 py-5 space-y-3 animate-fadeInUp">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide ${
                location.pathname === link.path
                  ? 'bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-white font-medium">{user.username} ({user.role})</span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                  className="text-xs text-rose-400 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-gold w-full py-3 rounded-xl text-center text-xs font-bold block"
              >
                VIP Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
