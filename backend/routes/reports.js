const express = require('express');
const Vendor = require('../models/Vendor');
const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/reports/dashboard — dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const [
      totalVendors,
      activeVendors,
      totalRfqs,
      openRfqs,
      pendingApprovals,
      totalPOs,
      totalInvoices,
      paidInvoices,
    ] = await Promise.all([
      Vendor.countDocuments(),
      Vendor.countDocuments({ status: 'active' }),
      RFQ.countDocuments(),
      RFQ.countDocuments({ status: { $in: ['draft', 'sent', 'in-progress'] } }),
      Quotation.countDocuments({ status: 'pending' }),
      PurchaseOrder.countDocuments(),
      Invoice.countDocuments(),
      Invoice.countDocuments({ status: 'paid' }),
    ]);

    // Total spend from paid invoices
    const spendResult = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalSpend = spendResult[0]?.total || 0;

    // Monthly spend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySpend = await Invoice.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Category breakdown
    const categoryBreakdown = await Vendor.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent POs
    const recentPOs = await PurchaseOrder.find()
      .populate('vendor', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('poNumber vendor totalAmount status createdAt');

    // Recent Invoices
    const recentInvoices = await Invoice.find()
      .populate('vendor', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('invoiceNumber vendor totalAmount status dueDate createdAt');

    res.json({
      stats: {
        totalVendors,
        activeVendors,
        totalRfqs,
        openRfqs,
        pendingApprovals,
        totalPOs,
        totalInvoices,
        paidInvoices,
        totalSpend,
      },
      monthlySpend,
      categoryBreakdown,
      recentPOs,
      recentInvoices,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reports/analytics — detailed analytics
router.get('/analytics', protect, async (req, res) => {
  try {
    // Vendor performance (top vendors by PO count)
    const vendorPerformance = await PurchaseOrder.aggregate([
      { $group: { _id: '$vendor', poCount: { $sum: 1 }, totalValue: { $sum: '$totalAmount' } } },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      { $unwind: '$vendor' },
      { $project: { vendorName: '$vendor.name', vendorRating: '$vendor.rating', poCount: 1, totalValue: 1 } },
    ]);

    // RFQ status distribution
    const rfqStatusDist = await RFQ.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Monthly RFQ trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRfqs = await RFQ.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      vendorPerformance,
      rfqStatusDist,
      monthlyRfqs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
