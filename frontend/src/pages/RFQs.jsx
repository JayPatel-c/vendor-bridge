import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  draft: 'bg-gray-500/10 text-green-400', sent: 'bg-green-500/10 text-green-400',
  'in-progress': 'bg-amber-500/10 text-amber-400', completed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
};
const priorityColors = {
  low: 'text-green-400', medium: 'text-green-400', high: 'text-amber-400', urgent: 'text-red-400',
};

export default function RFQs() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/rfqs', { params: { search } })
      .then(({ data }) => setRfqs(data.rfqs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">RFQs</h1>
          <p className="text-sm text-green-400 font-light mt-1">Request for Quotations</p>
        </div>
        {user?.role === 'procurement_officer' && (
          <Link to="/rfqs/new" className="inline-flex px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-all">
            + Create RFQ
          </Link>
        )}
      </div>

      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search RFQs..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/30 transition-all" />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">RFQ</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden sm:table-cell">Vendors</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden md:table-cell">Deadline</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden lg:table-cell">Priority</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Status</th>
                <th className="text-right text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600 text-sm">Loading...</td></tr>
              ) : rfqs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600 text-sm">No RFQs found</td></tr>
              ) : rfqs.map(rfq => (
                <tr key={rfq._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{rfq.title}</p>
                    <p className="text-xs text-green-400">{rfq.rfqNumber}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-xs text-green-400">{rfq.vendors?.length || 0} vendors</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-xs text-green-400">{formatDate(rfq.deadline)}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className={`text-xs font-medium capitalize ${priorityColors[rfq.priority]}`}>{rfq.priority}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColors[rfq.status]}`}>{rfq.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/quotations?rfq=${rfq._id}`} className="text-xs text-green-400 hover:text-green-400 transition-colors">View Quotations</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
