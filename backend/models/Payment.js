const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ['cash', 'UPI'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
