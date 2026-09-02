import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Star, Plus, MessageSquare, Building2, User, AlertCircle, Sparkles, Quote } from 'lucide-react';

const DEFAULT_REVIEWS = [
  {
    review_id: 1,
    booking_id: 1,
    guest_name: 'Aarav Sharma',
    property_name: 'Kaveri Riverside (Coorg)',
    rating: 5,
    comment: 'Late check-in requested. Exceptional riverside luxury and peaceful serene nature along the Coorg riverbanks.',
    review_date: '2025-01-15'
  },
  {
    review_id: 2,
    booking_id: 2,
    guest_name: 'Aarav Sharma',
    property_name: 'Kaveri Riverside (Coorg)',
    rating: 5,
    comment: 'Anniversary celebration with special flowers arrangement. The hospitality and private pool suite exceeded all expectations.',
    review_date: '2025-02-17'
  },
  {
    review_id: 3,
    booking_id: 3,
    guest_name: 'Anita Desai',
    property_name: 'Kaveri Hilltop (Ooty)',
    rating: 5,
    comment: 'High altitude tranquility with breathtaking panoramic views across Ooty tea estates. Heated infinity pool was magnificent.',
    review_date: '2025-02-06'
  },
  {
    review_id: 4,
    booking_id: 6,
    guest_name: 'Chloe Dubois',
    property_name: 'Kaveri Backwater (Alleppey)',
    rating: 5,
    comment: 'Two rooms, one bill. Picturesque Alleppey backwaters and memorable traditional houseboat dining under the stars.',
    review_date: '2025-04-09'
  },
  {
    review_id: 5,
    booking_id: 21,
    guest_name: 'Aarav Sharma',
    property_name: 'Kaveri Hilltop (Ooty)',
    rating: 5,
    comment: 'Third stay with Kaveri Collection. Consistently unrivaled service, regal comfort, and exquisite culinary craftsmanship.',
    review_date: '2026-01-08'
  },
  {
    review_id: 6,
    booking_id: 25,
    guest_name: 'Elena Rossi',
    property_name: 'Kaveri Riverside (Coorg)',
    rating: 5,
    comment: 'Returning guest and once again thoroughly impressed with the luxury suite and peaceful plantation walks.',
    review_date: '2026-03-05'
  }
];

