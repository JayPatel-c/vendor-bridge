const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/activity — Admin, Procurement Officer, Manager only (Vendor gets 403)
router.get('/', protect, authorize('admin', 'procurement_officer', 'manager'), async (req, res) => {
  try {
    const { entityType, page = 1, limit = 30 } = req.query;
    const query = {};

    if (entityType) query.entityType = entityType;

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
