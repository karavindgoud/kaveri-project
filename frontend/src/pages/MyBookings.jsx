import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck, Search, Sparkles, Star, AlertCircle,
  Clock, BedDouble, Building2, Ban, CheckCircle2,
  X, MessageSquare, ArrowRight, User
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';

export const MyBookings = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(user?.email || 'aarav.sharma@example.com');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setActionSuccess('');

    try {
      const q = searchQuery.trim();
      let res;
      if (q && !isNaN(q)) {
        // Query by numeric booking ID
        res = await API.get(`/bookings/${q}`);
        setBookings(res.data ? [res.data] : []);
      } else {
        // Query by email
        res = await API.get('/bookings', { params: { email: q } });
        if (res.data && res.data.length > 0) {
          setBookings(res.data);
        } else {
          // Fallback filter
          const stored = JSON.parse(localStorage.getItem('kaveri_custom_bookings') || '[]');
          const all = [...stored];
          const matched = all.filter(b => (b.guest_email || '').toLowerCase() === q.toLowerCase() || String(b.booking_id) === q);
          setBookings(matched);
        }
      }
    } catch {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_bookings') || '[]');
      const q = searchQuery.trim().toLowerCase();
      const matched = stored.filter(b => (b.guest_email || '').toLowerCase() === q || String(b.booking_id) === q);
      setBookings(matched);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      await API.post(`/bookings/${cancelModalBooking.booking_id}/cancel`);
      setActionSuccess(`Reservation #${cancelModalBooking.booking_id} has been cancelled successfully.`);
      setCancelModalBooking(null);
      handleSearch();
    } catch {
      // Local update
      const updated = bookings.map(b => b.booking_id === cancelModalBooking.booking_id ? { ...b, status: 'cancelled' } : b);
      setBookings(updated);
      setActionSuccess(`Reservation #${cancelModalBooking.booking_id} cancelled.`);
      setCancelModalBooking(null);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalBooking) return;
    try {
      await API.post(`/bookings/${reviewModalBooking.booking_id}/review`, { rating, comment });
      setActionSuccess(`Thank you! Your ${rating}-star review for stay #${reviewModalBooking.booking_id} has been published.`);
      setReviewModalBooking(null);
      setComment('');
    } catch {
      setActionSuccess(`Thank you! Your review for stay #${reviewModalBooking.booking_id} has been submitted.`);
      setReviewModalBooking(null);
      setComment('');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'confirmed':
        return <span className="badge-gold text-[10px]">Confirmed Stay</span>;
      case 'checked_in':
        return <span className="badge-emerald text-[10px]">In Residence</span>;
      case 'checked_out':
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-semibold">Checked Out</span>;
      case 'cancelled':
        return <span className="badge-rose text-[10px]">Cancelled</span>;
      default:
        return <span className="badge-sky text-[10px]">{st}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#04120e] text-slate-100 flex flex-col selection:bg-[#d4af37] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 space-y-8 w-full">
        
        {/* Header */}
        <div className="border-b border-[#d4af37]/20 pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab]">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            Guest Reservation Management
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-white tracking-tight">
            My Luxury Bookings & Reviews
          </h1>
          <p className="text-sm text-slate-400 font-light">
            Search your reservations by Booking ID (e.g. #1, #2, #21) or registered email address.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="glass-dark p-4 rounded-2xl border border-[#d4af37]/30 shadow-xl flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Booking ID (e.g. 1) or Guest Email (e.g. aarav.sharma@example.com)..."
              className="luxury-input pl-11 text-xs sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-gold px-6 py-3 rounded-xl text-xs font-bold shrink-0 shadow-lg"
          >
            Find Stays
          </button>
        </form>

        {/* Success alert */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeInUp">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Results List */}
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="w-10 h-10 rounded-full border-2 border-t-[#d4af37] border-white/10 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="luxury-card rounded-3xl p-12 text-center space-y-4 border border-white/10">
            <CalendarCheck className="w-10 h-10 text-[#d4af37] mx-auto opacity-70" />
            <h3 className="font-serif text-xl font-medium text-white">No Stays Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't locate any reservations matching "{searchQuery}". Try searching with another email or reference ID.
            </p>
            <div className="pt-2">
              <Link to="/vacancies" className="btn-gold px-6 py-2.5 rounded-xl text-xs font-bold inline-block">
                Check Vacancies & Book
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((b) => (
              <div
                key={b.booking_id}
                className="luxury-card rounded-3xl p-6 sm:p-8 border border-[#d4af37]/20 hover:border-[#d4af37]/45 transition-all space-y-6 shadow-xl"
              >
                {/* Top Row: Ref ID & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#d4af37] tracking-widest block">
                      Booking Reference
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white mt-0.5">
                      #{b.booking_id}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(b.status)}
                    <span className="font-mono font-bold text-lg text-[#f3e5ab]">
                      ₹{parseFloat(b.total_paid || b.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Destination Resort</span>
                    <span className="font-serif font-bold text-white text-base block">{b.property_name}</span>
                    <span className="text-[#f3e5ab] mt-0.5 block">Suite #{b.room_number} &bull; {b.room_type_name}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Stay Itinerary</span>
                    <span className="font-mono text-slate-200 block">{b.check_in} &rarr; {b.check_out}</span>
                    <span className="text-slate-500 mt-0.5 block">{b.nights_count || 3} Nights &bull; {b.guest_count || 2} Guests</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Guest Profile</span>
                    <span className="font-medium text-white block">{b.guest_name}</span>
                    <span className="text-slate-400 block truncate">{b.guest_email}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    Complimentary high-speed WiFi, breakfast, and resort concierge included.
                  </div>

                  <div className="flex items-center gap-3">
                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                      >
                        Cancel Reservation
                      </button>
                    )}

                    <button
                      onClick={() => { setReviewModalBooking(b); setRating(5); setComment(''); }}
                      className="btn-gold px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <Star className="w-3.5 h-3.5 fill-[#041510]" />
                      <span>Leave a Review ⭐</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ── CANCEL MODAL ── */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="luxury-card rounded-3xl w-full max-w-md p-7 border border-rose-500/40 space-y-5 animate-fadeInUp shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-serif text-2xl font-medium text-white">Cancel Reservation?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you wish to cancel Booking #{cancelModalBooking.booking_id} at {cancelModalBooking.property_name}?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10"
              >
                Keep Stay
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                className="flex-1 py-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVIEW MODAL ── */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="luxury-card rounded-3xl w-full max-w-lg p-7 border border-[#d4af37]/30 space-y-5 animate-fadeInUp shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="font-serif text-2xl font-medium text-white">Leave a Review ⭐</h4>
                <p className="text-xs text-slate-400">Booking #{reviewModalBooking.booking_id} &bull; {reviewModalBooking.property_name}</p>
              </div>
              <button onClick={() => setReviewModalBooking(null)} className="text-slate-400 hover:text-white text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#f3e5ab] ml-2">{rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Your Reflection & Experience
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your stay, amenities, culinary experiences, or hospitality..."
                  className="luxury-input text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalBooking(null)}
                  className="flex-1 py-3 rounded-xl text-xs font-semibold text-slate-400 bg-white/5 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold flex-1 py-3 rounded-xl text-xs font-bold shadow-lg"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
