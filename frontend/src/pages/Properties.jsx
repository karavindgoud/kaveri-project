import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2, MapPin, Star, Plus, Search, Bed,
  Sparkles, AlertCircle, ArrowRight, BedDouble, Users
} from 'lucide-react';
import { DEFAULT_PROPERTIES, getPropertyImage } from '../services/propertyData';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BookingModal } from '../components/BookingModal';

export const Properties = ({ isEmbeddedInDashboard = false }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProp, setNewProp] = useState({ name: '', city: '', stars: 5, total_rooms: 16 });
  const [error, setError] = useState('');
  const [bookingModalState, setBookingModalState] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, [cityFilter, starFilter]);

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
      if (cityFilter) params.city = cityFilter;
      if (starFilter) params.stars = starFilter;
      const res = await API.get('/properties', { params });
      if (res.data && res.data.length > 0) {
        let filtered = cleanProps(res.data);
        if (cityFilter) {
          filtered = filtered.filter(p => p.city.toLowerCase().includes(cityFilter.toLowerCase()));
        }
        if (starFilter) {
          filtered = filtered.filter(p => String(p.stars) === String(starFilter));
        }
        setProperties(filtered.length > 0 ? filtered : DEFAULT_PROPERTIES);
      } else {
        const stored = JSON.parse(localStorage.getItem('kaveri_custom_properties') || '[]');
        let combined = cleanProps([...DEFAULT_PROPERTIES, ...stored]);
        if (cityFilter) {
          combined = combined.filter(p => p.city.toLowerCase().includes(cityFilter.toLowerCase()));
        }
        if (starFilter) {
          combined = combined.filter(p => String(p.stars) === String(starFilter));
        }
        setProperties(combined);
      }
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_properties') || '[]');
      let combined = cleanProps([...DEFAULT_PROPERTIES, ...stored]);
      if (cityFilter) {
        combined = combined.filter(p => p.city.toLowerCase().includes(cityFilter.toLowerCase()));
      }
      if (starFilter) {
        combined = combined.filter(p => String(p.stars) === String(starFilter));
      }
      setProperties(combined);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const propToSave = {
      property_id: Date.now() % 10000,
      name: newProp.name,
      city: newProp.city,
      stars: parseInt(newProp.stars),
      total_rooms: parseInt(newProp.total_rooms) || 16,
      image: getPropertyImage(newProp.name, newProp.city),
      description: `Luxury resort property situated in ${newProp.city} offering panoramic views and signature suites.`
    };

    try {
      await API.post('/properties', propToSave);
      setShowModal(false);
      setNewProp({ name: '', city: '', stars: 5, total_rooms: 16 });
      fetchProperties();
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_properties') || '[]');
      localStorage.setItem('kaveri_custom_properties', JSON.stringify([...stored, propToSave]));
      setShowModal(false);
      setNewProp({ name: '', city: '', stars: 5, total_rooms: 16 });
      fetchProperties();
    }
  };

  const content = (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4af37]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab] mb-2">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            The Kaveri Sanctuary Portfolio
          </div>
          <h1 className="font-serif text-3xl font-medium text-white tracking-tight">
            Resort Properties & Estates
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Three signature sanctuaries in Coorg, Ooty, and Alleppey
          </p>
        </div>
        {user?.role !== 'Guest' && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-gold px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-bold self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-4 border border-[#d4af37]/15">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter properties by city (e.g. Coorg, Ooty, Alleppey)..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="luxury-input pl-10"
          />
        </div>
        <select
          value={starFilter}
          onChange={(e) => setStarFilter(e.target.value)}
          className="luxury-input min-w-[180px] w-auto"
        >
          <option value="">All Star Ratings</option>
          <option value="5" style={{ background: '#0e1017' }}>5 Stars Luxury</option>
          <option value="4" style={{ background: '#0e1017' }}>4 Stars Premium</option>
          <option value="3" style={{ background: '#0e1017' }}>3 Stars Standard</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center p-16">
          <div className="w-10 h-10 rounded-full border-2 border-t-[#d4af37] border-white/10 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((p, idx) => {
            const photo = p.image || getPropertyImage(p.name, p.city);
            return (
              <div
                key={p.property_id || idx}
                className="luxury-card rounded-3xl overflow-hidden flex flex-col group animate-fadeInUp border border-[#d4af37]/20 hover:border-[#d4af37]/45 transition-all shadow-xl"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                  <img
                    src={photo}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = '/hero_resort.jpg'; }}
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
                    <h3 className="font-serif text-2xl font-medium text-white group-hover:text-[#f3e5ab] transition-colors">{p.name}</h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {p.description || `Premier luxury hospitality asset in ${p.city} with panoramic suites, infinity pools, and Ayurvedic spa.`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Bed className="w-4 h-4 text-[#d4af37]" />
                      <span>{p.city === 'Coorg' ? '5 Suites (101-105)' : p.city === 'Ooty' ? '5 Suites (201-205)' : '4 Suites (301-304)'}</span>
                    </span>
                    <span className="font-bold text-[#f3e5ab] font-mono text-sm">
                      {p.city === 'Coorg' ? '₹4,500/nt' : p.city === 'Ooty' ? '₹6,800/nt' : '₹5,100/nt'}
                    </span>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Link
                      to={`/vacancies?property_id=${p.property_id}`}
                      className="btn-gold flex-1 py-3 rounded-xl text-center text-xs font-bold block"
                    >
                      Check Vacancies
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Property Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="luxury-card rounded-3xl w-full max-w-md p-7 border border-[#d4af37]/30 space-y-5 animate-fadeInUp shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-4">
              <h3 className="font-serif text-2xl font-medium text-white">Add New Resort</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  Property Name
                </label>
                <input
                  type="text"
                  required
                  value={newProp.name}
                  onChange={(e) => setNewProp({ ...newProp, name: e.target.value })}
                  className="luxury-input"
                  placeholder="e.g. Kaveri Rainforest Retreat"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  City / Destination Location
                </label>
                <input
                  type="text"
                  required
                  value={newProp.city}
                  onChange={(e) => setNewProp({ ...newProp, city: e.target.value })}
                  className="luxury-input"
                  placeholder="e.g. Wayanad, Munnar, Goa"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                    Star Tier
                  </label>
                  <select
                    value={newProp.stars}
                    onChange={(e) => setNewProp({ ...newProp, stars: parseInt(e.target.value) })}
                    className="luxury-input"
                  >
                    <option value="5" style={{ background: '#0e1017' }}>5 Stars</option>
                    <option value="4" style={{ background: '#0e1017' }}>4 Stars</option>
                    <option value="3" style={{ background: '#0e1017' }}>3 Stars</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                    Total Rooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProp.total_rooms}
                    onChange={(e) => setNewProp({ ...newProp, total_rooms: e.target.value })}
                    className="luxury-input"
                  />
                </div>
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
                  Register Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (isEmbeddedInDashboard) {
    return content;
  }

  return (
    <div className="min-h-screen bg-[#04120e] text-slate-100 flex flex-col selection:bg-[#d4af37] selection:text-black">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-10 py-10 w-full">
        {content}
      </main>
      <Footer />
    </div>
  );
};
