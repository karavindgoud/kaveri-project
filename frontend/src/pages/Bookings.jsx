import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck, Plus, Search, Filter, AlertCircle,
  CheckCircle2, User, Bed, Building2, Sparkles, Clock, ArrowRight
} from 'lucide-react';
import { DEFAULT_PROPERTIES, DEFAULT_ROOMS } from '../services/propertyData';

const DEFAULT_BOOKINGS_LIST = [
  {
    booking_id: 1001,
    guest_name: 'Lord Henry Sterling',
    guest_email: 'henry.sterling@luxury.co',
    property_name: 'Kaveri Riverside',
    room_number: '101',
    room_type_name: 'Presidential Infinity Villa',
    check_in: '2026-09-05',
    check_out: '2026-09-09',
    nights_count: 4,
    guest_count: 2,
    status: 'confirmed',
    total_paid: 2600.00
  },
  {
    booking_id: 1002,
    guest_name: 'Lady Eleanor Vance',
    guest_email: 'eleanor.vance@elegance.org',
    property_name: 'Kaveri Hilltop',
    room_number: '201',
    room_type_name: 'Royal Hilltop Penthouse',
    check_in: '2026-09-01',
    check_out: '2026-09-04',
    nights_count: 3,
    guest_count: 2,
    status: 'checked_in',
    total_paid: 2160.00
  },
  {
    booking_id: 1003,
    guest_name: 'Dr. Siddharth Menon',
    guest_email: 'siddharth.menon@heritage.in',
    property_name: 'Kaveri Backwaters',
    room_number: '301',
    room_type_name: 'Lagoon Water Villa',
    check_in: '2026-08-28',
    check_out: '2026-08-31',
    nights_count: 3,
    guest_count: 4,
    status: 'confirmed',
    total_paid: 2040.00
  }
];

