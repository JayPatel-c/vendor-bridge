const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_login', 'user_logout', 'user_register',
      'vendor_created', 'vendor_updated', 'vendor_deleted',
      'rfq_created', 'rfq_updated', 'rfq_sent', 'rfq_cancelled',
      'quotation_submitted', 'quotation_approved', 'quotation_rejected',
      'po_created', 'po_updated', 'po_issued',
      'invoice_created', 'invoice_sent', 'invoice_paid',
      'approval_requested', 'approval_granted', 'approval_denied',
    ],
  },
  entityType: {
    type: String,
    enum: ['user', 'vendor', 'rfq', 'quotation', 'purchase_order', 'invoice', 'approval'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
