const express = require('express');
const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const Vendor = require('../models/Vendor');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/quotations — All roles; Vendor sees own only
router.get('/', protect, async (req, res) => {
  try {
    const { rfq, vendor, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (rfq) query.rfq = rfq;
    if (vendor) query.vendor = vendor;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Vendor can only see their own quotations
    if (req.user.role === 'vendor') {
      const vendorRecord = await Vendor.findOne({ email: req.user.email });
      if (vendorRecord) {
        query.vendor = vendorRecord._id;
      } else {
        return res.json({ quotations: [], total: 0, page: 1, pages: 0 });
      }
    }

    const total = await Quotation.countDocuments(query);
    const quotations = await Quotation.find(query)
      .populate('rfq', 'title rfqNumber status deadline')
      .populate('vendor', 'name email category rating')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ quotations, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quotations/compare/:rfqId — Procurement Officer only
router.get('/compare/:rfqId', protect, authorize('procurement_officer'), async (req, res) => {
  try {
    const quotations = await Quotation.find({ rfq: req.params.rfqId })
      .populate('vendor', 'name email category rating')
      .populate('rfq', 'title rfqNumber items deadline')
      .sort({ totalAmount: 1 });

    const rfq = await RFQ.findById(req.params.rfqId);

    res.json({ quotations, rfq });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/quotations/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('rfq', 'title rfqNumber items deadline')
      .populate('vendor', 'name email contactPerson phone category rating')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    // Vendor can only view their own quotations
    if (req.user.role === 'vendor') {
      const vendorRecord = await Vendor.findOne({ email: req.user.email });
      if (!vendorRecord || quotation.vendor._id.toString() !== vendorRecord._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this quotation' });
      }
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/quotations — Vendor only (submit quotation)
router.post('/', protect, authorize('vendor'), async (req, res) => {
  try {
    // Auto-resolve vendor from logged-in user's email
    const vendorRecord = await Vendor.findOne({ email: req.user.email });
    if (!vendorRecord) {
      return res.status(400).json({ message: 'No vendor profile found for your account. Please contact an admin.' });
    }

    const { vendor: _ignore, ...quotationData } = req.body;
    const quotation = await Quotation.create({
      ...quotationData,
      vendor: vendorRecord._id,
      createdBy: req.user._id,
    });

    // Update RFQ status to in-progress
    await RFQ.findByIdAndUpdate(req.body.rfq, { status: 'in-progress' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'quotation_submitted',
      entityType: 'quotation',
      entityId: quotation._id,
      description: `Quotation ${quotation.quotationNumber} was submitted`,
    });

    res.status(201).json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/quotations/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('rfq', 'title rfqNumber')
      .populate('vendor', 'name email');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/quotations/:id/approve — Manager only
router.put('/:id/approve', protect, authorize('manager'), async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.user._id,
        approvalRemarks: req.body.remarks || '',
      },
      { new: true }
    ).populate('vendor', 'name email').populate('rfq', 'title rfqNumber');

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'quotation_approved',
      entityType: 'quotation',
      entityId: quotation._id,
      description: `Quotation ${quotation.quotationNumber} was approved`,
    });

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/quotations/:id/reject — Manager only
router.put('/:id/reject', protect, authorize('manager'), async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        approvedBy: req.user._id,
        approvalRemarks: req.body.remarks || '',
      },
      { new: true }
    ).populate('vendor', 'name email').populate('rfq', 'title rfqNumber');

    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'quotation_rejected',
      entityType: 'quotation',
      entityId: quotation._id,
      description: `Quotation ${quotation.quotationNumber} was rejected`,
    });

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/quotations/:id — Procurement Officer only
router.delete('/:id', protect, authorize('procurement_officer'), async (req, res) => {
  try {
    const q = await Quotation.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Quotation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
