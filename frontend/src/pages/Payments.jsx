import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { CreditCard, Plus, IndianRupee, Calendar, User, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

const DEFAULT_PAYMENTS = [
  { payment_id: 1, booking_id: 1, guest_name: 'Aarav Sharma', amount: 13500.00, method: 'credit_card', payment_date: '2025-01-12' },
  { payment_id: 2, booking_id: 2, guest_name: 'Aarav Sharma', amount: 27000.00, method: 'credit_card', payment_date: '2025-02-14' },
  { payment_id: 3, booking_id: 3, guest_name: 'Anita Desai', amount: 24600.00, method: 'upi', payment_date: '2025-02-03' },
  { payment_id: 4, booking_id: 4, guest_name: 'Anita Desai', amount: 24600.00, method: 'upi', payment_date: '2025-03-09' },
  { payment_id: 5, booking_id: 5, guest_name: 'Ben Carter', amount: 6400.00, method: 'credit_card', payment_date: '2025-03-20' },
  { payment_id: 6, booking_id: 6, guest_name: 'Chloe Dubois', amount: 40800.00, method: 'credit_card', payment_date: '2025-04-05' },
  { payment_id: 7, booking_id: 7, guest_name: 'Daniel Fischer', amount: 20400.00, method: 'bank_transfer', payment_date: '2025-04-18' },
  { payment_id: 8, booking_id: 8, guest_name: 'Daniel Fischer', amount: 20400.00, method: 'bank_transfer', payment_date: '2025-05-02' },
  { payment_id: 9, booking_id: 9, guest_name: 'Elena Rossi', amount: 38000.00, method: 'credit_card', payment_date: '2025-05-19' },
  { payment_id: 10, booking_id: 10, guest_name: 'Farhan Ali', amount: 13500.00, method: 'upi', payment_date: '2025-06-01' },
  { payment_id: 11, booking_id: 11, guest_name: 'Grace Okafor', amount: 16200.00, method: 'credit_card', payment_date: '2025-06-15' },
  { payment_id: 12, booking_id: 12, guest_name: 'Hiroshi Tanaka', amount: 25500.00, method: 'credit_card', payment_date: '2025-07-08' },
  { payment_id: 13, booking_id: 13, guest_name: 'Hiroshi Tanaka', amount: 23700.00, method: 'credit_card', payment_date: '2025-08-22' },
  { payment_id: 14, booking_id: 14, guest_name: 'Isabel Moreno', amount: 32800.00, method: 'upi', payment_date: '2025-09-01' },
  { payment_id: 15, booking_id: 15, guest_name: 'Jonas Weber', amount: 7800.00, method: 'credit_card', payment_date: '2025-09-14' },
  { payment_id: 16, booking_id: 16, guest_name: 'Kavya Nair', amount: 20400.00, method: 'upi', payment_date: '2025-10-02' },
  { payment_id: 17, booking_id: 17, guest_name: 'Kavya Nair', amount: 13500.00, method: 'upi', payment_date: '2025-11-11' },
  { payment_id: 18, booking_id: 18, guest_name: "Liam O'Brien", amount: 27200.00, method: 'credit_card', payment_date: '2025-11-28' },
  { payment_id: 19, booking_id: 19, guest_name: 'Maya Krishnan', amount: 44800.00, method: 'credit_card', payment_date: '2025-12-20' },
  { payment_id: 20, booking_id: 20, guest_name: 'Noah Bergman', amount: 60000.00, method: 'credit_card', payment_date: '2025-12-24' },
  { payment_id: 21, booking_id: 21, guest_name: 'Aarav Sharma', amount: 20400.00, method: 'upi', payment_date: '2026-01-05' },
  { payment_id: 22, booking_id: 22, guest_name: 'Priya Menon', amount: 15300.00, method: 'credit_card', payment_date: '2026-01-19' },
  { payment_id: 23, booking_id: 23, guest_name: 'Ben Carter', amount: 11700.00, method: 'credit_card', payment_date: '2026-02-14' },
  { payment_id: 24, booking_id: 24, guest_name: 'Sofia Ahmed', amount: 20400.00, method: 'upi', payment_date: '2026-02-20' },
  { payment_id: 25, booking_id: 25, guest_name: 'Elena Rossi', amount: 31600.00, method: 'credit_card', payment_date: '2026-03-01' },
  { payment_id: 26, booking_id: 26, guest_name: 'Tom Nguyen', amount: 13500.00, method: 'credit_card', payment_date: '2026-03-10' },
  { payment_id: 27, booking_id: 27, guest_name: 'Grace Okafor', amount: 15300.00, method: 'upi', payment_date: '2026-04-02' },
  { payment_id: 28, booking_id: 28, guest_name: 'Yusuf Demir', amount: 10800.00, method: 'credit_card', payment_date: '2026-04-15' },
  { payment_id: 29, booking_id: 29, guest_name: 'Maya Krishnan', amount: 28500.00, method: 'credit_card', payment_date: '2026-05-01' },
  { payment_id: 30, booking_id: 30, guest_name: "Liam O'Brien", amount: 18000.00, method: 'upi', payment_date: '2026-05-20' },
];

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [methodFilter, setMethodFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bookings, setBookings] = useState([]);

  const [newPay, setNewPay] = useState({
    booking_id: '1',
    amount: '13500.00',
    method: 'credit_card',
    payment_date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [methodFilter]);

  const fetchPayments = async () => {
    try {
      const params = {};
      if (methodFilter) params.method = methodFilter;
      const res = await API.get('/payments', { params });
      if (res.data && res.data.length > 0) {
        setPayments(res.data);
      } else {
        const stored = JSON.parse(localStorage.getItem('kaveri_custom_payments') || '[]');
        const combined = [...stored, ...DEFAULT_PAYMENTS];
        if (methodFilter) {
          setPayments(combined.filter(p => p.method === methodFilter));
        } else {
          setPayments(combined);
        }
      }
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_payments') || '[]');
      const combined = [...stored, ...DEFAULT_PAYMENTS];
      if (methodFilter) {
        setPayments(combined.filter(p => p.method === methodFilter));
      } else {
        setPayments(combined);
      }
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
          setNewPay(prev => ({ ...prev, booking_id: String(res.data[0].booking_id) }));
        }
      } else {
        setBookings([
          { booking_id: 1, guest_name: 'Aarav Sharma (Coorg Stay)' },
          { booking_id: 3, guest_name: 'Anita Desai (Ooty Stay)' },
          { booking_id: 6, guest_name: 'Chloe Dubois (Alleppey Stay)' },
        ]);
      }
    } catch (err) {
      setBookings([
        { booking_id: 1, guest_name: 'Aarav Sharma (Coorg Stay)' },
        { booking_id: 3, guest_name: 'Anita Desai (Ooty Stay)' },
        { booking_id: 6, guest_name: 'Chloe Dubois (Alleppey Stay)' },
      ]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    const targetBooking = bookings.find(b => String(b.booking_id) === String(newPay.booking_id)) || bookings[0];

    const payObj = {
      payment_id: Date.now() % 10000,
      booking_id: parseInt(newPay.booking_id),
      guest_name: targetBooking?.guest_name?.split('(')[0]?.trim() || 'VIP Guest',
      amount: parseFloat(newPay.amount),
      method: newPay.method,
      payment_date: newPay.payment_date
    };

    try {
      await API.post('/payments', payObj);
      setShowModal(false);
      fetchPayments();
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('kaveri_custom_payments') || '[]');
      localStorage.setItem('kaveri_custom_payments', JSON.stringify([payObj, ...stored]));
      setShowModal(false);
      fetchPayments();
    }
  };

  const getMethodBadge = (m) => {
    switch (m) {
      case 'credit_card':
        return <span className="badge-gold text-[10px]">Card (Credit / Debit)</span>;
      case 'debit_card':
        return <span className="badge-sky text-[10px]">Debit Card</span>;
      case 'upi':
        return <span className="badge-emerald text-[10px]">UPI Instant</span>;
      case 'bank_transfer':
        return <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">Bank Transfer</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold uppercase">{m}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d4af37]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] uppercase font-bold text-[#f3e5ab] mb-2">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            Fiscal & Settlement Audits
          </div>
          <h1 className="font-serif text-3xl font-medium text-white tracking-tight">
            Financial Transactions & Billing
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Reconcile guest deposits, room charges, and luxury settlement channels across 30 transactions
          </p>
        </div>
        <button
          onClick={openModal}
          className="btn-gold px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-bold self-start shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span>Record Settlement</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-4 border border-[#d4af37]/15">
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="luxury-input min-w-[220px] w-auto"
        >
          <option value="">All Settlement Channels (30 Payments)</option>
          <option value="credit_card" style={{ background: '#0e1017' }}>Credit / Debit Card</option>
          <option value="upi" style={{ background: '#0e1017' }}>UPI Instant Settlement</option>
          <option value="bank_transfer" style={{ background: '#0e1017' }}>Bank Wire Transfer</option>
          <option value="cash" style={{ background: '#0e1017' }}>Cash at Reception</option>
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
                  <th className="px-6 py-4">Txn ID</th>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Guest Profile</th>
                  <th className="px-6 py-4">Settled Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      #{p.payment_id}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-[#d4af37]">
                      Booking #{p.booking_id}
                    </td>
                    <td className="px-6 py-4 font-serif font-semibold text-white text-base">
                      {p.guest_name || 'VIP Guest'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[#f3e5ab] text-base">
                      ₹{parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      {getMethodBadge(p.method)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {p.payment_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="luxury-card rounded-3xl w-full max-w-md p-8 border border-[#d4af37]/30 space-y-5 animate-fadeInUp shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-4">
              <h3 className="font-serif text-2xl font-medium text-white">Record Transaction</h3>
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
                  Target Booking
                </label>
                <select
                  required
                  value={newPay.booking_id}
                  onChange={(e) => setNewPay({ ...newPay, booking_id: e.target.value })}
                  className="luxury-input"
                >
                  {bookings.map(b => (
                    <option key={b.booking_id} value={b.booking_id} style={{ background: '#0e1017' }}>
                      Booking #{b.booking_id} &bull; {b.guest_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  Payment Amount (₹ INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={newPay.amount}
                  onChange={(e) => setNewPay({ ...newPay, amount: e.target.value })}
                  className="luxury-input"
                  placeholder="13500.00"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  Settlement Method
                </label>
                <select
                  value={newPay.method}
                  onChange={(e) => setNewPay({ ...newPay, method: e.target.value })}
                  className="luxury-input"
                >
                  <option value="credit_card" style={{ background: '#0e1017' }}>Credit Card (AMEX / Visa Infinite)</option>
                  <option value="debit_card" style={{ background: '#0e1017' }}>Debit Card</option>
                  <option value="upi" style={{ background: '#0e1017' }}>UPI Instant Transfer</option>
                  <option value="bank_transfer" style={{ background: '#0e1017' }}>Bank Wire Transfer</option>
                  <option value="cash" style={{ background: '#0e1017' }}>Cash at Reception</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1.5">
                  Settlement Date
                </label>
                <input
                  type="date"
                  required
                  value={newPay.payment_date}
                  onChange={(e) => setNewPay({ ...newPay, payment_date: e.target.value })}
                  className="luxury-input"
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
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
