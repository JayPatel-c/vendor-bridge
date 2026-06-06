const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    unique: true,
  },
  rfq: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  items: [{
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  }],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  deliveryTimeline: {
    type: String,
    default: '',
  },
  validUntil: {
    type: Date,
  },
  notes: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'approved', 'rejected', 'expired'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvalRemarks: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

quotationSchema.pre('save', async function () {
  if (!this.quotationNumber) {
    const count = await mongoose.model('Quotation').countDocuments();
    this.quotationNumber = `QT-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Quotation', quotationSchema);
