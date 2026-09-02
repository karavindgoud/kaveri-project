import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2, MapPin, Star, Calendar, Bed, ArrowRight,
  CheckCircle2, AlertCircle, Search, Sparkles, Award,
  Wifi, Coffee, ShieldCheck, HeartHandshake, Eye, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PROPERTIES, DEFAULT_ROOMS, getPropertyImage } from '../services/propertyData';

export const GuestPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProp, setSelectedProp] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookingData, setBookingData] = useState({
    room_id: '',
    check_in: new Date().toISOString().split('T')[0],
    check_out: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    guest_count: 2
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProperties();
  }, [searchTerm]);

  const cleanProps = (list) => {
    return (list || []).filter(p => {
      const n = (p.name || '').toLowerCase();
      const c = (p.city || '').toLowerCase();
      return !n.includes('palace') && !n.includes('grand heritage') && !c.includes('udaipur') && !c.includes('mysore');
    });
  };

  const fetchProperties = async () => {
    try {
      const params = {};
      if (searchTerm) params.city = searchTerm;
      const res = await API.get('/properties', { params });
      if (res.data && res.data.length > 0) {
        const filtered = cleanProps(res.data);
        setProperties(filtered.length > 0 ? filtered : DEFAULT_PROPERTIES);
      } else {
        const stored = JSON.parse(localStorage.getItem('kaveri_custom_properties') || '[]');
        const allProps = cleanProps([...DEFAULT_PROPERTIES, ...stored]);
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          setProperties(allProps.filter(p => p.name.toLowerCase().includes(s) || p.city.toLowerCase().includes(s)));
        } else {
          setProperties(allProps);
        }
      }
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_properties') || '[]');
      const allProps = cleanProps([...DEFAULT_PROPERTIES, ...stored]);
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        setProperties(allProps.filter(p => p.name.toLowerCase().includes(s) || p.city.toLowerCase().includes(s)));
      } else {
        setProperties(allProps);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = async (prop) => {
    setSelectedProp(prop);
    setBookingSuccess(false);
    setError('');
    try {
      const res = await API.get('/rooms', { params: { property_id: prop.property_id } });
      if (res.data && res.data.length > 0) {
        setRooms(res.data);
        setBookingData(prev => ({ ...prev, room_id: res.data[0].room_id }));
      } else {
        const fallback = DEFAULT_ROOMS.filter(r => r.property_id === prop.property_id);
        const activeRooms = fallback.length > 0 ? fallback : [
          { room_id: 901, room_number: '101', room_type_name: 'Presidential Infinity Suite', max_occupancy: 4 },
          { room_id: 902, room_number: '102', room_type_name: 'Royal Panorama Chalet', max_occupancy: 2 }
        ];
        setRooms(activeRooms);
        setBookingData(prev => ({ ...prev, room_id: activeRooms[0].room_id }));
      }
    } catch (err) {
      const fallback = DEFAULT_ROOMS.filter(r => r.property_id === prop.property_id);
      const activeRooms = fallback.length > 0 ? fallback : [
        { room_id: 901, room_number: '101', room_type_name: 'Presidential Infinity Suite', max_occupancy: 4 },
        { room_id: 902, room_number: '102', room_type_name: 'Royal Panorama Chalet', max_occupancy: 2 }
      ];
      setRooms(activeRooms);
      setBookingData(prev => ({ ...prev, room_id: activeRooms[0].room_id }));
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const guestId = user?.guest_id || 1;
      await API.post('/bookings', {
        guest_id: guestId,
        room_id: parseInt(bookingData.room_id),
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        guest_count: parseInt(bookingData.guest_count),
        status: 'confirmed'
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setSelectedProp(null);
        navigate('/bookings');
      }, 1500);
    } catch (err) {
      // Save local booking for instant experience
      const selectedRoom = rooms.find(r => r.room_id == bookingData.room_id) || rooms[0];
      const newBooking = {
        booking_id: Date.now() % 10000,
        guest_name: user?.username || 'Guest Member',
        guest_email: user?.email || 'guest@kaveristays.com',
        property_name: selectedProp?.name,
        room_number: selectedRoom?.room_number || '101',
        room_type_name: selectedRoom?.room_type_name || 'Presidential Villa',
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        nights_count: 2,
        guest_count: parseInt(bookingData.guest_count),
        status: 'confirmed',
        total_paid: 1250.00
      };
      const existing = JSON.parse(localStorage.getItem('kaveri_custom_bookings') || '[]');
      localStorage.setItem('kaveri_custom_bookings', JSON.stringify([newBooking, ...existing]));
      setBookingSuccess(true);
      setTimeout(() => {
        setSelectedProp(null);
        navigate('/bookings');
      }, 1500);
    }
  };

  return (
    <div className="space-y-12">

      {/* ── CINEMATIC HERO BANNER ── */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#d4af37]/30 min-h-[480px] flex flex-col justify-end p-8 sm:p-12 lg:p-16"
        style={{
          backgroundImage: `url('/hero_resort.jpg')`,
          backgroundPosition: 'center 45%',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#04120e] via-[#04120e]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#04120e]/80 via-transparent to-black/40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/50 backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f3e5ab]">
              Member Exclusive Offer
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium text-white leading-[1.1] tracking-tight">
            Enjoy up to <span className="gold-text-gradient font-bold">5,000 Bonus Points</span> per Stay.
          </h1>

          <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed max-w-2xl text-shadow">
            Experience the natural grandeur of Coorg's misty rainforest riverbeds, Ooty's cloud-kissed hilltops, and Alleppey's serene palm-fringed backwaters.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {[
              'Kaveri Riverside (Coorg)',
              'Kaveri Hilltop (Ooty)',
              'Kaveri Backwaters (Alleppey)',
              '24/7 Butler Concierge',
            ].map((perk) => (
              <span
                key={perk}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#f3e5ab] border border-[#d4af37]/30 flex items-center gap-1.5"
              >
                <Check className="w-3 h-3 text-[#d4af37]" />
                {perk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESTINATION SEARCH & COLLECTION HEADER ── */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#d4af37]/15 pb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#d4af37] mb-1">
              Signature Sanctuaries
            </p>
            <h2 className="font-serif text-3xl font-medium text-white">
              The Kaveri Collection
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select your luxury destination in Coorg, Ooty, Alleppey, or upcoming estates.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Coorg, Ooty, Alleppey…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="luxury-input pl-10"
            />
          </div>
        </div>

        {/* ── PROPERTY CARDS GRID ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-t-[#d4af37] border-white/10 animate-spin" />
            <p className="text-xs uppercase tracking-widest font-semibold text-[#d4af37]/70">
              Loading signature resorts…
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((p, idx) => {
              const photoUrl = p.image || getPropertyImage(p.name, p.city);
              return (
                <div
                  key={p.property_id || idx}
                  className="luxury-card rounded-3xl overflow-hidden flex flex-col group animate-fadeInUp border border-[#d4af37]/20"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                    <img
                      src={photoUrl}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = '/hero_resort.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04120e] via-transparent to-black/30" />

                    <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/40 text-xs font-bold text-[#f3e5ab]">
                      <Star className="w-3.5 h-3.5 fill-[#d4af37] text-[#d4af37]" />
                      <span>{p.stars || 5} Stars</span>
                    </div>

                    <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-white/90 font-medium px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span className="font-semibold">{p.city}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-white group-hover:text-[#f3e5ab] transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {p.description || `Signature 5-star luxury sanctuary in ${p.city} with private infinity pool and bespoke hospitality.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 py-2 border-t border-b border-white/5 text-slate-400 text-xs">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{p.total_rooms || 14} Suites</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wifi className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>High-Speed WiFi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coffee className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Dining</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(p)}
                      className="btn-gold w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold"
                    >
                      <span>Reserve Experience in {p.city}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── LUXURY RESERVATION MODAL ── */}
      {selectedProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div
            className="luxury-card rounded-3xl w-full max-w-xl shadow-2xl border border-[#d4af37]/30 animate-fadeInUp overflow-hidden"
            style={{ maxHeight: '92vh', overflowY: 'auto' }}
          >
            <div className="relative p-6 sm:p-8 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#141620] to-[#04120e]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab] mb-2">
                    <Sparkles className="w-3 h-3 text-[#d4af37]" />
                    VIP Suite Reservation
                  </div>
                  <h3 className="font-serif text-2xl font-medium text-white">{selectedProp.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#d4af37]" />
                    <span>{selectedProp.city} &bull; 5-Star Luxury Sanctuary</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProp(null)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-lg transition-colors border border-white/10"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {bookingSuccess ? (
                <div className="text-center py-10 space-y-4 animate-fadeInUp">
                  <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center mx-auto gold-glow">
                    <CheckCircle2 className="w-9 h-9 text-[#f3e5ab]" />
                  </div>
                  <h4 className="font-serif text-2xl font-medium text-white">Reservation Confirmed</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Your luxury stay at {selectedProp.name} ({selectedProp.city}) has been secured. Redirecting to your reservations…
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmBooking} className="space-y-5">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                      Select Suite / Room
                    </label>
                    <select
                      required
                      value={bookingData.room_id}
                      onChange={(e) => setBookingData({ ...bookingData, room_id: e.target.value })}
                      className="luxury-input"
                    >
                      {rooms.map(r => (
                        <option key={r.room_id} value={r.room_id} style={{ background: '#0e1017' }}>
                          Suite #{r.room_number} &bull; {r.room_type_name} (Max {r.max_occupancy} Guests)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingData.check_in}
                        onChange={(e) => setBookingData({ ...bookingData, check_in: e.target.value })}
                        className="luxury-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingData.check_out}
                        onChange={(e) => setBookingData({ ...bookingData, check_out: e.target.value })}
                        className="luxury-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={bookingData.guest_count}
                      onChange={(e) => setBookingData({ ...bookingData, guest_count: e.target.value })}
                      className="luxury-input"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#d4af37]/5 border border-[#d4af37]/20 flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#d4af37] shrink-0" />
                    <p className="text-xs text-[#f3e5ab]">
                      Your member stay qualifies for <strong className="text-white">+5,000 Bonus Points</strong> and complimentary late check-out.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProp(null)}
                      className="flex-1 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-gold flex-1 py-3 rounded-xl text-xs font-bold"
                    >
                      Confirm Stay
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
