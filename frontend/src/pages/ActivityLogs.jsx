import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entityType, setEntityType] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    API.get('/activity', { params: { page, entityType, limit: 30 } })
      .then(({ data }) => {
        setLogs(data.logs);
        setTotalPages(data.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entityType]);

  const formatDate = (d) => {
    const date = new Date(d);
    return `${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Activity Logs</h1>
          <p className="text-sm text-green-400 font-light mt-1">System-wide audit trail</p>
        </div>
        <select 
          value={entityType} 
          onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/30 transition-all appearance-none"
        >
            <option value="" className="bg-[#151C1A]">All Entities</option>
            <option value="user" className="bg-[#151C1A]">Users</option>
            <option value="vendor" className="bg-[#151C1A]">Vendors</option>
            <option value="rfq" className="bg-[#151C1A]">RFQs</option>
            <option value="quotation" className="bg-[#151C1A]">Quotations</option>
            <option value="purchase_order" className="bg-[#151C1A]">Purchase Orders</option>
            <option value="invoice" className="bg-[#151C1A]">Invoices</option>
        </select>
      </div>

      <div className="glass-panel rounded-2xl p-6">
          {loading ? (
             <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-\[#9A8678\]/30 border-t-\[#9A8678\] rounded-full animate-spin" /></div>
          ) : logs.length === 0 ? (
             <p className="text-sm text-gray-600 text-center py-12">No activity logs found.</p>
          ) : (
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/5 before:to-transparent">
                 {logs.map((log) => (
                     <div key={log._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                         <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#0A0E0D] text-\[#9A8678\] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </div>
                         <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl glass-panel border border-white/5">
                             <div className="flex items-center justify-between mb-2">
                                 <p className="text-sm font-semibold text-white">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                                 <span className="text-[10px] text-green-400">{formatDate(log.createdAt)}</span>
                             </div>
                             <p className="text-sm text-white">{log.description}</p>
                             <p className="text-xs text-green-400 mt-2">By: {log.user?.name} <span className="text-[10px] uppercase bg-white/5 px-1.5 py-0.5 rounded ml-1">{log.user?.role?.replace('_', ' ')}</span></p>
                         </div>
                     </div>
                 ))}
             </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-white/5">
                  <button 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="p-2 rounded-lg bg-white/5 text-green-400 hover:text-white disabled:opacity-50 transition-colors"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-sm text-green-400">Page {page} of {totalPages}</span>
                  <button 
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="p-2 rounded-lg bg-white/5 text-green-400 hover:text-white disabled:opacity-50 transition-colors"
                  >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
              </div>
          )}
      </div>
    </div>
  );
}
