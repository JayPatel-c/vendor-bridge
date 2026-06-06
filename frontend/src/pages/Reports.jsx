import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/reports/analytics')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-\[#9A8678\]/30 border-t-\[#9A8678\] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-green-400 font-light mt-1">Insights into procurement performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors by Spend */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-5">Top Vendors by Spend</h3>
          {data?.vendorPerformance?.length > 0 ? (
            <div className="space-y-4">
              {data.vendorPerformance.map((vp, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-medium text-green-400">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{vp.vendorName}</p>
                      <p className="text-[10px] text-green-400">{vp.poCount} Orders • {vp.vendorRating}⭐ Rating</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{formatCurrency(vp.totalValue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-sm text-gray-600 text-center py-8">No vendor data available.</p>
          )}
        </div>

        {/* RFQ Status Distribution */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-5">RFQ Status Distribution</h3>
          {data?.rfqStatusDist?.length > 0 ? (
            <div className="space-y-4">
               {data.rfqStatusDist.map(st => (
                 <div key={st._id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm font-medium capitalize text-white">{st._id}</span>
                    <span className="text-lg font-bold text-white">{st.count}</span>
                 </div>
               ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center py-8">No RFQ data available.</p>
          )}
        </div>
        
        {/* Monthly RFQs Trend */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
            <h3 className="text-base font-semibold text-white mb-5">Monthly RFQ Volume (Last 6 Months)</h3>
            {data?.monthlyRfqs?.length > 0 ? (
                <div className="flex items-end gap-2 h-48 mt-8">
                    {data.monthlyRfqs.map((m, i) => {
                        const maxCount = Math.max(...data.monthlyRfqs.map(x => x.count));
                        const heightPercent = Math.max((m.count / maxCount) * 100, 5); // min 5%
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                                <div className="absolute -top-8 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {m.count} RFQs
                                </div>
                                <div 
                                    className="w-full max-w-[40px] bg-green-500/40 hover:bg-green-600 rounded-t-md transition-all"
                                    style={{ height: `${heightPercent}%` }}
                                ></div>
                                <span className="text-[10px] text-green-400 mt-2">{m._id}</span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm text-gray-600 text-center py-8">No monthly trend data available.</p>
            )}
        </div>
      </div>
    </div>
  );
}
