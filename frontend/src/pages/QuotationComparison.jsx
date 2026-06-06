import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function QuotationComparison() {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ quotations: [], rfq: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/quotations/compare/${rfqId}`)
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [rfqId]);

  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const lowestPrice = data.quotations.length > 0 ? Math.min(...data.quotations.map(q => q.totalAmount)) : 0;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-\[#9A8678\]/30 border-t-\[#9A8678\] rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="text-xs text-green-400 hover:text-white transition-colors mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Quotation Comparison</h1>
        <p className="text-sm text-green-400 font-light mt-1">{data.rfq?.rfqNumber} — {data.rfq?.title}</p>
      </div>

      {data.quotations.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <p className="text-green-400">No quotations received for this RFQ yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-flex gap-4 pb-4 min-w-full">
            {data.quotations.map((q) => (
              <div key={q._id} className={`glass-panel rounded-2xl p-6 min-w-[280px] sm:min-w-[320px] flex-1 relative ${
                q.totalAmount === lowestPrice ? 'border-\[#9A8678\]/30 glow-green' : ''
              }`}>
                {q.totalAmount === lowestPrice && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Lowest Price
                  </div>
                )}

                {/* Vendor Info */}
                <div className="mb-6">
                  <p className="text-lg font-bold text-white">{q.vendor?.name}</p>
                  <p className="text-xs text-green-400">{q.vendor?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i <= (q.vendor?.rating || 0) ? 'text-amber-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[10px] text-green-400">{q.vendor?.category}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-6">
                  {q.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm text-white">{item.product}</p>
                        <p className="text-[10px] text-green-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-white">{formatCurrency(item.total)}</p>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-green-400">Total</span>
                    <span className="text-xl font-bold text-white">{formatCurrency(q.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-xs text-green-400">Delivery</span>
                    <span className="text-xs text-green-400">{q.deliveryTimeline || '—'}</span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                    q.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                    q.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>{q.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