export const Bookings = () => {
  const { user } = useAuth();
  const isGuest = user?.role === 'Guest';
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);

  const [form, setForm] = useState({
    property_id: '1',
    room_id: '101',
    guest_id: isGuest ? (user?.guest_id || 1) : '1',
    check_in: new Date().toISOString().split('T')[0],
    check_out: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    guest_count: 2,
    status: 'confirmed'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = {};
      if (statusFilter) params.status_filter = statusFilter;
      const res = await API.get('/bookings', { params });
      if (res.data && res.data.length > 0) {
        setBookings(res.data);
      } else {
        const stored = JSON.parse(localStorage.getItem('kaveri_custom_bookings') || '[]');
        const combined = [...stored, ...DEFAULT_BOOKINGS_LIST];
        if (statusFilter) {
          setBookings(combined.filter(b => b.status === statusFilter));
        } else {
          setBookings(combined);
        }
      }
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_bookings') || '[]');
      const combined = [...stored, ...DEFAULT_BOOKINGS_LIST];
      if (statusFilter) {
        setBookings(combined.filter(b => b.status === statusFilter));
      } else {
        setBookings(combined);
      }
    } finally {
      setLoading(false);
    }
  };

  const openWizard = async () => {
    setShowWizard(true);
    setStep(1);
    setError('');
    
    // Load properties
    const storedProps = JSON.parse(localStorage.getItem('kaveri_custom_properties') || '[]');
    const allProps = [...DEFAULT_PROPERTIES, ...storedProps];
    setProperties(allProps);

    // Initial default property & room
    const defaultProp = allProps[0];
    const matchingRooms = DEFAULT_ROOMS.filter(r => r.property_id === defaultProp.property_id);
    setRooms(matchingRooms.length > 0 ? matchingRooms : [
      { room_id: 101, room_number: '101', room_type_name: 'Presidential Infinity Suite', max_occupancy: 4 }
    ]);
    
    setForm(prev => ({
      ...prev,
      property_id: String(defaultProp.property_id),
      room_id: String(matchingRooms[0]?.room_id || 101),
      guest_id: isGuest ? (user?.guest_id || 1) : '1'
    }));

    // Load guests
    try {
      const guestRes = await API.get('/guests');
      if (guestRes.data && guestRes.data.length > 0) {
        setGuests(guestRes.data);
      } else {
        setGuests([
          { guest_id: 1, name: user?.username || 'Guest Member', email: user?.email || 'guest@kaveristays.com' },
          { guest_id: 2, name: 'Lord Henry Sterling', email: 'henry.sterling@luxury.co' },
          { guest_id: 3, name: 'Lady Eleanor Vance', email: 'eleanor.vance@elegance.org' },
          { guest_id: 4, name: 'Dr. Siddharth Menon', email: 'siddharth.menon@heritage.in' },
        ]);
      }
    } catch {
      setGuests([
        { guest_id: 1, name: user?.username || 'Guest Member', email: user?.email || 'guest@kaveristays.com' },
        { guest_id: 2, name: 'Lord Henry Sterling', email: 'henry.sterling@luxury.co' },
        { guest_id: 3, name: 'Lady Eleanor Vance', email: 'eleanor.vance@elegance.org' },
        { guest_id: 4, name: 'Dr. Siddharth Menon', email: 'siddharth.menon@heritage.in' },
      ]);
    }
  };

  const loadRoomsForProperty = (propId) => {
    const numericId = parseInt(propId);
    const matching = DEFAULT_ROOMS.filter(r => r.property_id === numericId);
    const available = matching.length > 0 ? matching : [
      { room_id: numericId * 100 + 1, room_number: `${numericId}01`, room_type_name: 'Presidential Infinity Suite', max_occupancy: 4 },
      { room_id: numericId * 100 + 2, room_number: `${numericId}02`, room_type_name: 'Royal Panorama Suite', max_occupancy: 2 }
    ];
    setRooms(available);
    setForm(prev => ({
      ...prev,
      property_id: propId,
      room_id: String(available[0].room_id)
    }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError('');
    
    const selectedProp = properties.find(p => String(p.property_id) === String(form.property_id)) || properties[0];
    const selectedRoom = rooms.find(r => String(r.room_id) === String(form.room_id)) || rooms[0];
    const selectedGuest = guests.find(g => String(g.guest_id) === String(form.guest_id)) || { name: user?.username || 'Guest Member', email: 'guest@kaveristays.com' };

    try {
      await API.post('/bookings', {
        guest_id: parseInt(form.guest_id),
        room_id: parseInt(form.room_id),
        check_in: form.check_in,
        check_out: form.check_out,
        guest_count: parseInt(form.guest_count),
        status: form.status
      });
      setShowWizard(false);
      fetchBookings();
    } catch (err) {
      // Local fallback
      const newBooking = {
        booking_id: Date.now() % 10000,
        guest_name: selectedGuest.name,
        guest_email: selectedGuest.email,
        property_name: selectedProp.name,
        room_number: selectedRoom.room_number,
        room_type_name: selectedRoom.room_type_name,
        check_in: form.check_in,
        check_out: form.check_out,
        nights_count: 2,
        guest_count: parseInt(form.guest_count),
        status: form.status,
        total_paid: 1300.00
      };
      const existing = JSON.parse(localStorage.getItem('kaveri_custom_bookings') || '[]');
      localStorage.setItem('kaveri_custom_bookings', JSON.stringify([newBooking, ...existing]));
      setShowWizard(false);
      fetchBookings();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge-gold text-[10px]">Confirmed Stay</span>;
      case 'checked_in':
        return <span className="badge-emerald text-[10px]">In Residence</span>;
      case 'checked_out':
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold">Departed</span>;
      case 'cancelled':
        return <span className="badge-rose text-[10px]">Cancelled</span>;
      default:
        return <span className="badge-sky text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4af37]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab] mb-2">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            {isGuest ? 'Personal Itinerary' : 'Hotelier Ledger'}
          </div>
          <h1 className="font-serif text-3xl font-medium text-white tracking-tight">
            {isGuest ? 'My Luxury Reservations' : 'Reservations & Stays Ledger'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isGuest
              ? 'Review your upcoming stays at Kaveri Riverside, Kaveri Hilltop, and Kaveri Backwaters'
              : 'Live room assignments, guest arrivals, and reservation status tracking'}
          </p>
        </div>
        <button
          onClick={openWizard}
          className="btn-gold px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-bold self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-4 border border-[#d4af37]/15">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="luxury-input min-w-[200px] w-auto"
        >
          <option value="">All Reservation Statuses</option>
          <option value="confirmed" style={{ background: '#0e1017' }}>Confirmed Stays</option>
          <option value="checked_in" style={{ background: '#0e1017' }}>Currently In Residence</option>
          <option value="checked_out" style={{ background: '#0e1017' }}>Departed / Checked Out</option>
          <option value="cancelled" style={{ background: '#0e1017' }}>Cancelled Bookings</option>
        </select>
      </div>

      {/* Bookings Ledger */}
      {loading ? (
        <div className="flex justify-center p-16">
          <div className="w-10 h-10 rounded-full border-2 border-t-[#d4af37] border-white/10 animate-spin" />
        </div>
      ) : (
        <div className="luxury-card rounded-3xl overflow-hidden border border-[#d4af37]/20 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0b0d13] text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] border-b border-[#d4af37]/15">
                <tr>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Property & Suite</th>
                  <th className="px-6 py-4">Stay Itinerary</th>
                  <th className="px-6 py-4">Guests</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                      No reservations found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.booking_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-[#d4af37] font-semibold">
                        #{b.booking_id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-serif font-bold text-white text-base leading-tight">{b.guest_name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{b.guest_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-100">{b.property_name}</div>
                        <div className="text-xs text-[#f3e5ab] mt-0.5">
                          Suite #{b.room_number} &bull; {b.room_type_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{b.check_in} &rarr; {b.check_out}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 pl-5">
                          {b.nights_count} nights stay
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">
                        {b.guest_count} Guests
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-[#f3e5ab] text-base">
                        ₹{b.total_paid?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LUXURY WIZARD MODAL ── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="luxury-card rounded-3xl w-full max-w-xl p-8 border border-[#d4af37]/30 space-y-6 animate-fadeInUp shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-medium text-white">Create New Reservation</h3>
                <p className="text-xs text-slate-400">Step {step} of 3</p>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="space-y-5">
              {/* STEP 1: Property & Dates */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                      1. Select Destination Resort
                    </label>
                    <select
                      required
                      value={form.property_id}
                      onChange={(e) => loadRoomsForProperty(e.target.value)}
                      className="luxury-input"
                    >
                      {properties.map(p => (
                        <option key={p.property_id} value={p.property_id} style={{ background: '#0e1017' }}>
                          {p.name} ({p.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        required
                        value={form.check_in}
                        onChange={(e) => setForm({ ...form, check_in: e.target.value })}
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
                        value={form.check_out}
                        onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                        className="luxury-input"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-gold px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-bold"
                    >
                      <span>Proceed to Suite Selection</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Suite Selection & Occupancy */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                      2. Select Luxury Suite
                    </label>
                    <select
                      required
                      value={form.room_id}
                      onChange={(e) => setForm({ ...form, room_id: e.target.value })}
                      className="luxury-input"
                    >
                      {rooms.map(r => (
                        <option key={r.room_id} value={r.room_id} style={{ background: '#0e1017' }}>
                          Suite #{r.room_number} &bull; {r.room_type_name} (Max {r.max_occupancy} Guests)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                      Guest Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={form.guest_count}
                      onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
                      className="luxury-input"
                    />
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-400 bg-white/5 border border-white/10"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="btn-gold px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-bold"
                    >
                      <span>Next: Guest Credentials</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Guest Selection & Finalize */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                      3. Assign VIP Guest Profile
                    </label>
                    <select
                      required
                      value={form.guest_id}
                      onChange={(e) => setForm({ ...form, guest_id: e.target.value })}
                      className="luxury-input"
                    >
                      {guests.map(g => (
                        <option key={g.guest_id} value={g.guest_id} style={{ background: '#0e1017' }}>
                          {g.name} &bull; {g.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-400 bg-white/5 border border-white/10"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-gold px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Reservation</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
