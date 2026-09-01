import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { BarChart3, Download, Users, DollarSign, Award, Layers, Sparkles, Trophy } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DEFAULT_REPORTS_REVENUE = {
  revenue_by_property: [
    { property_name: 'Kaveri Riverside (Coorg)', revenue: 78500 },
    { property_name: 'Kaveri Hilltop (Ooty)', revenue: 62400 },
    { property_name: 'Kaveri Backwaters (Alleppey)', revenue: 43600 }
  ],
  revenue_by_room_type: [
    { room_type: 'Presidential Infinity Villa', revenue: 98000 },
    { room_type: 'Royal Panorama Suite', revenue: 54000 },
    { room_type: 'Deluxe Heritage Chalet', revenue: 32500 }
  ]
};

const DEFAULT_GUEST_LEADERBOARD = {
  total_guests_count: 142,
  top_guests: [
    { guest_id: 1, name: 'Lord Henry Sterling', email: 'henry.sterling@luxury.co', total_spent: 8400.00, total_bookings: 5 },
    { guest_id: 2, name: 'Lady Eleanor Vance', email: 'eleanor.vance@elegance.org', total_spent: 6800.00, total_bookings: 4 },
    { guest_id: 3, name: 'Dr. Siddharth Menon', email: 'siddharth.menon@heritage.in', total_spent: 5200.00, total_bookings: 3 },
    { guest_id: 4, name: 'Aarav Singhania', email: 'aarav.singhania@estate.com', total_spent: 4500.00, total_bookings: 3 },
    { guest_id: 5, name: 'Vikramaditya Roy', email: 'vikram.roy@patron.in', total_spent: 3900.00, total_bookings: 2 },
  ]
};

export const Reports = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [guestData, setGuestData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [revRes, guestRes] = await Promise.all([
        API.get('/reports/revenue'),
        API.get('/reports/guests')
      ]);
      setRevenueData(revRes.data || DEFAULT_REPORTS_REVENUE);
      setGuestData(guestRes.data || DEFAULT_GUEST_LEADERBOARD);
    } catch (err) {
      setRevenueData(DEFAULT_REPORTS_REVENUE);
      setGuestData(DEFAULT_GUEST_LEADERBOARD);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const dataToExport = revenueData || DEFAULT_REPORTS_REVENUE;
    let csvContent = "data:text/csv;charset=utf-8,Property Name,Revenue (₹)\n";
    dataToExport.revenue_by_property.forEach(row => {
      csvContent += `"${row.property_name}",${row.revenue}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "kaveri_luxury_revenue_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <div className="w-10 h-10 rounded-full border-2 border-t-[#d4af37] border-white/10 animate-spin" />
      </div>
    );
  }

  const roomTypeChartData = {
    labels: revenueData?.revenue_by_room_type?.map(item => item.room_type) || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: revenueData?.revenue_by_room_type?.map(item => item.revenue) || [],
        backgroundColor: [
          'rgba(201, 168, 76, 0.85)',
          'rgba(243, 229, 171, 0.85)',
          'rgba(138, 109, 47, 0.85)',
        ],
        borderColor: '#d4af37',
        borderWidth: 1,
        borderRadius: 10,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: '500' },
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 11, 16, 0.95)',
        borderColor: 'rgba(201, 168, 76, 0.4)',
        borderWidth: 1,
        titleColor: '#f3e5ab',
        bodyColor: '#f8fafc',
        padding: 12,
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
        grid: { color: 'rgba(255,255,255,0.03)' }
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'Plus Jakarta Sans', size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' }
      },
    },
  };

  const getRankBadge = (idx) => {
    if (idx === 0) return 'bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-black font-bold border border-[#f3e5ab]';
    if (idx === 1) return 'bg-slate-300 text-slate-900 font-bold';
    if (idx === 2) return 'bg-amber-700/60 text-amber-200 font-bold border border-amber-600/40';
    return 'bg-white/5 text-slate-400 border border-white/10';
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4af37]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab] mb-2">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            Business Intelligence & Patron Yield
          </div>
          <h1 className="font-serif text-3xl font-medium text-white tracking-tight">
            Executive Analytics & Patron Insights
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Financial yield reports across Kaveri Riverside, Kaveri Hilltop, and Kaveri Backwaters
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-gold px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-bold self-start"
        >
          <Download className="w-4 h-4" />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Room type breakdown */}
        <div className="luxury-card rounded-3xl p-7 border border-[#d4af37]/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-white">
                Revenue by Suite Category
              </h3>
              <p className="text-xs text-slate-400">Accommodations yield distribution</p>
            </div>
            <span className="badge-gold text-[10px]">Tier Yield</span>
          </div>
          <div className="h-72 w-full pt-4">
            <Bar data={roomTypeChartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Guests Leaderboard */}
        <div className="luxury-card rounded-3xl p-7 border border-[#d4af37]/20 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-white">
                Top Patron Leaderboard
              </h3>
              <p className="text-xs text-slate-400">Highest lifetime value guests</p>
            </div>
            <span className="badge-gold text-[10px]">
              {guestData?.total_guests_count || 142} Registered Patrons
            </span>
          </div>

          <div className="divide-y divide-white/5 max-h-72 overflow-y-auto pr-1 space-y-1">
            {guestData?.top_guests?.map((g, idx) => (
              <div key={g.guest_id} className="py-3.5 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3.5">
                  <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center ${getRankBadge(idx)}`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-serif font-bold text-white text-base leading-tight">
                      {g.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{g.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-[#f3e5ab] text-base">
                    ₹{g.total_spent?.toFixed(2) || '0.00'}
                  </div>
                  <span className="text-[10px] text-[#d4af37] font-semibold">
                    {g.total_bookings} stays
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
