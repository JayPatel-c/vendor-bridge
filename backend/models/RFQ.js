const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
  rfqNumber: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  items: [{
    product: { type: String, required: true },
    description: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'pcs' },
    estimatedPrice: { type: Number, default: 0 },
  }],
  vendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  }],
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'in-progress', 'completed', 'cancelled'],
    default: 'draft',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Auto-generate RFQ number
rfqSchema.pre('save', async function (next) {
  if (!this.rfqNumber) {
    const count = await mongoose.model('RFQ').countDocuments();
    this.rfqNumber = `RFQ-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('RFQ', rfqSchema);
