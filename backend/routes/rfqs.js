const express = require('express');
const RFQ = require('../models/RFQ');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/rfqs
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { rfqNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await RFQ.countDocuments(query);
    const rfqs = await RFQ.find(query)
      .populate('vendors', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ rfqs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/rfqs/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('vendors', 'name email contactPerson phone category')
      .populate('createdBy', 'name email');
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/rfqs
router.post('/', protect, async (req, res) => {
  try {
    const rfq = await RFQ.create({ ...req.body, createdBy: req.user._id });

    await ActivityLog.create({
      user: req.user._id,
      action: 'rfq_created',
      entityType: 'rfq',
      entityId: rfq._id,
      description: `RFQ "${rfq.title}" (${rfq.rfqNumber}) was created`,
    });

    res.status(201).json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/rfqs/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const rfq = await RFQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('vendors', 'name email');
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });

    const action = req.body.status === 'sent' ? 'rfq_sent'
      : req.body.status === 'cancelled' ? 'rfq_cancelled' : 'rfq_updated';

    await ActivityLog.create({
      user: req.user._id,
      action,
      entityType: 'rfq',
      entityId: rfq._id,
      description: `RFQ "${rfq.title}" was ${action.replace('rfq_', '')}`,
    });

    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/rfqs/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const rfq = await RFQ.findByIdAndDelete(req.params.id);
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
    res.json({ message: 'RFQ deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