export const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bookings, setBookings] = useState([]);

  const [newRev, setNewRev] = useState({
    booking_id: '1',
    rating: 5,
    comment: '',
    review_date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await API.get('/reviews');
      if (res.data && res.data.length > 0) {
        setReviews(res.data);
      } else {
        const stored = JSON.parse(localStorage.getItem('kaveri_custom_reviews') || '[]');
        setReviews([...stored, ...DEFAULT_REVIEWS]);
      }
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_reviews') || '[]');
      setReviews([...stored, ...DEFAULT_REVIEWS]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async () => {
    setShowModal(true);
    setError('');
    try {
      const res = await API.get('/bookings');
      if (res.data && res.data.length > 0) {
        setBookings(res.data);
        if (res.data[0]) {
          setNewRev(prev => ({ ...prev, booking_id: String(res.data[0].booking_id) }));
        }
      } else {
        setBookings([
          { booking_id: 1, guest_name: 'Aarav Sharma', property_name: 'Kaveri Riverside (Coorg)' },
          { booking_id: 3, guest_name: 'Anita Desai', property_name: 'Kaveri Hilltop (Ooty)' },
          { booking_id: 6, guest_name: 'Chloe Dubois', property_name: 'Kaveri Backwater (Alleppey)' },
        ]);
      }
    } catch (err) {
      setBookings([
        { booking_id: 1, guest_name: 'Aarav Sharma', property_name: 'Kaveri Riverside (Coorg)' },
        { booking_id: 3, guest_name: 'Anita Desai', property_name: 'Kaveri Hilltop (Ooty)' },
        { booking_id: 6, guest_name: 'Chloe Dubois', property_name: 'Kaveri Backwater (Alleppey)' },
      ]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const targetBooking = bookings.find(b => String(b.booking_id) === String(newRev.booking_id)) || bookings[0];

    const reviewObj = {
      review_id: Date.now() % 10000,
      booking_id: parseInt(newRev.booking_id),
      guest_name: targetBooking?.guest_name || 'VIP Guest',
      property_name: targetBooking?.property_name || 'Kaveri Riverside (Coorg)',
      rating: parseInt(newRev.rating),
      comment: newRev.comment,
      review_date: newRev.review_date
    };

    try {
      await API.post('/reviews', reviewObj);
      setShowModal(false);
      fetchReviews();
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_reviews') || '[]');
      localStorage.setItem('kaveri_custom_reviews', JSON.stringify([reviewObj, ...stored]));
      setShowModal(false);
      fetchReviews();
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-slate-700'}`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4af37]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab] mb-2">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            Guest Experiences & Reviews
          </div>
          <h1 className="font-serif text-3xl font-medium text-white tracking-tight">
            Guest Reviews & Testimonials
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Reflections and ratings from stays at Coorg, Ooty, and Alleppey
          </p>
        </div>
        <button
          onClick={openModal}
          className="btn-gold px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-bold self-start shadow-xl"
          aria-label="Write a review"
        >
          <Plus className="w-4 h-4" />
          <span>Write Review</span>
        </button>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="flex justify-center p-16">
          <div className="w-10 h-10 rounded-full border-2 border-t-[#d4af37] border-white/10 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((r, idx) => (
            <div
              key={r.review_id || idx}
              className="luxury-card rounded-3xl p-7 border border-[#d4af37]/20 space-y-5 shadow-2xl flex flex-col justify-between animate-fadeInUp"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/30 flex items-center justify-center font-serif font-bold text-sm text-[#f3e5ab] flex-shrink-0">
                      {r.guest_name?.[0] || 'G'}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-white text-lg leading-tight">
                        {r.guest_name}
                      </h4>
                      <p className="text-xs text-[#d4af37] mt-0.5">{r.property_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border border-[#d4af37]/30">
                    {renderStars(r.rating || 5)}
                  </div>
                </div>

                <div className="relative p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-200 text-sm leading-relaxed italic">
                  <Quote className="w-5 h-5 text-[#d4af37]/40 mb-1" />
                  "{r.comment || 'A truly exceptional and unforgettable luxury stay.'}"
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
                <span className="font-mono text-[11px] text-[#d4af37]">Reservation #{r.booking_id}</span>
                <span>{r.review_date || 'Recent Stay'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="luxury-card rounded-3xl w-full max-w-md p-8 border border-[#d4af37]/30 space-y-5 animate-fadeInUp shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-4">
              <h3 className="font-serif text-2xl font-medium text-white">Share Your Review</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  Select Completed Stay
                </label>
                <select
                  required
                  value={newRev.booking_id}
                  onChange={(e) => setNewRev({ ...newRev, booking_id: e.target.value })}
                  className="luxury-input"
                >
                  {bookings.map(b => (
                    <option key={b.booking_id} value={b.booking_id} style={{ background: '#0e1017' }}>
                      Booking #{b.booking_id} &bull; {b.property_name} ({b.guest_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  Star Rating Score
                </label>
                <select
                  value={newRev.rating}
                  onChange={(e) => setNewRev({ ...newRev, rating: e.target.value })}
                  className="luxury-input"
                >
                  <option value="5" style={{ background: '#0e1017' }}>5 Stars &bull; Unrivaled Perfection</option>
                  <option value="4" style={{ background: '#0e1017' }}>4 Stars &bull; Highly Commendable</option>
                  <option value="3" style={{ background: '#0e1017' }}>3 Stars &bull; Standard Experience</option>
                  <option value="2" style={{ background: '#0e1017' }}>2 Stars &bull; Below Expectations</option>
                  <option value="1" style={{ background: '#0e1017' }}>1 Star &bull; Unsatisfactory</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  Guest Comments & Reflections
                </label>
                <textarea
                  rows="3"
                  value={newRev.comment}
                  onChange={(e) => setNewRev({ ...newRev, comment: e.target.value })}
                  className="luxury-input"
                  placeholder="Describe your resort experience in Coorg, Ooty, or Alleppey..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl text-xs font-semibold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold flex-1 py-3 rounded-xl text-xs font-bold"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
