import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';
import {
  Sparkles, Calendar, MapPin, Star, BedDouble,
  Users, CheckCircle2, AlertCircle, ArrowRight,
  Filter, Search, Clock, ShieldCheck
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BookingModal } from '../components/BookingModal';
import { DEFAULT_PROPERTIES, DEFAULT_ROOMS, getPropertyImage } from '../services/propertyData';

export const Vacancies = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [propertyId, setPropertyId] = useState(searchParams.get('property_id') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('check_in') || new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(searchParams.get('check_out') || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [roomType, setRoomType] = useState(searchParams.get('room_type') || '');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalRoom, setBookingModalRoom] = useState(null);

  const cInDate = new Date(checkIn);
  const cOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.round((cOutDate - cInDate) / (1000 * 60 * 60 * 24)));

  useEffect(() => {
    fetchAvailableRooms();
  }, [propertyId, checkIn, checkOut, roomType]);

  const fetchAvailableRooms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (propertyId) params.property_id = propertyId;
      if (checkIn) params.check_in = checkIn;
      if (checkOut) params.check_out = checkOut;
      
      const res = await API.get('/rooms/availability', { params });
      if (res.data && res.data.length > 0) {
        let rooms = res.data;
        if (roomType && roomType !== 'all') {
          rooms = rooms.filter(r => (r.type_name || '').toLowerCase() === roomType.toLowerCase());
        }
        setAvailableRooms(rooms);
      } else {
        fallbackRooms();
      }
    } catch (err) {
      fallbackRooms();
    } finally {
      setLoading(false);
    }
  };

  const fallbackRooms = () => {
    let rooms = DEFAULT_ROOMS.map(r => ({
      room_id: r.room_id,
      property_id: r.property_id,
      property_name: r.property_name,
      property_city: r.property_name.includes('Coorg') || r.property_id === 1 ? 'Coorg' : r.property_name.includes('Ooty') || r.property_id === 2 ? 'Ooty' : 'Alleppey',
      room_number: r.room_number,
      room_type_id: 1,
      type_name: r.room_type_name,
      max_occupancy: r.max_occupancy,
      nightly_rate: r.rate,
      total_rate: r.rate * nights
    }));

    if (propertyId) {
      rooms = rooms.filter(r => String(r.property_id) === String(propertyId));
    }
    if (roomType && roomType !== 'all') {
      rooms = rooms.filter(r => r.type_name.toLowerCase() === roomType.toLowerCase());
    }
    setAvailableRooms(rooms);
  };

  return (
    <div className="min-h-screen bg-[#04120e] text-slate-100 flex flex-col selection:bg-[#d4af37] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-10 py-10 space-y-8 w-full">
        
        {/* Header */}
        <div className="border-b border-[#d4af37]/20 pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab]">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            Live Suite Inventory & Availability
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-white tracking-tight">
            Check Room Vacancies
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-light">
            Real-time availability across Kaveri Riverside (Coorg), Kaveri Hilltop (Ooty), and Kaveri Backwater (Alleppey).
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-dark p-5 rounded-3xl border border-[#d4af37]/30 shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-[#d4af37] mb-1.5">
              Select Property
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="luxury-input text-xs"
            >
              <option value="" style={{ background: '#0e1017' }}>All 3 Resort Properties</option>
              <option value="1" style={{ background: '#0e1017' }}>Kaveri Riverside (Coorg)</option>
              <option value="2" style={{ background: '#0e1017' }}>Kaveri Hilltop (Ooty)</option>
              <option value="3" style={{ background: '#0e1017' }}>Kaveri Backwater (Alleppey)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
              Check-In Date
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="luxury-input text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
              Check-Out Date
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="luxury-input text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
              Suite Category
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="luxury-input text-xs"
            >
              <option value="" style={{ background: '#0e1017' }}>All Suite Categories</option>
              <option value="Suite" style={{ background: '#0e1017' }}>Luxury Suite</option>
              <option value="Deluxe" style={{ background: '#0e1017' }}>Deluxe Suite</option>
              <option value="Standard" style={{ background: '#0e1017' }}>Standard Room</option>
            </select>
          </div>
        </div>

        {/* Results Banner */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <span>Found <strong className="text-white font-mono">{availableRooms.length}</strong> available suites for <strong className="text-[#f3e5ab] font-mono">{nights} nights</strong> ({checkIn} &rarr; {checkOut})</span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live Best-Rate Guaranteed
          </span>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-t-[#d4af37] border-white/10 animate-spin" />
            <span className="text-xs uppercase tracking-widest text-[#f3e5ab]">Checking Live Inventory…</span>
          </div>
        ) : availableRooms.length === 0 ? (
          <div className="luxury-card rounded-3xl p-12 text-center space-y-4 border border-white/10">
            <AlertCircle className="w-10 h-10 text-[#d4af37] mx-auto" />
            <h3 className="font-serif text-xl font-medium text-white">No Suites Available for Chosen Window</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Please try adjusting your check-in dates or selecting a different property.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRooms.map((room) => (
              <div
                key={`${room.property_id}-${room.room_id}`}
                className="luxury-card rounded-3xl overflow-hidden border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all duration-300 group flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Image banner */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getPropertyImage(room.property_name, room.property_city)}
                      alt={room.property_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#04120e] via-transparent to-transparent opacity-90" />
                    
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#d4af37]/40 text-[11px] text-[#f3e5ab] font-bold">
                      Suite #{room.room_number}
                    </div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                      Available
                    </div>
                  </div>

                  {/* Room Meta */}
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#d4af37] block">
                        {room.property_name} ({room.property_city})
                      </span>
                      <h3 className="font-serif text-xl font-medium text-white mt-1">
                        {room.type_name} Suite
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Up to {room.max_occupancy} Guests</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>King Bed</span>
                      </div>
                    </div>

                    <div className="gold-divider" />

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Nightly Rate</span>
                        <span className="font-mono font-bold text-lg text-white">₹{room.nightly_rate.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">{nights} Nights Total</span>
                        <span className="font-mono font-bold text-xl text-[#f3e5ab]">₹{(room.nightly_rate * nights).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Button */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => setBookingModalRoom(room)}
                    className="btn-gold w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xl"
                  >
                    <span>Reserve Suite #{room.room_number}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Booking Modal */}
      {bookingModalRoom && (
        <BookingModal
          room={bookingModalRoom}
          property={{ name: bookingModalRoom.property_name }}
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={() => setBookingModalRoom(null)}
          onBookingComplete={() => {
            setBookingModalRoom(null);
            fetchAvailableRooms();
          }}
        />
      )}

      <Footer />
    </div>
  );
};
