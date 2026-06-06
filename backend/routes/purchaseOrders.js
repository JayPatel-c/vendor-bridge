const express = require('express');
const PurchaseOrder = require('../models/PurchaseOrder');
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/purchase-orders
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [{ poNumber: { $regex: search, $options: 'i' } }];
    }

    const total = await PurchaseOrder.countDocuments(query);
    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('vendor', 'name email')
      .populate('quotation', 'quotationNumber totalAmount')
      .populate('rfq', 'title rfqNumber')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ purchaseOrders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/purchase-orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('vendor', 'name email contactPerson phone address gstNumber')
      .populate('quotation', 'quotationNumber')
      .populate('rfq', 'title rfqNumber')
      .populate('createdBy', 'name email company');
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/purchase-orders — create from approved quotation
router.post('/', protect, async (req, res) => {
  try {
    const { quotationId, deliveryDate, shippingAddress, terms } = req.body;

    const quotation = await Quotation.findById(quotationId).populate('vendor rfq');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    if (quotation.status !== 'approved') {
      return res.status(400).json({ message: 'Quotation must be approved first' });
    }

    const subtotal = quotation.totalAmount;
    const taxRate = 18;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const po = await PurchaseOrder.create({
      quotation: quotation._id,
      rfq: quotation.rfq._id,
      vendor: quotation.vendor._id,
      items: quotation.items,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      deliveryDate: deliveryDate || null,
      shippingAddress: shippingAddress || '',
      terms: terms || '',
      status: 'issued',
      createdBy: req.user._id,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'po_created',
      entityType: 'purchase_order',
      entityId: po._id,
      description: `Purchase Order ${po.poNumber} was created from ${quotation.quotationNumber}`,
    });

    res.status(201).json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/purchase-orders/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('vendor', 'name email');
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'po_updated',
      entityType: 'purchase_order',
      entityId: po._id,
      description: `Purchase Order ${po.poNumber} status updated to ${po.status}`,
    });

    res.json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
