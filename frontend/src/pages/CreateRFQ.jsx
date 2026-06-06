import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function CreateRFQ() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', deadline: '', priority: 'medium', vendors: [],
    items: [{ product: '', description: '', quantity: 1, unit: 'pcs', estimatedPrice: 0 }],
  });

  useEffect(() => {
    API.get('/vendors').then(({ data }) => setVendors(data.vendors)).catch(console.error);
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { product: '', description: '', quantity: 1, unit: 'pcs', estimatedPrice: 0 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i][field] = value;
    setForm({ ...form, items });
  };

  const toggleVendor = (id) => {
    const v = form.vendors.includes(id) ? form.vendors.filter(x => x !== id) : [...form.vendors, id];
    setForm({ ...form, vendors: v });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/rfqs', form);
      navigate('/rfqs');
    } catch (err) { alert(err.response?.data?.message || 'Error creating RFQ'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create RFQ</h1>
        <p className="text-sm text-green-400 font-light mt-1">Request for Quotation — initiate a procurement workflow</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Title *</label>
              <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required placeholder="e.g. Office Supplies Q3 2026"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} placeholder="Additional details..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all resize-none" />
            </div>
            <div>
              <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Deadline *</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all appearance-none">
                <option value="low" className="bg-[#151C1A]">Low</option>
                <option value="medium" className="bg-[#151C1A]">Medium</option>
                <option value="high" className="bg-[#151C1A]">High</option>
                <option value="urgent" className="bg-[#151C1A]">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Line Items</h3>
            <button type="button" onClick={addItem} className="text-xs text-green-400 hover:text-green-400 font-medium transition-colors">+ Add Item</button>
          </div>
          {form.items.map((item, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-end p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="col-span-2 sm:col-span-4">
                <label className="block text-[10px] text-green-400 uppercase tracking-wider mb-1">Product *</label>
                <input value={item.product} onChange={(e) => updateItem(i, 'product', e.target.value)} required placeholder="Product name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-green-400 uppercase tracking-wider mb-1">Qty *</label>
                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-green-400 uppercase tracking-wider mb-1">Unit</label>
                <select value={item.unit} onChange={(e) => updateItem(i, 'unit', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all appearance-none">
                  {['pcs', 'kg', 'liters', 'boxes', 'sets', 'meters'].map(u => <option key={u} value={u} className="bg-[#151C1A]">{u}</option>)}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] text-green-400 uppercase tracking-wider mb-1">Est. Price</label>
                <input type="number" min="0" value={item.estimatedPrice} onChange={(e) => updateItem(i, 'estimatedPrice', Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
              </div>
              <div className="sm:col-span-1 flex justify-end">
                {form.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="p-2 rounded-lg hover:bg-red-500/10 text-green-400 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Vendor Selection */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Assign Vendors</h3>
          {vendors.length === 0 ? (
            <p className="text-sm text-gray-600">No vendors available. Add vendors first.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vendors.map(v => (
                <button type="button" key={v._id} onClick={() => toggleVendor(v._id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    form.vendors.includes(v._id)
                      ? 'border-\[#9A8678\]/40 bg-green-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      form.vendors.includes(v._id) ? 'border-\[#9A8678\] bg-green-500' : 'border-gray-600'
                    }`}>
                      {form.vendors.includes(v._id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{v.name}</p>
                      <p className="text-[10px] text-green-400">{v.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/rfqs')} className="px-6 py-3 text-sm text-green-400 hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50">
            {loading ? 'Creating...' : 'Create RFQ'}
          </button>
        </div>
      </form>
    </div>
  );
}
