const express = require('express');
const Vendor = require('../models/Vendor');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/vendors — list all vendors
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;

    const total = await Vendor.countDocuments(query);
    const vendors = await Vendor.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ vendors, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/vendors/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate('createdBy', 'name email');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/vendors
router.post('/', protect, async (req, res) => {
  try {
    const vendor = await Vendor.create({ ...req.body, createdBy: req.user._id });

    await ActivityLog.create({
      user: req.user._id,
      action: 'vendor_created',
      entityType: 'vendor',
      entityId: vendor._id,
      description: `Vendor "${vendor.name}" was created`,
    });

    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/vendors/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'vendor_updated',
      entityType: 'vendor',
      entityId: vendor._id,
      description: `Vendor "${vendor.name}" was updated`,
    });

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/vendors/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'vendor_deleted',
      entityType: 'vendor',
      entityId: vendor._id,
      description: `Vendor "${vendor.name}" was deleted`,
    });

    res.json({ message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
