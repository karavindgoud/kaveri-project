import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Users, Search, Plus, Mail, Phone, MapPin, CalendarCheck, Sparkles, Award, AlertCircle } from 'lucide-react';

const DEFAULT_GUESTS = [
  { guest_id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', city: 'Bengaluru', total_bookings: 3 },
  { guest_id: 2, name: 'Anita Desai', email: 'anita.desai@example.com', phone: '+91 91234 56789', city: 'Mumbai', total_bookings: 2 },
  { guest_id: 3, name: 'Ben Carter', email: 'ben.carter@example.org', phone: '+44 7700 900123', city: 'Bristol', total_bookings: 2 },
  { guest_id: 4, name: 'Chloe Dubois', email: 'chloe.dubois@example.com', phone: '+33 6 12 34 56 78', city: 'Lyon', total_bookings: 1 },
  { guest_id: 5, name: 'Daniel Fischer', email: 'daniel.fischer@example.de', phone: '+49 151 12345678', city: 'Berlin', total_bookings: 2 },
  { guest_id: 6, name: 'Elena Rossi', email: 'elena.rossi@example.com', phone: '+39 320 1234567', city: 'Milan', total_bookings: 2 },
  { guest_id: 7, name: 'Farhan Ali', email: 'farhan.ali@example.com', phone: '+91 99887 76655', city: 'Hyderabad', total_bookings: 1 },
  { guest_id: 8, name: 'Grace Okafor', email: 'grace.okafor@example.com', phone: '+234 802 123 4567', city: 'Lagos', total_bookings: 2 },
  { guest_id: 9, name: 'Hiroshi Tanaka', email: 'hiroshi.tanaka@example.jp', phone: '+81 90-1234-5678', city: 'Osaka', total_bookings: 2 },
  { guest_id: 10, name: 'Isabel Moreno', email: 'isabel.moreno@example.com', phone: '+34 612 345 678', city: 'Madrid', total_bookings: 1 },
  { guest_id: 11, name: 'Jonas Weber', email: 'jonas.weber@example.de', phone: '+49 170 9876543', city: 'Hamburg', total_bookings: 1 },
  { guest_id: 12, name: 'Kavya Nair', email: 'kavya.nair@example.com', phone: '+91 94567 89012', city: 'Kochi', total_bookings: 2 },
  { guest_id: 13, name: "Liam O'Brien", email: 'liam.obrien@example.ie', phone: '+353 87 123 4567', city: 'Dublin', total_bookings: 2 },
  { guest_id: 14, name: 'Maya Krishnan', email: 'maya.k@example.com', phone: '+91 98111 22334', city: 'Chennai', total_bookings: 2 },
  { guest_id: 15, name: 'Noah Bergman', email: 'noah.bergman@example.se', phone: '+46 70 123 45 67', city: 'Stockholm', total_bookings: 1 },
  { guest_id: 16, name: 'Priya Menon', email: 'priya.menon@example.com', phone: '+91 90000 11111', city: 'Kochi', total_bookings: 1 },
  { guest_id: 17, name: 'Sofia Ahmed', email: 'sofia.ahmed@example.com', phone: '+91 93333 44444', city: 'Delhi', total_bookings: 1 },
  { guest_id: 18, name: 'Tom Nguyen', email: 'tom.nguyen@example.com', phone: '+84 90 123 4567', city: 'Hanoi', total_bookings: 1 },
  { guest_id: 19, name: 'Yusuf Demir', email: 'yusuf.demir@example.com', phone: '+90 532 123 4567', city: 'Istanbul', total_bookings: 1 }
];

export const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', city: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGuests();
  }, [searchTerm]);

  const fetchGuests = async () => {
    try {
      const params = {};
      if (searchTerm) params.name = searchTerm;
      const res = await API.get('/guests', { params });
      if (res.data && res.data.length > 0) {
        setGuests(res.data);
      } else {
        const stored = JSON.parse(localStorage.getItem('kaveri_custom_guests') || '[]');
        let combined = [...stored, ...DEFAULT_GUESTS];
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          combined = combined.filter(g => 
            g.name.toLowerCase().includes(s) || 
            g.email.toLowerCase().includes(s) || 
            (g.city && g.city.toLowerCase().includes(s))
          );
        }
        setGuests(combined);
      }
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_guests') || '[]');
      let combined = [...stored, ...DEFAULT_GUESTS];
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        combined = combined.filter(g => 
          g.name.toLowerCase().includes(s) || 
          g.email.toLowerCase().includes(s) || 
          (g.city && g.city.toLowerCase().includes(s))
        );
      }
      setGuests(combined);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const guestObj = {
      guest_id: Date.now() % 10000,
      name: newGuest.name,
      email: newGuest.email,
      phone: newGuest.phone || '+91 90000 00000',
      city: newGuest.city || 'India',
      total_bookings: 1
    };

    try {
      await API.post('/guests', newGuest);
      setShowModal(false);
      setNewGuest({ name: '', email: '', phone: '', city: '' });
      fetchGuests();
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_guests') || '[]');
      localStorage.setItem('kaveri_custom_guests', JSON.stringify([guestObj, ...stored]));
      setShowModal(false);
      setNewGuest({ name: '', email: '', phone: '', city: '' });
      fetchGuests();
    }
  };

  const getTierBadge = (count) => {
    if (count >= 3) return { name: 'Diamond Elite', style: 'bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40 font-semibold' };
    if (count >= 2) return { name: 'Gold Member', style: 'bg-amber-500/10 text-amber-300 border border-amber-500/30' };
    return { name: 'VIP Guest', style: 'bg-slate-800 text-slate-300 border border-slate-700' };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4af37]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab] mb-2">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            VIP Loyalty & Relations
          </div>
          <h1 className="font-serif text-3xl font-medium text-white tracking-tight">
            VIP Guest Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registered profiles, loyalty tier recognition, and historical stay records across 19 VIP guests
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-gold px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-bold self-start shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span>Register Guest</span>
        </button>
      </div>

      {/* Search */}
      <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-[#d4af37]/15">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest by name, email, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="luxury-input pl-10"
          />
        </div>
      </div>

      {/* Table */}
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
                  <th className="px-6 py-4">Guest Profile</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Loyalty Tier</th>
                  <th className="px-6 py-4">Completed Stays</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {guests.map((g) => {
                  const tier = getTierBadge(g.total_bookings || 1);
                  return (
                    <tr key={g.guest_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/30 flex items-center justify-center font-bold text-xs text-[#f3e5ab] flex-shrink-0">
                          {g.name[0]?.toUpperCase() || 'G'}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-white text-base leading-none">{g.name}</p>
                          <span className="text-[10px] font-mono text-slate-500">ID #{g.guest_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{g.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{g.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>{g.city || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] ${tier.style}`}>
                          {tier.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f3e5ab]">
                          <CalendarCheck className="w-4 h-4 text-[#d4af37]" />
                          <span>{g.total_bookings || 1} stays</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="luxury-card rounded-3xl w-full max-w-md p-7 border border-[#d4af37]/30 space-y-5 animate-fadeInUp shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-4">
              <h3 className="font-serif text-2xl font-medium text-white">Register VIP Guest</h3>
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
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  className="luxury-input"
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  className="luxury-input"
                  placeholder="e.g. aarav.sharma@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  className="luxury-input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  City Location
                </label>
                <input
                  type="text"
                  value={newGuest.city}
                  onChange={(e) => setNewGuest({ ...newGuest, city: e.target.value })}
                  className="luxury-input"
                  placeholder="e.g. Bengaluru"
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
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
