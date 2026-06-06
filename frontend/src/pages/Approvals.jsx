import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function Approvals() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksModal, setRemarksModal] = useState(null);
  const [remarks, setRemarks] = useState('');

  const fetchPending = () => {
    API.get('/quotations', { params: { status: 'pending' } })
      .then(({ data }) => setQuotations(data.quotations))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    try {
      await API.put(`/quotations/${id}/approve`, { remarks });
      setRemarksModal(null);
      setRemarks('');
      fetchPending();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/quotations/${id}/reject`, { remarks });
      setRemarksModal(null);
      setRemarks('');
      fetchPending();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Approvals</h1>
        <p className="text-sm text-green-400 font-light mt-1">Review and approve quotations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-\[#9A8678\]/30 border-t-\[#9A8678\] rounded-full animate-spin" /></div>
      ) : quotations.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-green-400 text-sm">All caught up! No pending approvals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {quotations.map(q => (
            <div key={q._id} className="glass-panel rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-base font-semibold text-white">{q.quotationNumber}</p>
                  <p className="text-xs text-green-400 mt-0.5">{q.rfq?.rfqNumber} — {q.rfq?.title}</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-amber-500/10 text-amber-400">Pending</span>
              </div>

              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 text-sm font-semibold flex-shrink-0">
                  {q.vendor?.name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{q.vendor?.name}</p>
                  <p className="text-[10px] text-green-400">{q.vendor?.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-green-400">Total Amount</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(q.totalAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-400">Delivery</p>
                  <p className="text-sm text-green-400">{q.deliveryTimeline || '—'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setRemarksModal({ id: q._id, action: 'approve' })}
                  className="flex-1 py-2.5 bg-green-500/10 hover:bg-green-600/20 text-green-400 text-xs font-semibold rounded-xl border border-\[#9A8678\]/20 transition-all">
                  Approve
                </button>
                <button onClick={() => setRemarksModal({ id: q._id, action: 'reject' })}
                  className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/20 transition-all">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remarks Modal */}
      {remarksModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setRemarksModal(null)}>
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">
              {remarksModal.action === 'approve' ? 'Approve' : 'Reject'} Quotation
            </h2>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} placeholder="Add remarks (optional)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all resize-none mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setRemarksModal(null)} className="px-5 py-2.5 text-sm text-green-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => remarksModal.action === 'approve' ? handleApprove(remarksModal.id) : handleReject(remarksModal.id)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  remarksModal.action === 'approve' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-400 text-white'
                }`}>
                Confirm {remarksModal.action === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
