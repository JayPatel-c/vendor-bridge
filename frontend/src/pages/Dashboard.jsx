import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, icon, color }) => (
  <div className="glass-panel rounded-2xl p-5 sm:p-6 group hover:border-\[#9A8678\]/10 transition-all duration-300">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
    </div>
    <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</p>
    <p className="text-xs text-green-400 font-light mt-1 uppercase tracking-wider">{label}</p>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await API.get('/reports/dashboard');
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-\[#9A8678\]/30 border-t-\[#9A8678\] rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-green-400 font-light mt-1">Welcome back, {user?.name}. Today's overview.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/rfqs/new" className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-all">
            + New RFQ
          </Link>
          <Link to="/vendors" className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-xl border border-white/10 transition-all">
            View Vendors
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Vendors" value={stats.activeVendors || 0}
          color="bg-green-500/10 text-green-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
        />
        <StatCard label="Open RFQs" value={stats.openRfqs || 0}
          color="bg-green-500/10 text-green-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
        />
        <StatCard label="Pending Approvals" value={stats.pendingApprovals || 0}
          color="bg-amber-500/10 text-amber-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="Total Spend" value={formatCurrency(stats.totalSpend || 0)}
          color="bg-purple-500/10 text-purple-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
        />
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Orders */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white">Recent Purchase Orders</h3>
            <Link to="/purchase-orders" className="text-xs text-green-400 hover:text-green-400 transition-colors">View all →</Link>
          </div>
          {data?.recentPOs?.length > 0 ? (
            <div className="space-y-3">
              {data.recentPOs.map(po => (
                <div key={po._id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{po.poNumber}</p>
                    <p className="text-xs text-green-400">{po.vendor?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{formatCurrency(po.totalAmount)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      po.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                      po.status === 'issued' ? 'bg-green-500/10 text-green-400' :
                      'bg-gray-500/10 text-green-400'
                    }`}>{po.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center py-8">No purchase orders yet</p>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white">Recent Invoices</h3>
            <Link to="/invoices" className="text-xs text-green-400 hover:text-green-400 transition-colors">View all →</Link>
          </div>
          {data?.recentInvoices?.length > 0 ? (
            <div className="space-y-3">
              {data.recentInvoices.map(inv => (
                <div key={inv._id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{inv.invoiceNumber}</p>
                    <p className="text-xs text-green-400">{inv.vendor?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{formatCurrency(inv.totalAmount)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      inv.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                      inv.status === 'sent' ? 'bg-green-500/10 text-green-400' :
                      inv.status === 'overdue' ? 'bg-red-500/10 text-red-400' :
                      'bg-gray-500/10 text-green-400'
                    }`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center py-8">No invoices yet</p>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {data?.categoryBreakdown?.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-5">Vendor Categories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {data.categoryBreakdown.map(cat => (
              <div key={cat._id} className="bg-white/[0.02] rounded-xl p-4 text-center border border-white/5">
                <p className="text-xl font-bold text-white">{cat.count}</p>
                <p className="text-[10px] text-green-400 uppercase tracking-wider mt-1">{cat._id?.replace('-', ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
