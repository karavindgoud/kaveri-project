import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { BedDouble, Plus, Building2, Users, Sparkles, Filter, Shield } from 'lucide-react';
import { DEFAULT_PROPERTIES, DEFAULT_ROOMS, DEFAULT_ROOM_TYPES } from '../services/propertyData';

export const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [selectedProperty, selectedType]);

  const fetchInitial = async () => {
    try {
      const [propRes, typeRes] = await Promise.all([
        API.get('/properties'),
        API.get('/rooms/types')
      ]);
      if (propRes.data && propRes.data.length > 0) {
        setProperties(propRes.data);
      } else {
        const stored = JSON.parse(localStorage.getItem('kaveri_custom_properties') || '[]');
        setProperties([...DEFAULT_PROPERTIES, ...stored]);
      }
      if (typeRes.data && typeRes.data.length > 0) {
        setRoomTypes(typeRes.data);
      } else {
        setRoomTypes(DEFAULT_ROOM_TYPES);
      }
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_properties') || '[]');
      setProperties([...DEFAULT_PROPERTIES, ...stored]);
      setRoomTypes(DEFAULT_ROOM_TYPES);
    }
  };

  const fetchRooms = async () => {
    try {
      const params = {};
      if (selectedProperty) params.property_id = selectedProperty;
      if (selectedType) params.room_type_id = selectedType;
      const res = await API.get('/rooms', { params });
      if (res.data && res.data.length > 0) {
        setRooms(res.data);
      } else {
        let filtered = [...DEFAULT_ROOMS];
        if (selectedProperty) {
          filtered = filtered.filter(r => String(r.property_id) === String(selectedProperty));
        }
        if (selectedType) {
          filtered = filtered.filter(r => String(r.room_type_id) === String(selectedType));
        }
        setRooms(filtered);
      }
    } catch (err) {
      let filtered = [...DEFAULT_ROOMS];
      if (selectedProperty) {
        filtered = filtered.filter(r => String(r.property_id) === String(selectedProperty));
      }
      if (selectedType) {
        filtered = filtered.filter(r => String(r.room_type_id) === String(selectedType));
      }
      setRooms(filtered);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4af37]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab] mb-2">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            Suites & Accommodations
          </div>
          <h1 className="font-serif text-3xl font-medium text-white tracking-tight">
            Suite Inventory & Categories
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time room allocations for Kaveri Riverside, Kaveri Hilltop, and Kaveri Backwaters
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-4 border border-[#d4af37]/15">
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="luxury-input min-w-[220px] flex-1"
        >
          <option value="">All Resort Properties</option>
          {properties.map(p => (
            <option key={p.property_id} value={p.property_id} style={{ background: '#0e1017' }}>
              {p.name} ({p.city})
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="luxury-input min-w-[220px] flex-1"
        >
          <option value="">All Suite & Room Tiers</option>
          {roomTypes.map(rt => (
            <option key={rt.room_type_id} value={rt.room_type_id} style={{ background: '#0e1017' }}>
              {rt.type_name} (Max {rt.max_occupancy} Guests)
            </option>
          ))}
        </select>
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
                  <th className="px-6 py-4">Suite Number</th>
                  <th className="px-6 py-4">Resort Location</th>
                  <th className="px-6 py-4">Suite Category</th>
                  <th className="px-6 py-4">Max Occupancy</th>
                  <th className="px-6 py-4">Nightly Rate</th>
                  <th className="px-6 py-4">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rooms.map((room) => (
                  <tr key={room.room_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-serif font-bold text-white flex items-center gap-2 text-base">
                      <BedDouble className="w-4 h-4 text-[#d4af37]" />
                      <span>Suite #{room.room_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{room.property_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-[#d4af37]/10 text-[#f3e5ab] text-xs font-semibold border border-[#d4af37]/25">
                        {room.room_type_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Up to {room.max_occupancy} Guests</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[#f3e5ab]">
                      ₹{room.rate || 450} / night
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-emerald text-[10px]">Available</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
