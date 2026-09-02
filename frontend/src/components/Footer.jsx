import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Shield, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#030d0a] border-t border-[#d4af37]/20 text-slate-400 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#f3e5ab] text-black font-serif font-bold text-base flex items-center justify-center">
              K
            </div>
            <span className="font-serif text-lg font-bold tracking-widest text-white">
              KAVERI STAYS
            </span>
          </div>
          <p className="text-slate-300 font-light text-sm max-w-md leading-relaxed">
            India's most treasured luxury escape — three iconic properties nestled in nature's most breathtaking sanctuaries in Coorg, Ooty, and Alleppey. Where every stay becomes an unforgettable story.
          </p>
          <div className="flex items-center gap-2 text-[#f3e5ab] text-xs font-semibold pt-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span>Coorg &bull; Ooty &bull; Alleppey Sanctuary Retreats</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <p className="font-serif text-white font-semibold text-sm uppercase tracking-wider">
            Explore Collection
          </p>
          <ul className="space-y-2">
            <li><Link to="/properties" className="hover:text-[#f3e5ab] transition-colors">Resort Properties</Link></li>
            <li><Link to="/vacancies" className="hover:text-[#f3e5ab] transition-colors">Check Room Vacancies</Link></li>
            <li><Link to="/my-bookings" className="hover:text-[#f3e5ab] transition-colors">My Reservations & Reviews</Link></li>
            <li><Link to="/dashboard" className="hover:text-[#f3e5ab] transition-colors">Admin Console ⚙</Link></li>
          </ul>
        </div>

        {/* Contact & Concierge */}
        <div className="space-y-3">
          <p className="font-serif text-white font-semibold text-sm uppercase tracking-wider">
            Private Concierge
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>concierge@kaveristays.com</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Karnataka, Tamil Nadu & Kerala</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-white/5 py-6 px-6 text-center text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto">
        <p>&copy; 2026 Kaveri Stays — Ultra-Luxury Hotel Booking Collection. All Rights Reserved.</p>
        <p className="flex items-center gap-1.5 mt-2 sm:mt-0 text-slate-300">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-[#d4af37] fill-[#d4af37]" />
          <span>for discerning travelers</span>
        </p>
      </div>
    </footer>
  );
};
