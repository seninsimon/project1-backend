const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },

});

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;
