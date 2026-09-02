import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck, Plus, Search, Filter, AlertCircle,
  CheckCircle2, User, Bed, Building2, Sparkles, Clock, ArrowRight
} from 'lucide-react';
import { DEFAULT_PROPERTIES, DEFAULT_ROOMS } from '../services/propertyData';

const DEFAULT_BOOKINGS_LIST = [
  { booking_id: 1, guest_name: 'Aarav Sharma', guest_email: 'aarav.sharma@example.com', property_name: 'Kaveri Riverside', room_number: '101', room_type_name: 'Deluxe', check_in: '2025-01-12', check_out: '2025-01-15', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 13500.00 },
  { booking_id: 2, guest_name: 'Aarav Sharma', guest_email: 'aarav.sharma@example.com', property_name: 'Kaveri Riverside', room_number: '102', room_type_name: 'Deluxe', check_in: '2025-02-14', check_out: '2025-02-17', nights_count: 3, guest_count: 4, status: 'confirmed', total_paid: 27000.00 },
  { booking_id: 3, guest_name: 'Anita Desai', guest_email: 'anita.desai@example.com', property_name: 'Kaveri Hilltop', room_number: '201', room_type_name: 'Suite', check_in: '2025-02-03', check_out: '2025-02-06', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 24600.00 },
  { booking_id: 4, guest_name: 'Anita Desai', guest_email: 'anita.desai@example.com', property_name: 'Kaveri Hilltop', room_number: '201', room_type_name: 'Suite', check_in: '2025-03-09', check_out: '2025-03-12', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 24600.00 },
  { booking_id: 5, guest_name: 'Ben Carter', guest_email: 'ben.carter@example.org', property_name: 'Kaveri Riverside', room_number: '104', room_type_name: 'Standard', check_in: '2025-03-20', check_out: '2025-03-22', nights_count: 2, guest_count: 1, status: 'confirmed', total_paid: 6400.00 },
  { booking_id: 6, guest_name: 'Chloe Dubois', guest_email: 'chloe.dubois@example.com', property_name: 'Kaveri Backwater', room_number: '301', room_type_name: 'Deluxe', check_in: '2025-04-05', check_out: '2025-04-09', nights_count: 4, guest_count: 3, status: 'confirmed', total_paid: 40800.00 },
  { booking_id: 7, guest_name: 'Daniel Fischer', guest_email: 'daniel.fischer@example.de', property_name: 'Kaveri Hilltop', room_number: '202', room_type_name: 'Deluxe', check_in: '2025-04-18', check_out: '2025-04-21', nights_count: 3, guest_count: 2, status: 'cancelled', total_paid: 20400.00 },
  { booking_id: 8, guest_name: 'Daniel Fischer', guest_email: 'daniel.fischer@example.de', property_name: 'Kaveri Hilltop', room_number: '203', room_type_name: 'Deluxe', check_in: '2025-05-02', check_out: '2025-05-05', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 20400.00 },
  { booking_id: 9, guest_name: 'Elena Rossi', guest_email: 'elena.rossi@example.com', property_name: 'Kaveri Backwater', room_number: '303', room_type_name: 'Suite', check_in: '2025-05-19', check_out: '2025-05-23', nights_count: 4, guest_count: 2, status: 'confirmed', total_paid: 38000.00 },
  { booking_id: 10, guest_name: 'Farhan Ali', guest_email: 'farhan.ali@example.com', property_name: 'Kaveri Riverside', room_number: '101', room_type_name: 'Deluxe', check_in: '2025-06-01', check_out: '2025-06-04', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 13500.00 },
  { booking_id: 11, guest_name: 'Grace Okafor', guest_email: 'grace.okafor@example.com', property_name: 'Kaveri Hilltop', room_number: '204', room_type_name: 'Standard', check_in: '2025-06-15', check_out: '2025-06-18', nights_count: 3, guest_count: 1, status: 'no_show', total_paid: 16200.00 },
  { booking_id: 12, guest_name: 'Hiroshi Tanaka', guest_email: 'hiroshi.tanaka@example.jp', property_name: 'Kaveri Backwater', room_number: '301', room_type_name: 'Deluxe', check_in: '2025-07-08', check_out: '2025-07-13', nights_count: 5, guest_count: 2, status: 'confirmed', total_paid: 25500.00 },
  { booking_id: 13, guest_name: 'Hiroshi Tanaka', guest_email: 'hiroshi.tanaka@example.jp', property_name: 'Kaveri Riverside', room_number: '105', room_type_name: 'Suite', check_in: '2025-08-22', check_out: '2025-08-25', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 23700.00 },
  { booking_id: 14, guest_name: 'Isabel Moreno', guest_email: 'isabel.moreno@example.com', property_name: 'Kaveri Hilltop', room_number: '201', room_type_name: 'Suite', check_in: '2025-09-01', check_out: '2025-09-05', nights_count: 4, guest_count: 3, status: 'confirmed', total_paid: 32800.00 },
  { booking_id: 15, guest_name: 'Jonas Weber', guest_email: 'jonas.weber@example.de', property_name: 'Kaveri Backwater', room_number: '304', room_type_name: 'Standard', check_in: '2025-09-14', check_out: '2025-09-16', nights_count: 2, guest_count: 1, status: 'cancelled', total_paid: 7800.00 },
  { booking_id: 16, guest_name: 'Kavya Nair', guest_email: 'kavya.nair@example.com', property_name: 'Kaveri Backwater', room_number: '302', room_type_name: 'Deluxe', check_in: '2025-10-02', check_out: '2025-10-06', nights_count: 4, guest_count: 2, status: 'confirmed', total_paid: 20400.00 },
  { booking_id: 17, guest_name: 'Kavya Nair', guest_email: 'kavya.nair@example.com', property_name: 'Kaveri Riverside', room_number: '102', room_type_name: 'Deluxe', check_in: '2025-11-11', check_out: '2025-11-14', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 13500.00 },
  { booking_id: 18, guest_name: "Liam O'Brien", guest_email: 'liam.obrien@example.ie', property_name: 'Kaveri Hilltop', room_number: '205', room_type_name: 'Deluxe', check_in: '2025-11-28', check_out: '2025-12-02', nights_count: 4, guest_count: 2, status: 'confirmed', total_paid: 27200.00 },
  { booking_id: 19, guest_name: 'Maya Krishnan', guest_email: 'maya.k@example.com', property_name: 'Kaveri Riverside', room_number: '103', room_type_name: 'Standard', check_in: '2025-12-20', check_out: '2025-12-27', nights_count: 7, guest_count: 4, status: 'confirmed', total_paid: 44800.00 },
  { booking_id: 20, guest_name: 'Noah Bergman', guest_email: 'noah.bergman@example.se', property_name: 'Kaveri Backwater', room_number: '303', room_type_name: 'Suite', check_in: '2025-12-24', check_out: '2025-12-29', nights_count: 5, guest_count: 2, status: 'confirmed', total_paid: 60000.00 },
  { booking_id: 21, guest_name: 'Aarav Sharma', guest_email: 'aarav.sharma@example.com', property_name: 'Kaveri Hilltop', room_number: '202', room_type_name: 'Deluxe', check_in: '2026-01-05', check_out: '2026-01-08', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 20400.00 },
  { booking_id: 22, guest_name: 'Priya Menon', guest_email: 'priya.menon@example.com', property_name: 'Kaveri Backwater', room_number: '301', room_type_name: 'Deluxe', check_in: '2026-01-19', check_out: '2026-01-22', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 15300.00 },
  { booking_id: 23, guest_name: 'Ben Carter', guest_email: 'ben.carter@example.org', property_name: 'Kaveri Backwater', room_number: '304', room_type_name: 'Standard', check_in: '2026-02-14', check_out: '2026-02-17', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 11700.00 },
  { booking_id: 24, guest_name: 'Sofia Ahmed', guest_email: 'sofia.ahmed@example.com', property_name: 'Kaveri Hilltop', room_number: '203', room_type_name: 'Deluxe', check_in: '2026-02-20', check_out: '2026-02-23', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 20400.00 },
  { booking_id: 25, guest_name: 'Elena Rossi', guest_email: 'elena.rossi@example.com', property_name: 'Kaveri Riverside', room_number: '105', room_type_name: 'Suite', check_in: '2026-03-01', check_out: '2026-03-05', nights_count: 4, guest_count: 2, status: 'confirmed', total_paid: 31600.00 },
  { booking_id: 26, guest_name: 'Tom Nguyen', guest_email: 'tom.nguyen@example.com', property_name: 'Kaveri Riverside', room_number: '101', room_type_name: 'Deluxe', check_in: '2026-03-10', check_out: '2026-03-13', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 13500.00 },
  { booking_id: 27, guest_name: 'Grace Okafor', guest_email: 'grace.okafor@example.com', property_name: 'Kaveri Backwater', room_number: '302', room_type_name: 'Deluxe', check_in: '2026-04-02', check_out: '2026-04-05', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 15300.00 },
  { booking_id: 28, guest_name: 'Yusuf Demir', guest_email: 'yusuf.demir@example.com', property_name: 'Kaveri Hilltop', room_number: '204', room_type_name: 'Standard', check_in: '2026-04-15', check_out: '2026-04-17', nights_count: 2, guest_count: 1, status: 'confirmed', total_paid: 10800.00 },
  { booking_id: 29, guest_name: 'Maya Krishnan', guest_email: 'maya.k@example.com', property_name: 'Kaveri Backwater', room_number: '303', room_type_name: 'Suite', check_in: '2026-05-01', check_out: '2026-05-04', nights_count: 3, guest_count: 2, status: 'confirmed', total_paid: 28500.00 },
  { booking_id: 30, guest_name: "Liam O'Brien", guest_email: 'liam.obrien@example.ie', property_name: 'Kaveri Riverside', room_number: '102', room_type_name: 'Deluxe', check_in: '2026-05-20', check_out: '2026-05-24', nights_count: 4, guest_count: 2, status: 'confirmed', total_paid: 18000.00 },
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
  }, [statusFilter, user]);

  const fetchBookings = async () => {
    try {
      const params = {};
      if (statusFilter) params.status_filter = statusFilter;
      const res = await API.get('/bookings', { params });
      if (res.data && res.data.length > 0) {
        setBookings(res.data);
      } else {
        const stored = JSON.parse(localStorage.getItem('kaveri_custom_bookings') || '[]');
        let combined = [...stored, ...DEFAULT_BOOKINGS_LIST];
        if (isGuest) {
          if (user?.email) {
            combined = combined.filter(b => b.guest_email?.toLowerCase() === user.email.toLowerCase() || b.guest_name?.toLowerCase() === user.username?.toLowerCase());
          }
        }
        if (statusFilter) {
          setBookings(combined.filter(b => b.status === statusFilter));
        } else {
          setBookings(combined);
        }
      }
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_bookings') || '[]');
      let combined = [...stored, ...DEFAULT_BOOKINGS_LIST];
      if (isGuest) {
        if (user?.email) {
          combined = combined.filter(b => b.guest_email?.toLowerCase() === user.email.toLowerCase() || b.guest_name?.toLowerCase() === user.username?.toLowerCase());
        }
      }
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
      { room_id: 101, room_number: '101', room_type_name: 'Deluxe', max_occupancy: 2 }
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
          { guest_id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com' },
          { guest_id: 2, name: 'Anita Desai', email: 'anita.desai@example.com' },
          { guest_id: 3, name: 'Ben Carter', email: 'ben.carter@example.org' },
          { guest_id: 4, name: 'Chloe Dubois', email: 'chloe.dubois@example.com' },
        ]);
      }
    } catch {
      setGuests([
        { guest_id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com' },
        { guest_id: 2, name: 'Anita Desai', email: 'anita.desai@example.com' },
        { guest_id: 3, name: 'Ben Carter', email: 'ben.carter@example.org' },
        { guest_id: 4, name: 'Chloe Dubois', email: 'chloe.dubois@example.com' },
      ]);
    }
  };

  const loadRoomsForProperty = (propId) => {
    const numericId = parseInt(propId);
    const matching = DEFAULT_ROOMS.filter(r => r.property_id === numericId);
    const available = matching.length > 0 ? matching : [
      { room_id: numericId * 100 + 1, room_number: `${numericId}01`, room_type_name: 'Deluxe', max_occupancy: 2 },
      { room_id: numericId * 100 + 2, room_number: `${numericId}02`, room_type_name: 'Suite', max_occupancy: 4 }
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
    const selectedGuest = guests.find(g => String(g.guest_id) === String(form.guest_id)) || { name: user?.username || 'Aarav Sharma', email: 'aarav.sharma@example.com' };

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
        total_paid: 13500.00
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
      case 'no_show':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-semibold">No Show</span>;
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
              ? 'Review your upcoming stays at Kaveri Riverside, Kaveri Hilltop, and Kaveri Backwater'
              : 'Live room assignments, guest arrivals, and reservation status tracking across 30 records'}
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
          <option value="">All Reservation Statuses (30 Stays)</option>
          <option value="confirmed" style={{ background: '#0e1017' }}>Confirmed Stays</option>
          <option value="checked_in" style={{ background: '#0e1017' }}>Currently In Residence</option>
          <option value="checked_out" style={{ background: '#0e1017' }}>Departed / Checked Out</option>
          <option value="cancelled" style={{ background: '#0e1017' }}>Cancelled Bookings</option>
          <option value="no_show" style={{ background: '#0e1017' }}>No Show Bookings</option>
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
                        ₹{parseFloat(b.total_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
