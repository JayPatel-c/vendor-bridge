const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
  },
  contactPerson: {
    type: String,
    default: '',
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  gstNumber: {
    type: String,
    default: '',
    trim: true,
  },
  panNumber: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    enum: ['raw-materials', 'packaging', 'logistics', 'services', 'technology', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted', 'pending'],
    default: 'active',
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  bankDetails: {
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
