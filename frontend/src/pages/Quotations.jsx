import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: 'bg-amber-500/10 text-amber-400', 'under-review': 'bg-green-500/10 text-green-400',
  approved: 'bg-green-500/10 text-green-400', rejected: 'bg-red-500/10 text-red-400',
  expired: 'bg-gray-500/10 text-green-400',
};

export default function Quotations() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const rfqId = searchParams.get('rfq');
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    rfq: rfqId || '', vendor: '', deliveryTimeline: '', validUntil: '', notes: '',
    items: [{ product: '', quantity: 1, unitPrice: 0, total: 0 }],
  });

  const fetchQuotations = () => {
    const params = rfqId ? { rfq: rfqId } : {};
    API.get('/quotations', { params })
      .then(({ data }) => setQuotations(data.quotations))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotations();
    API.get('/rfqs').then(({ data }) => setRfqs(data.rfqs)).catch(console.error);
    if (user?.role !== 'vendor') {
      API.get('/vendors').then(({ data }) => setVendors(data.vendors)).catch(console.error);
    }
  }, [rfqId]);

  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      items[i].total = items[i].quantity * items[i].unitPrice;
    }
    setForm({ ...form, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalAmount = form.items.reduce((s, i) => s + i.total, 0);
    try {
      await API.post('/quotations', { ...form, totalAmount });
      setShowModal(false);
      fetchQuotations();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Quotations</h1>
          <p className="text-sm text-green-400 font-light mt-1">{rfqId ? 'Quotations for this RFQ' : 'All vendor quotations'}</p>
        </div>
        <div className="flex gap-3">
          {rfqId && user?.role === 'procurement_officer' && (
            <Link to={`/quotations/compare/${rfqId}`} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-xl border border-white/10 transition-all">
              Compare Quotations
            </Link>
          )}
          {user?.role === 'vendor' && (
            <button onClick={() => setShowModal(true)} className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-all">
              + Submit Quotation
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Quotation</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden sm:table-cell">Vendor</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden md:table-cell">RFQ</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Amount</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-600 text-sm">Loading...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-600 text-sm">No quotations found</td></tr>
              ) : quotations.map(q => (
                <tr key={q._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{q.quotationNumber}</p>
                    <p className="text-xs text-green-400">{q.deliveryTimeline || '—'}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <p className="text-sm text-green-400">{q.vendor?.name}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-green-400">{q.rfq?.rfqNumber}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{formatCurrency(q.totalAmount)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColors[q.status]}`}>{q.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Quotation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="glass-panel rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">Submit Quotation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">RFQ *</label>
                  <select value={form.rfq} onChange={(e) => setForm({...form, rfq: e.target.value})} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all appearance-none">
                    <option value="" className="bg-[#151C1A]">Select RFQ</option>
                    {rfqs.map(r => <option key={r._id} value={r._id} className="bg-[#151C1A]">{r.rfqNumber} — {r.title}</option>)}
                  </select>
                </div>
                {user?.role !== 'vendor' && (
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Vendor *</label>
                  <select value={form.vendor} onChange={(e) => setForm({...form, vendor: e.target.value})} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all appearance-none">
                    <option value="" className="bg-[#151C1A]">Select Vendor</option>
                    {vendors.map(v => <option key={v._id} value={v._id} className="bg-[#151C1A]">{v.name}</option>)}
                  </select>
                </div>
                )}
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Delivery Timeline</label>
                  <input value={form.deliveryTimeline} onChange={(e) => setForm({...form, deliveryTimeline: e.target.value})} placeholder="e.g. 15 days"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Valid Until</label>
                  <input type="date" value={form.validUntil} onChange={(e) => setForm({...form, validUntil: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-green-400 uppercase tracking-wider">Items</label>
                  <button type="button" onClick={() => setForm({...form, items: [...form.items, { product: '', quantity: 1, unitPrice: 0, total: 0 }]})}
                    className="text-xs text-green-400 hover:text-green-400">+ Add</button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                    <input value={item.product} onChange={(e) => updateItem(i, 'product', e.target.value)} placeholder="Product" required
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40" />
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} required
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40" />
                    <input type="number" min="0" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} placeholder="Price" required
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-400">₹{item.total}</span>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => setForm({...form, items: form.items.filter((_, idx) => idx !== i)})} className="text-gray-600 hover:text-red-400">×</button>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-right text-sm font-medium text-white mt-2">Total: {formatCurrency(form.items.reduce((s, i) => s + i.total, 0))}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm text-green-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
