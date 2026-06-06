const express = require('express');
const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [{ invoiceNumber: { $regex: search, $options: 'i' } }];
    }
    if (req.user.role === 'vendor') {
      const vendorRecord = await Vendor.findOne({ email: req.user.email });
      if (vendorRecord) {
        query.vendor = vendorRecord._id;
      } else {
        return res.json({ invoices: [], total: 0, page: 1, pages: 0 });
      }
    }
    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('vendor', 'name email gstNumber')
      .populate('purchaseOrder', 'poNumber totalAmount')
      .populate('createdBy', 'name email company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ invoices, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendor', 'name email contactPerson phone address gstNumber panNumber bankDetails')
      .populate('purchaseOrder', 'poNumber deliveryDate')
      .populate('createdBy', 'name email company phone');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (req.user.role === 'vendor') {
      const vendorRecord = await Vendor.findOne({ email: req.user.email });
      if (!vendorRecord || invoice.vendor._id.toString() !== vendorRecord._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this invoice' });
      }
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('procurement_officer'), async (req, res) => {
  try {
    const { purchaseOrderId, dueDate, notes } = req.body;
    const po = await PurchaseOrder.findById(purchaseOrderId).populate('vendor');
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    const invoice = await Invoice.create({
      purchaseOrder: po._id, vendor: po.vendor._id, items: po.items,
      subtotal: po.subtotal, taxRate: po.taxRate, totalTax: po.taxAmount,
      cgst: po.taxAmount / 2, sgst: po.taxAmount / 2, totalAmount: po.totalAmount,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: notes || '', status: 'draft', createdBy: req.user._id,
    });
    await ActivityLog.create({
      user: req.user._id, action: 'invoice_created', entityType: 'invoice',
      entityId: invoice._id, description: `Invoice ${invoice.invoiceNumber} was generated from ${po.poNumber}`,
    });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('procurement_officer'), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true })
      .populate('vendor', 'name email');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const actionMap = { paid: 'invoice_paid', sent: 'invoice_sent' };
    const action = actionMap[req.body.status] || 'invoice_sent';
    await ActivityLog.create({
      user: req.user._id, action, entityType: 'invoice',
      entityId: invoice._id, description: `Invoice ${invoice.invoiceNumber} status updated to ${invoice.status}`,
    });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/send-email', protect, authorize('procurement_officer'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('vendor', 'name email');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    invoice.emailSent = true;
    invoice.status = 'sent';
    await invoice.save();
    await ActivityLog.create({
      user: req.user._id, action: 'invoice_sent', entityType: 'invoice',
      entityId: invoice._id, description: `Invoice ${invoice.invoiceNumber} was sent to ${invoice.vendor.email}`,
    });
    res.json({ message: `Invoice sent to ${invoice.vendor.email}`, invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
