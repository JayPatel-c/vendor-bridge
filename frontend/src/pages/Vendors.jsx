import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  active: 'bg-green-500/10 text-green-400',
  inactive: 'bg-gray-500/10 text-green-400',
  blacklisted: 'bg-red-500/10 text-red-400',
  pending: 'bg-amber-500/10 text-amber-400',
};

const categoryLabels = {
  'raw-materials': 'Raw Materials', packaging: 'Packaging', logistics: 'Logistics',
  services: 'Services', technology: 'Technology', other: 'Other',
};

export default function Vendors() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', contactPerson: '', phone: '', category: 'other', gstNumber: '', address: { city: '', state: '', country: 'India' } });

  const fetchVendors = async () => {
    try {
      const { data } = await API.get('/vendors', { params: { search } });
      setVendors(data.vendors);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVendors(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/vendors/${editing}`, form);
      } else {
        await API.post('/vendors', form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', email: '', contactPerson: '', phone: '', category: 'other', gstNumber: '', address: { city: '', state: '', country: 'India' } });
      fetchVendors();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (v) => {
    setEditing(v._id);
    setForm({ name: v.name, email: v.email, contactPerson: v.contactPerson, phone: v.phone, category: v.category, gstNumber: v.gstNumber || '', address: v.address || { city: '', state: '', country: 'India' } });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vendor?')) return;
    await API.delete(`/vendors/${id}`);
    fetchVendors();
  };

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Vendors</h1>
          <p className="text-sm text-green-400 font-light mt-1">Manage your supplier network</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditing(null); setForm({ name: '', email: '', contactPerson: '', phone: '', category: 'other', gstNumber: '', address: { city: '', state: '', country: 'India' } }); setShowModal(true); }}
            className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-all">
            + Add Vendor
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/30 transition-all" />
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Vendor</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden md:table-cell">Contact</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden sm:table-cell">Category</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Status</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden lg:table-cell">Rating</th>
                {isAdmin && <th className="text-right text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600 text-sm">Loading...</td></tr>
              ) : vendors.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600 text-sm">No vendors found</td></tr>
              ) : vendors.map(v => (
                <tr key={v._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{v.name}</p>
                    <p className="text-xs text-green-400">{v.email}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-sm text-green-400">{v.contactPerson || '—'}</p>
                    <p className="text-xs text-gray-600">{v.phone || ''}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-xs text-green-400">{categoryLabels[v.category] || v.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColors[v.status]}`}>{v.status}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">{renderStars(v.rating)}</td>
                  {isAdmin && (
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(v)} className="p-1.5 rounded-lg hover:bg-white/5 text-green-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      </button>
                      <button onClick={() => handleDelete(v._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-green-400 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="glass-panel rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">{editing ? 'Edit Vendor' : 'Add New Vendor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Name *</label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Contact Person</label>
                  <input value={form.contactPerson} onChange={(e) => setForm({...form, contactPerson: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all appearance-none">
                    {Object.entries(categoryLabels).map(([k,v]) => <option key={k} value={k} className="bg-[#151C1A]">{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">GST Number</label>
                  <input value={form.gstNumber} onChange={(e) => setForm({...form, gstNumber: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">City</label>
                  <input value={form.address?.city || ''} onChange={(e) => setForm({...form, address: {...form.address, city: e.target.value}})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">State</label>
                  <input value={form.address?.state || ''} onChange={(e) => setForm({...form, address: {...form.address, state: e.target.value}})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-green-400 uppercase tracking-wider mb-1.5">Country</label>
                  <input value={form.address?.country || ''} onChange={(e) => setForm({...form, address: {...form.address, country: e.target.value}})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-\[#9A8678\]/40 transition-all" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm text-green-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-all">{editing ? 'Update' : 'Add Vendor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
