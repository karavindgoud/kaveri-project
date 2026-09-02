import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Sparkles, Calendar, MapPin, Star, ArrowRight,
  Shield, BedDouble, Users, Coffee, Wifi,
  CheckCircle2, ChevronRight, Eye, HeartHandshake,
  Compass, Award
} from 'lucide-react';
import { DEFAULT_PROPERTIES, getPropertyImage } from '../services/propertyData';
import { BookingModal } from '../components/BookingModal';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Home = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState(DEFAULT_PROPERTIES);
  const [selectedPropertyId, setSelectedPropertyId] = useState('1');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [roomType, setRoomType] = useState('all');
  const [guestCount, setGuestCount] = useState(2);
  const [bookingModalState, setBookingModalState] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await API.get('/properties');
      if (res.data && res.data.length > 0) {
        const cleaned = res.data.filter(p => !p.name.toLowerCase().includes('palace') && !p.name.toLowerCase().includes('grand heritage'));
        if (cleaned.length > 0) setProperties(cleaned);
      }
    } catch {
      setProperties(DEFAULT_PROPERTIES);
    }
  };

  const handleSearchVacancies = (e) => {
    e.preventDefault();
    navigate(`/vacancies?property_id=${selectedPropertyId}&check_in=${checkIn}&check_out=${checkOut}&room_type=${roomType}&guests=${guestCount}`);
  };

  const amenities = [
    { title: 'Private Infinity Plunge Pools', desc: 'Overlooking pristine coffee mist, emerald tea slopes, and tranquil lagoons.', icon: Sparkles },
    { title: 'Ancient Ayurvedic Sanctuary', desc: 'Holistic wellness treatments, herbal therapies, and sunrise meditation pavillions.', icon: HeartHandshake },
    { title: 'Farm-to-Table Culinary Craft', desc: 'Private riverside dinners and authentic local South Indian gastronomy.', icon: Coffee },
    { title: 'Private Lagoon & Houseboat Docks', desc: 'Exclusive sunset catamaran cruises along Alleppey’s serene backwaters.', icon: Compass },
  ];

  const testimonials = [
    { guest: 'Aarav Sharma', location: 'Bengaluru', property: 'Kaveri Riverside (Coorg)', quote: 'Exceptional riverside tranquility. Waking up to the soothing river current and misty hills was pure magic.', rating: 5 },
    { guest: 'Anita Desai', location: 'Mumbai', property: 'Kaveri Hilltop (Ooty)', quote: 'The hilltop panorama is breathtaking. Immaculate fireplace suites and warm, attentive luxury concierge service.', rating: 5 },
    { guest: 'Elena Rossi', location: 'Milan', property: 'Kaveri Backwater (Alleppey)', quote: 'World-class backwater villa with private plunge pool. Dining on the sunset deck was an unforgettable highlight.', rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-[#04120e] text-slate-100 flex flex-col selection:bg-[#d4af37] selection:text-black">
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
        {/* Background Visual */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('/hero_resort.jpg')`,
            backgroundPosition: 'center 35%',
          }}
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04120e] via-[#04120e]/65 to-[#04120e]/40" />
        <div className="absolute inset-0 bg-radial-vignette opacity-80" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#d4af37]/15 blur-3xl pointer-events-none rounded-full" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 pt-8 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/40 backdrop-blur-md shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f3e5ab]">
              Ultra-Luxury Sanctuary Collection
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-medium text-white tracking-tight leading-[1.1]">
            Curated Sanctuaries of <br />
            <span className="gold-text-gradient font-semibold italic">Timeless Distinction</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-light max-w-2xl mx-auto leading-relaxed text-shadow-sm">
            Three iconic properties in Coorg, Ooty, and Alleppey. Where pristine natural landscapes meet unparalleled bespoke hospitality.
          </p>

          {/* ── SEARCH & CHECK VACANCIES BAR ── */}
          <div className="pt-6 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearchVacancies}
              className="glass-dark p-4 sm:p-5 rounded-3xl border border-[#d4af37]/35 shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-left"
            >
              {/* Destination */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#d4af37] mb-1">
                  Destination Property
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="luxury-input text-xs py-2"
                >
                  <option value="1" style={{ background: '#0e1017' }}>Kaveri Riverside (Coorg)</option>
                  <option value="2" style={{ background: '#0e1017' }}>Kaveri Hilltop (Ooty)</option>
                  <option value="3" style={{ background: '#0e1017' }}>Kaveri Backwater (Alleppey)</option>
                </select>
              </div>

              {/* Check-In */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Check-In
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="luxury-input text-xs py-2"
                />
              </div>

              {/* Check-Out */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Check-Out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="luxury-input text-xs py-2"
                />
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Suite Type
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="luxury-input text-xs py-2"
                >
                  <option value="all" style={{ background: '#0e1017' }}>All Suite Categories</option>
                  <option value="Suite" style={{ background: '#0e1017' }}>Luxury Suite</option>
                  <option value="Deluxe" style={{ background: '#0e1017' }}>Deluxe Room</option>
                  <option value="Standard" style={{ background: '#0e1017' }}>Standard Room</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="btn-gold w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xl"
                >
                  <span>Search Vacancies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── 3 SIGNATURE PROPERTIES SHOWCASE ── */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="badge-gold text-[10px]">The Kaveri Trio</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white">
            Three Iconic Sanctuaries
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-light">
            Individually designed to honor their natural landscapes in Coorg, Ooty, and Alleppey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <div
              key={prop.property_id}
              className="luxury-card rounded-3xl overflow-hidden group flex flex-col justify-between border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all duration-500 shadow-2xl"
            >
              <div>
                {/* Image & Star badge */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getPropertyImage(prop.name, prop.city)}
                    alt={prop.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04120e] via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/40 text-xs text-[#f3e5ab] font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>{prop.city}</span>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{prop.stars} Stars</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-3">
                  <h3 className="font-serif text-2xl font-medium text-white group-hover:text-[#f3e5ab] transition-colors">
                    {prop.name}
                  </h3>
                  <p className="text-slate-300 text-xs font-light leading-relaxed">
                    {prop.description || 'Exclusive luxury sanctuary offering private suites, serene views, and bespoke culinary hospitality.'}
                  </p>

                  <div className="gold-divider pt-2" />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">Nightly Rates From</span>
                    <span className="font-mono font-bold text-base text-[#f3e5ab]">
                      {prop.city === 'Coorg' ? '₹4,500' : prop.city === 'Ooty' ? '₹6,800' : '₹5,100'}
                      <span className="text-[10px] text-slate-400 font-normal"> / night</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex gap-2.5">
                <Link
                  to={`/vacancies?property_id=${prop.property_id}`}
                  className="btn-gold flex-1 py-3 rounded-xl text-center text-xs font-bold block"
                >
                  Reserve Experience
                </Link>
                <Link
                  to="/properties"
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPERIENCES & SANCTUARY HIGHLIGHTS ── */}
      <section className="py-20 bg-[#030e0b] border-y border-[#d4af37]/15">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="badge-gold text-[10px]">Unmatched Hospitality</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white">
              Curated Sanctuary Amenities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {amenities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="luxury-card rounded-3xl p-7 border border-[#d4af37]/15 hover:border-[#d4af37]/40 space-y-3 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#f3e5ab]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-white">{item.title}</h4>
                  <p className="text-slate-400 text-xs font-light leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GUEST EXPERIENCES & TESTIMONIALS ── */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="badge-gold text-[10px]">Verified Guest Accolades</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white">
            Guest Reflections
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="luxury-card rounded-3xl p-7 border border-[#d4af37]/20 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-xs sm:text-sm italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h5 className="font-serif font-bold text-white text-sm">{t.guest}</h5>
                  <span className="text-[10px] text-slate-400">{t.location}</span>
                </div>
                <span className="text-[10px] font-semibold text-[#f3e5ab] text-right max-w-[120px] truncate">
                  {t.property}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {bookingModalState && (
        <BookingModal
          room={bookingModalState.room}
          property={bookingModalState.property}
          checkIn={checkIn}
          checkOut={checkOut}
          guestCount={guestCount}
          onClose={() => setBookingModalState(null)}
          onBookingComplete={() => setBookingModalState(null)}
        />
      )}

      <Footer />
    </div>
  );
};
