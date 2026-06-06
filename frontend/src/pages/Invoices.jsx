import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  draft: 'bg-gray-500/10 text-green-400',
  sent: 'bg-green-500/10 text-green-400',
  paid: 'bg-green-500/10 text-green-400',
  overdue: 'bg-red-500/10 text-red-400',
  cancelled: 'bg-amber-500/10 text-amber-400',
};

export default function Invoices() {
  const { user } = useAuth();
  const isPO = user?.role === 'procurement_officer';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = () => {
    API.get('/invoices', { params: { search } })
      .then(({ data }) => setInvoices(data.invoices))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, [search]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/invoices/${id}`, { status });
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleSendEmail = async (id) => {
    try {
      await API.post(`/invoices/${id}/send-email`);
      alert('Invoice marked as sent successfully!');
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending email');
    }
  };

  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Invoices</h1>
          <p className="text-sm text-green-400 font-light mt-1">Manage billing and payments</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Invoices..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-\[#9A8678\]/30 transition-all" />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Invoice #</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden sm:table-cell">Vendor</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4 hidden md:table-cell">PO Ref</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Amount</th>
                <th className="text-left text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Status</th>
                <th className="text-right text-[10px] font-medium text-green-400 uppercase tracking-wider px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600 text-sm">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600 text-sm">No Invoices found</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{inv.invoiceNumber}</p>
                    <p className="text-[10px] text-green-400">Due: {formatDate(inv.dueDate)}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <p className="text-sm text-green-400">{inv.vendor?.name}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-green-400">{inv.purchaseOrder?.poNumber}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{formatCurrency(inv.totalAmount)}</p>
                  </td>
                  <td className="px-5 py-4">
                    {isPO ? (
                      <select 
                        value={inv.status} 
                        onChange={(e) => handleStatusUpdate(inv._id, e.target.value)}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-medium focus:outline-none appearance-none cursor-pointer ${statusColors[inv.status]}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${statusColors[inv.status]}`}>{inv.status}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                       <button onClick={() => setSelectedInvoice(inv._id)} className="text-xs text-green-400 hover:text-white transition-colors">View</button>
                       {isPO && !inv.emailSent && inv.status !== 'cancelled' && (
                         <button onClick={() => handleSendEmail(inv._id)} className="text-xs text-green-400 hover:text-indigo-300 transition-colors border border-indigo-500/20 px-2 py-1 rounded flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                             Send
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedInvoice && (
        <InvoiceDetailsModal invId={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
}

function InvoiceDetailsModal({ invId, onClose }) {
  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/invoices/${invId}`)
      .then(({ data }) => setInv(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [invId]);

  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) return (
     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-\[#9A8678\]/30 border-t-\[#9A8678\] rounded-full animate-spin" />
     </div>
  );

  if (!inv) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-panel bg-white text-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Printable Invoice Format */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 15h20" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 19V5M17 19V5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 5c2.5 6 7.5 6 10 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 5C4 7 2 11 2 15M17 5c3 2 5 6 5 10" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v5M9.5 8v7M14.5 8v7" />
                    </svg>
                    <span className="text-xl font-bold tracking-tight text-gray-800">VendorBridge</span>
                </div>
                <p className="text-sm text-green-400">Procurement & Vendor Management</p>
            </div>
            <div className="text-right">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight uppercase">Invoice</h2>
                <p className="text-sm text-green-400 font-medium mt-1">#{inv.invoiceNumber}</p>
                <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${statusColors[inv.status].replace('/10', '/20')}`}>{inv.status.toUpperCase()}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Billed To</h3>
                <p className="text-sm font-bold text-gray-800">{inv.vendor?.name}</p>
                <p className="text-sm text-gray-600">{inv.vendor?.email}</p>
                <p className="text-sm text-gray-600">{inv.vendor?.address?.street}, {inv.vendor?.address?.city}</p>
                <p className="text-sm text-gray-600">GSTIN: {inv.vendor?.gstNumber}</p>
                <p className="text-sm text-gray-600">PAN: {inv.vendor?.panNumber}</p>
            </div>
            <div className="text-right">
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Invoice Details</h3>
                <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {formatDate(inv.createdAt)}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Due Date:</span> {formatDate(inv.dueDate)}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">PO Ref:</span> {inv.purchaseOrder?.poNumber}</p>
            </div>
        </div>

        <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700">Item Description</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-700">Qty</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-700">Rate</th>
                        <th className="text-right px-4 py-3 font-semibold text-gray-700">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {inv.items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0">
                            <td className="px-4 py-3 text-gray-800">{item.product}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-right text-gray-800 font-medium">{formatCurrency(item.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="flex justify-between items-start mb-8">
            <div className="max-w-xs">
                {inv.vendor?.bankDetails?.accountNumber && (
                    <>
                        <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Payment Info</h3>
                        <p className="text-xs text-gray-600 font-medium">Bank: {inv.vendor?.bankDetails?.bankName}</p>
                        <p className="text-xs text-gray-600">A/C: {inv.vendor?.bankDetails?.accountNumber}</p>
                        <p className="text-xs text-gray-600">IFSC: {inv.vendor?.bankDetails?.ifscCode}</p>
                    </>
                )}
            </div>
            <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(inv.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>CGST ({(inv.taxRate/2)}%)</span>
                    <span>{formatCurrency(inv.cgst)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>SGST ({(inv.taxRate/2)}%)</span>
                    <span>{formatCurrency(inv.sgst)}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(inv.totalAmount)}</span>
                </div>
            </div>
        </div>

        {inv.notes && (
            <div className="mb-6 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-sm text-gray-600">{inv.notes}</p>
            </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8 print:hidden">
            <button onClick={() => window.print()} className="px-5 py-2.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print PDF
            </button>
            <button onClick={onClose} className="px-5 py-2.5 text-sm bg-gray-800 text-white hover:bg-gray-900 rounded-xl transition-colors font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}
