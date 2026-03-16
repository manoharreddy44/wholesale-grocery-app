const Payment = require('../models/Payment');
const Customer = require('../models/Customer');

const addPayment = async (req, res) => {
  try {
    const { customerId, amount, paymentMode } = req.body;
    if (!customerId || amount == null || amount <= 0) {
      return res.status(400).json({ message: 'Customer and a positive amount are required' });
    }
    if (!paymentMode || !['cash', 'UPI'].includes(paymentMode)) {
      return res.status(400).json({ message: 'paymentMode must be cash or UPI' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const payment = await Payment.create({
      customerId,
      amount: Number(amount),
      paymentMode
    });

    await Customer.findByIdAndUpdate(customerId, {
      $inc: { dueAmount: -Number(amount) }
    });

    const populated = await Payment.findById(payment._id)
      .populate('customerId', 'shopName ownerName phone village dueAmount');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to record payment' });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customerId', 'shopName ownerName phone village')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch payments' });
  }
};

module.exports = { addPayment, getPayments };
