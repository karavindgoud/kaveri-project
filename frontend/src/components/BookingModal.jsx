import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, CheckCircle2, AlertCircle, ArrowRight,
  CreditCard, Calendar, User, Phone, Mail, MapPin,
  Building2, BedDouble, ShieldCheck, Printer, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BookingModal = ({ room, property, checkIn, checkOut, guestCount: initialGuests, onClose, onBookingComplete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    guest_name: user?.username || 'Aarav Sharma',
    guest_email: user?.email || 'aarav.sharma@example.com',
    guest_phone: '+91 98765 43210',
    guest_city: 'Bengaluru',
    guest_count: initialGuests || 2,
    check_in: checkIn || new Date().toISOString().split('T')[0],
    check_out: checkOut || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    payment_method: 'credit_card',
    special_requests: ''
  });

  const cInDate = new Date(formData.check_in);
  const cOutDate = new Date(formData.check_out);
  const nights = Math.max(1, Math.round((cOutDate - cInDate) / (1000 * 60 * 60 * 24)));
  const nightlyRate = room?.nightly_rate || (room?.room_type_name === 'Suite' ? 8200 : room?.room_type_name === 'Deluxe' ? 4500 : 3200);
  const totalAmount = nightlyRate * nights;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      guest_id: user?.guest_id || 1,
      guest_name: formData.guest_name,
      guest_email: formData.guest_email,
      guest_phone: formData.guest_phone,
      guest_city: formData.guest_city,
      room_id: room?.room_id || 101,
      check_in: formData.check_in,
      check_out: formData.check_out,
      guest_count: parseInt(formData.guest_count),
      payment_method: formData.payment_method,
      amount: totalAmount,
      status: 'confirmed',
      notes: formData.special_requests
    };

    try {
      const res = await API.post('/bookings', payload);
      const bData = res.data;
      setConfirmedBooking(bData);
      setStep(4);
      if (onBookingComplete) onBookingComplete(bData);
    } catch (err) {
      // Fallback local save if offline
      const mockBooking = {
        booking_id: Math.floor(100 + Math.random() * 900),
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        property_name: property?.name || room?.property_name || 'Kaveri Riverside',
        room_number: room?.room_number || '101',
        room_type_name: room?.type_name || room?.room_type_name || 'Deluxe',
        check_in: formData.check_in,
        check_out: formData.check_out,
        nights_count: nights,
        guest_count: formData.guest_count,
        status: 'confirmed',
        total_paid: totalAmount,
        payment_method: formData.payment_method
      };
      const existing = JSON.parse(localStorage.getItem('kaveri_custom_bookings') || '[]');
      localStorage.setItem('kaveri_custom_bookings', JSON.stringify([mockBooking, ...existing]));
      setConfirmedBooking(mockBooking);
      setStep(4);
      if (onBookingComplete) onBookingComplete(mockBooking);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
      <div className="luxury-card rounded-3xl w-full max-w-xl p-6 sm:p-8 border border-[#d4af37]/30 space-y-6 animate-fadeInUp shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#f3e5ab] text-black font-bold text-sm flex items-center justify-center">
              K
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-white">
                {step === 4 ? 'Reservation Confirmed' : 'Reserve Your Sanctuary'}
              </h3>
              <p className="text-[11px] uppercase tracking-wider text-[#d4af37]">
                {property?.name || room?.property_name} &bull; Suite #{room?.room_number} ({room?.type_name || room?.room_type_name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl p-1 rounded-lg"
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

        {/* ── STEP 1: Stay & Rate Summary ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Destination Property</span>
                <span className="font-serif font-bold text-white text-sm">{property?.name || room?.property_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Suite Assignment</span>
                <span className="font-semibold text-[#f3e5ab]">Suite #{room?.room_number} &bull; {room?.type_name || room?.room_type_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Check-In / Check-Out</span>
                <span className="text-slate-200 font-mono">{formData.check_in} &rarr; {formData.check_out} ({nights} nights)</span>
              </div>
              <div className="gold-divider" />
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-300">Total Stay Valuation</span>
                <span className="font-mono font-bold text-xl text-[#f3e5ab]">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Check-in</label>
                <input
                  type="date"
                  value={formData.check_in}
                  onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                  className="luxury-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Check-out</label>
                <input
                  type="date"
                  value={formData.check_out}
                  onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                  className="luxury-input text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-gold px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <span>Guest Information</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Guest Details ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Full Guest Name</label>
              <input
                type="text"
                required
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                className="luxury-input text-xs"
                placeholder="e.g. Aarav Sharma"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.guest_email}
                  onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                  className="luxury-input text-xs"
                  placeholder="e.g. aarav.sharma@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.guest_phone}
                  onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                  className="luxury-input text-xs"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">City Location</label>
                <input
                  type="text"
                  value={formData.guest_city}
                  onChange={(e) => setFormData({ ...formData, guest_city: e.target.value })}
                  className="luxury-input text-xs"
                  placeholder="Bengaluru"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Total Guests</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.guest_count}
                  onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                  className="luxury-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Special Requests (Optional)</label>
              <textarea
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                className="luxury-input text-xs h-16 resize-none"
                placeholder="e.g. High floor, late check-in, anniversary flowers..."
              />
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-white/5 border border-white/10"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-gold px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <span>Payment & Settlement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Payment & Confirm ── */}
        {step === 3 && (
          <form onSubmit={handleConfirm} className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#0b0d13] border border-[#d4af37]/30 space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#d4af37]">Bill Summary</p>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>{property?.name || room?.property_name} ({nights} Nights)</span>
                <span className="font-mono text-white">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Taxes & Luxury Resort Service</span>
                <span className="font-mono text-emerald-400">Complimentary</span>
              </div>
              <div className="gold-divider" />
              <div className="flex justify-between items-center font-bold">
                <span className="text-white text-sm">Total Payable</span>
                <span className="font-mono text-[#f3e5ab] text-xl">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                Select Settlement Method
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
                  { id: 'upi', label: 'UPI Instant', icon: Sparkles },
                  { id: 'bank_transfer', label: 'Bank Wire', icon: ShieldCheck },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, payment_method: m.id })}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        formData.payment_method === m.id
                          ? 'bg-[#d4af37]/20 border-[#d4af37] text-white'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#d4af37]" />
                      <span className="text-xs font-semibold">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-white/5 border border-white/10"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-gold px-7 py-3.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Securing Suite…' : 'Authorize & Confirm Stay'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 4: Success & Confirmation Receipt ── */}
        {step === 4 && (
          <div className="text-center space-y-5 animate-fadeInUp">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="badge-gold text-[10px]">Confirmed Reservation</span>
              <h4 className="font-serif text-2xl font-bold text-white mt-2">
                Booking Reference #{confirmedBooking?.booking_id || 101}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Your reservation at {confirmedBooking?.property_name || property?.name} is officially confirmed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Guest Name:</span>
                <span className="font-semibold text-white">{confirmedBooking?.guest_name || formData.guest_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Suite Assigned:</span>
                <span className="text-[#f3e5ab]">Suite #{confirmedBooking?.room_number || room?.room_number} &bull; {confirmedBooking?.room_type_name || room?.type_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dates:</span>
                <span className="font-mono text-slate-200">{formData.check_in} &rarr; {formData.check_out}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Paid:</span>
                <span className="font-mono font-bold text-[#f3e5ab]">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => { onClose(); navigate('/my-bookings'); }}
                className="btn-gold flex-1 py-3 rounded-xl text-xs font-bold"
              >
                View in My Bookings
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
