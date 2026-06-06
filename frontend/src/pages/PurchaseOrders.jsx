import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const statusColors = {
  draft: 'bg-gray-500/10 text-green-400',
  issued: 'bg-green-500/10 text-green-400',
  acknowledged: 'bg-green-500/10 text-green-400',
  'in-transit': 'bg-amber-500/10 text-amber-400',
  delivered: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

export default function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  const fetchPOs = () => {
    API.get('/purchase-orders', { params: { search } })
      .then(({ data }) => setPurchaseOrders(data.purchaseOrders))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPOs();
  }, [search]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/purchase-orders/${id}`, { status });
      fetchPOs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleGenerateInvoice = async (poId) => {
    try {
      const { data } = await API.post('/invoices', { purchaseOrderId: poId });
      alert(`Invoice ${data.invoiceNumber} generated successfully!`);
      // Optionally redirect to invoices page
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating invoice');
    }
  };

  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-green-400 font-light mt-1">Manage POs and track deliveries</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search POs..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/30 transition-all" />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">PO Number</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden sm:table-cell">Vendor</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden md:table-cell">RFQ Ref</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Amount</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Status</th>
                <th className="text-right text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600 text-sm">Loading...</td></tr>
              ) : purchaseOrders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600 text-sm">No Purchase Orders found</td></tr>
              ) : purchaseOrders.map(po => (
                <tr key={po._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{po.poNumber}</p>
                    <p className="text-[10px] text-green-400">{formatDate(po.createdAt)}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <p className="text-sm text-green-400">{po.vendor?.name}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-green-400">{po.rfq?.rfqNumber}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{formatCurrency(po.totalAmount)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select 
                      value={po.status} 
                      onChange={(e) => handleStatusUpdate(po._id, e.target.value)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-medium focus:outline-none appearance-none cursor-pointer ${statusColors[po.status]}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="issued">Issued</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in-transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                       <button onClick={() => { setSelectedPO(po._id); setShowModal(true); }} className="text-xs text-green-400 hover:text-white transition-colors">View</button>
                       {po.status === 'delivered' && (
                         <button onClick={() => handleGenerateInvoice(po._id)} className="text-xs text-green-400 hover:text-green-400 transition-colors border border-\[#9A8678\]/20 px-2 py-1 rounded">Generate Invoice</button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && selectedPO && (
        <PODetailsModal poId={selectedPO} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

function PODetailsModal({ poId, onClose }) {
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/purchase-orders/${poId}`)
      .then(({ data }) => setPo(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [poId]);

  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) return (
     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-\[#9A8678\]/30 border-t-\[#9A8678\] rounded-full animate-spin" />
     </div>
  );

  if (!po) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-panel rounded-2xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{po.poNumber}</h2>
              <p className="text-sm text-green-400">Date: {formatDate(po.createdAt)}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[po.status]}`}>{po.status}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
                <h3 className="text-xs text-green-400 uppercase tracking-wider mb-2">Vendor Details</h3>
                <p className="text-sm font-medium text-white">{po.vendor?.name}</p>
                <p className="text-sm text-green-400">{po.vendor?.email}</p>
                <p className="text-sm text-green-400">{po.vendor?.phone}</p>
                <p className="text-sm text-green-400">GST: {po.vendor?.gstNumber}</p>
            </div>
            <div>
                <h3 className="text-xs text-green-400 uppercase tracking-wider mb-2">Shipping Details</h3>
                <p className="text-sm text-white">{po.shippingAddress || 'Not specified'}</p>
                <p className="text-sm text-green-400 mt-2">Delivery Date: {formatDate(po.deliveryDate)}</p>
                <p className="text-sm text-green-400 mt-2">RFQ Ref: {po.rfq?.rfqNumber}</p>
            </div>
        </div>

        <div className="mb-6">
             <h3 className="text-xs text-green-400 uppercase tracking-wider mb-2">Line Items</h3>
             <div className="border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-white/[0.02] border-b border-white/10">
                        <tr>
                            <th className="text-left px-4 py-2 font-medium text-green-400">Item</th>
                            <th className="text-right px-4 py-2 font-medium text-green-400">Qty</th>
                            <th className="text-right px-4 py-2 font-medium text-green-400">Unit Price</th>
                            <th className="text-right px-4 py-2 font-medium text-green-400">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {po.items.map((item, i) => (
                            <tr key={i} className="border-b border-white/5 last:border-0">
                                <td className="px-4 py-3 text-white">{item.product}</td>
                                <td className="px-4 py-3 text-right text-white">{item.quantity}</td>
                                <td className="px-4 py-3 text-right text-white">{formatCurrency(item.unitPrice)}</td>
                                <td className="px-4 py-3 text-right text-white font-medium">{formatCurrency(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>

        <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-green-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(po.subtotal)}</span>
                </div>
                <div className="flex justify-between text-green-400">
                    <span>Tax ({po.taxRate}%)</span>
                    <span>{formatCurrency(po.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>{formatCurrency(po.totalAmount)}</span>
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button onClick={onClose} className="px-5 py-2.5 text-sm bg-white/5 text-white hover:text-white hover:bg-white/10 rounded-xl transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}
