const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  discount: {
    type: Number,
    required: true, // Discount in percentage or flat value
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usedBy: {
    type: [mongoose.Schema.Types.ObjectId], // Array of user IDs who used the coupon
    ref: 'User',
    default: [],
  },
}, {
  timestamps: true,
});

couponSchema.methods.checkExpiry = function () {
  if (new Date() > this.expiryDate) {
    this.isActive = false;
    return false;
  }
  return true;
};

module.exports = mongoose.model('Coupon', couponSchema);
