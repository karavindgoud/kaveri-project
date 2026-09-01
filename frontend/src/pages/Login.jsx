import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, Sparkles, Shield, Compass, KeyRound, User, Lock, ArrowRight, Zap } from 'lucide-react';

export const Login = () => {
  const [selectedRoleType, setSelectedRoleType] = useState('guest');
  const [username, setUsername] = useState('guest');
  const [password, setPassword] = useState('guest123');
  const [captchaChecked, setCaptchaChecked] = useState(true);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSelectRoleType = async (type) => {
    setSelectedRoleType(type);
    const u = type === 'guest' ? 'guest' : 'admin';
    const p = type === 'guest' ? 'guest123' : 'admin123';
    setUsername(u);
    setPassword(p);
  };

  // Instant one-click login for demo roles
  const handleInstantLogin = async (u, p, type) => {
    setSelectedRoleType(type);
    setUsername(u);
    setPassword(p);
    setError('');
    const res = await login(u, p);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#04120e] text-slate-100 overflow-x-hidden">

      {/* ── LEFT: Cinematic Resort Showcase (Reference Aesthetic) ── */}
      <div className="lg:w-[58%] relative min-h-[500px] lg:min-h-screen flex flex-col justify-between p-8 lg:p-14 overflow-hidden">
        {/* Background Image with Cinematic Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('/hero_resort.jpg')`,
            backgroundPosition: 'center 40%',
          }}
        />
        
        {/* Multi-layer Dark Gradient & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04120e] via-[#04120e]/70 to-[#04120e]/50" />
        <div className="absolute inset-0 bg-radial-vignette opacity-80" />

        {/* Ambient Gold Glow Orb */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#d4af37]/15 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-serif font-bold text-2xl text-black shadow-2xl border border-[#f3e5ab]/50"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #d4af37 100%)',
              boxShadow: '0 0 30px rgba(201,168,76,0.3)'
            }}
          >
            K
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold tracking-widest text-white leading-none">
              THE KAVERI COLLECTION
            </h2>
            <p className="text-[9px] uppercase tracking-[0.3em] font-semibold text-[#d4af37] mt-1">
              Ultra-Luxury Resorts & Hotels
            </p>
          </div>
        </div>

        {/* Center Banner (Reference Mirror) */}
        <div className="relative z-10 my-auto py-10 max-w-xl">
          {/* Member Exclusive Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/40 backdrop-blur-md mb-6 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f3e5ab]">
              Member Exclusive Offer
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-white leading-[1.1] mb-5 tracking-tight">
            Enjoy up to <span className="gold-text-gradient font-semibold">5,000 Bonus Points</span> per Stay.
          </h1>

          <div className="h-0.5 w-20 bg-gradient-to-r from-[#d4af37] to-transparent mb-5" />

          <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed max-w-lg mb-8 text-shadow-sm">
            Immerse yourself in world-class architecture, private infinity pools, and bespoke luxury hospitality. Click below to enter automatically.
          </p>

          {/* Portal Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Guest Option */}
            <div
              onClick={() => handleInstantLogin('guest', 'guest123', 'guest')}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border group ${
                selectedRoleType === 'guest'
                  ? 'bg-gradient-to-br from-[#d4af37]/20 to-black/80 border-[#d4af37] gold-glow'
                  : 'bg-black/40 border-white/10 hover:border-[#d4af37]/30 hover:bg-black/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Compass className={`w-6 h-6 ${selectedRoleType === 'guest' ? 'text-[#f3e5ab]' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Zap className="w-3 h-3" /> Auto-Open
                </span>
              </div>
              <h3 className="font-serif text-base font-semibold text-white">Guest & Member Portal</h3>
              <p className="text-xs text-slate-400 mt-1">Explore resorts & instant bookings</p>
            </div>

            {/* Staff Option */}
            <div
              onClick={() => handleInstantLogin('admin', 'admin123', 'staff')}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md border group ${
                selectedRoleType === 'staff'
                  ? 'bg-gradient-to-br from-[#d4af37]/20 to-black/80 border-[#d4af37] gold-glow'
                  : 'bg-black/40 border-white/10 hover:border-[#d4af37]/30 hover:bg-black/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Shield className={`w-6 h-6 ${selectedRoleType === 'staff' ? 'text-[#f3e5ab]' : 'text-slate-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Zap className="w-3 h-3" /> Auto-Open
                </span>
              </div>
              <h3 className="font-serif text-base font-semibold text-white">Executive Management</h3>
              <p className="text-xs text-slate-400 mt-1">Analytics, properties & billing</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-widest pt-4 border-t border-white/10">
          <span>The Kaveri Collection &bull; Grand Edition</span>
          <span>&copy; 2026 Kaveri Stays</span>
        </div>
      </div>

      {/* ── RIGHT: Sleek Luxury Login Card ── */}
      <div className="lg:w-[42%] flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#04120e] border-l border-[#d4af37]/15 relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-[#d4af37]/10 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fadeInUp">
          <div className="luxury-card rounded-3xl p-8 sm:p-10 border border-[#d4af37]/20 space-y-6">

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f3e5ab] text-black font-serif font-bold text-xl shadow-lg border border-[#f3e5ab]/50">
                K
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-white tracking-wide">
                Welcome to Kaveri
              </h2>
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#d4af37]">
                {selectedRoleType === 'guest' ? 'Guest & VIP Access' : 'Management Gateway'}
              </p>
            </div>

            <div className="gold-divider" />

            {/* Error banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium text-center animate-fadeInUp">
                {error}
              </div>
            )}

            {/* One-Click Instant Access Tiles */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#d4af37] flex items-center justify-between">
                <span>Instant 1-Click Login</span>
                <span className="text-slate-500 font-normal">Auto-authenticates</span>
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: '💎 Guest Member', u: 'guest', p: 'guest123', t: 'guest' },
                  { label: '👑 Executive Admin', u: 'admin', p: 'admin123', t: 'staff' },
                  { label: '📊 General Manager', u: 'manager', p: 'manager123', t: 'staff' },
                  { label: '🛎️ Front Desk Desk', u: 'receptionist', p: 'receptionist123', t: 'staff' },
                ].map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => handleInstantLogin(r.u, r.p, r.t)}
                    disabled={loading}
                    className={`py-3 px-3 rounded-2xl text-xs font-semibold transition-all duration-200 text-left flex items-center justify-between border ${
                    username === r.u
                      ? 'bg-gradient-to-r from-[#d4af37]/20 to-[#f3e5ab]/10 border-[#d4af37] text-[#f3e5ab] shadow-md'
                      : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.07] border-white/5'
                  }`}
                >
                  <span>{r.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                </button>
              ))}
              </div>
            </div>

            <div className="gold-divider" />

            {/* Manual Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  User Identification
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="luxury-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="luxury-input pl-10"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-4 rounded-xl flex items-center justify-center gap-2 mt-4 text-xs font-bold shadow-xl"
              >
                <span>{loading ? 'Opening Portal…' : 'Enter Dashboard & Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};
