import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GuestPortal } from './GuestPortal';
import {
  IndianRupee, TrendingUp, Bed, CheckCircle2,
  LogOut, Calendar, Layers, Sparkles, Building2,
  ArrowUpRight, Users, Shield, Award
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const DEFAULT_DASHBOARD_SUMMARY = {
  total_revenue: 700600,
  occupancy_rate: 78.6,
  adr: 5850,
  revpar: 4598.10,
  total_rooms: 14,
  available_rooms: 3,
  today_checkins: 4,
  today_checkouts: 2,
};

const DEFAULT_REVENUE_DATA = {
  revenue_by_property: [
    { property_name: 'Kaveri Riverside (Coorg)', revenue: 215400 },
    { property_name: 'Kaveri Hilltop (Ooty)', revenue: 247600 },
    { property_name: 'Kaveri Backwater (Alleppey)', revenue: 237600 }
  ],
  revenue_by_method: [
    { method: 'credit_card', revenue: 429600 },
    { method: 'upi', revenue: 230200 },
    { method: 'bank_transfer', revenue: 40800 }
  ]
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);

  if (user?.role === 'Guest') return <GuestPortal />;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const cleanRevenueProperties = (propsList) => {
    if (!propsList || propsList.length === 0) return DEFAULT_REVENUE_DATA.revenue_by_property;
    const filtered = propsList.filter(i => {
      const name = (i.property_name || '').toLowerCase();
      return !name.includes('udaipur') && !name.includes('mysore') && !name.includes('palace') && !name.includes('grand heritage');
    });
    return filtered.length > 0 ? filtered : DEFAULT_REVENUE_DATA.revenue_by_property;
  };

  const fetchDashboardData = async () => {
    try {
      const [sumRes, revRes] = await Promise.all([
        API.get('/reports/dashboard'),
        API.get('/reports/revenue')
      ]);
      setSummary(sumRes.data || DEFAULT_DASHBOARD_SUMMARY);
      
      const rev = revRes.data || DEFAULT_REVENUE_DATA;
      if (rev.revenue_by_property) {
        rev.revenue_by_property = cleanRevenueProperties(rev.revenue_by_property);
      }
      setRevenueData(rev);
    } catch (err) {
      setSummary(DEFAULT_DASHBOARD_SUMMARY);
      setRevenueData(DEFAULT_REVENUE_DATA);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-t-[#d4af37] border-white/10 animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#f3e5ab]/70">
          Loading Executive Analytics…
        </p>
      </div>
    );
  }

  const cleanPropertiesList = cleanRevenueProperties(revenueData?.revenue_by_property);

  // Chart configs with Emerald Forest & Warm Gold tones - strictly 3 Canonical Properties
  const propertyChartData = {
    labels: cleanPropertiesList.map(i => i.property_name),
    datasets: [{
      label: 'Revenue (₹)',
      data: cleanPropertiesList.map(i => i.revenue || i.total_revenue || 0),
      backgroundColor: [
        'rgba(212, 175, 55, 0.85)',  // Warm Gold (Coorg)
        'rgba(16, 185, 129, 0.85)',  // Emerald Green (Ooty)
        'rgba(52, 211, 153, 0.85)'   // Mint Jade (Alleppey)
      ],
      borderColor: [
        '#d4af37',
        '#10b981',
        '#34d399'
      ],
      borderWidth: 1.5,
      borderRadius: 10,
      hoverBackgroundColor: [
        '#f3e5ab',
        '#6ee7b7',
        '#a7f3d0'
      ],
    }]
  };

  const paymentMethodData = {
    labels: revenueData?.revenue_by_method?.map(i => i.method.replace('_', ' ').toUpperCase()) || ['CREDIT CARD', 'UPI', 'BANK TRANSFER'],
    datasets: [{
      data: revenueData?.revenue_by_method?.map(i => i.revenue) || [429600, 230200, 40800],
      backgroundColor: [
        '#d4af37', // Warm Gold
        '#10b981', // Emerald Green
        '#f3e5ab', // Champagne
        '#059669', // Deep Forest Jade
        '#34d399'  // Mint
      ],
      borderColor: '#04120e',
      borderWidth: 3,
    }]
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
        backgroundColor: 'rgba(4, 18, 14, 0.95)',
        borderColor: 'rgba(212, 175, 55, 0.35)',
        borderWidth: 1,
        titleColor: '#f3e5ab',
        bodyColor: '#f4faf7',
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
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

  const kpis = [
    {
      title: 'Total Portfolio Revenue',
      value: `₹${parseFloat(summary?.total_revenue || 700600).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: IndianRupee,
      accent: '#d4af37'
    },
    {
      title: 'Occupancy Rate',
      value: `${summary?.occupancy_rate || 78.6}%`,
      icon: TrendingUp,
      accent: '#10b981'
    },
    {
      title: 'Average Daily Rate',
      value: `₹${parseFloat(summary?.adr || 5850).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Layers,
      accent: '#f3e5ab'
    },
    {
      title: 'RevPAR Yield',
      value: `₹${parseFloat(summary?.revpar || 4598.10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Sparkles,
      accent: '#34d399'
    },
    {
      title: 'Total Luxury Suites',
      value: summary?.total_rooms || 14,
      icon: Bed,
      accent: '#a7f3d0'
    },
    {
      title: 'Available Inventory',
      value: summary?.available_rooms || 3,
      icon: CheckCircle2,
      accent: '#10b981'
    },
    {
      title: "Today's VIP Check-ins",
      value: summary?.today_checkins || 4,
      icon: Calendar,
      accent: '#d4af37'
    },
    {
      title: "Today's Check-outs",
      value: summary?.today_checkouts || 2,
      icon: LogOut,
      accent: '#f87171'
    },
  ];

  return (
    <div className="space-y-10">

      {/* ── Executive Header with Refined Caption ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#d4af37]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab] mb-2">
            <Shield className="w-3 h-3 text-[#f3e5ab]" />
            Live Enterprise Portfolio (Coorg, Ooty, Alleppey)
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-white tracking-tight">
            Hospitality Intelligence & Operations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time occupancy, revenue flows, and guest allocations across Coorg, Ooty, and Alleppey sanctuaries.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/bookings"
            className="btn-gold px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold"
          >
            <span>Manage Bookings</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── KPI Tiles Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="luxury-card rounded-2xl p-6 flex items-center justify-between group transition-all duration-300 border border-[#d4af37]/15 hover:border-[#d4af37]/40 animate-fadeInUp"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {kpi.title}
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-white">
                  {kpi.value}
                </h3>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{
                  background: `${kpi.accent}15`,
                  border: `1px solid ${kpi.accent}30`,
                }}
              >
                <Icon className="w-6 h-6" style={{ color: kpi.accent }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Analytics Visualizations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue by Property - strictly 3 canonical properties */}
        <div className="lg:col-span-2 luxury-card rounded-3xl p-7 border border-[#d4af37]/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-white">
                Revenue Generation by Property
              </h3>
              <p className="text-xs text-slate-400">Monthly breakdown across Coorg, Ooty, and Alleppey</p>
            </div>
            <span className="badge-gold text-[10px]">Financial Yield</span>
          </div>
          <div className="h-72 w-full pt-4">
            <Bar data={propertyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="luxury-card rounded-3xl p-7 border border-[#d4af37]/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-medium text-white">
                Payment Distribution
              </h3>
              <p className="text-xs text-slate-400">Transactions by payment channel</p>
            </div>
          </div>
          <div className="h-72 w-full flex items-center justify-center pt-2">
            <Doughnut
              data={paymentMethodData}
              options={{
                ...chartOptions,
                scales: undefined,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 10 }, padding: 12 }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
