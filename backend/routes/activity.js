const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/activity
router.get('/', protect, async (req, res) => {
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
