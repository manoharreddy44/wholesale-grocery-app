const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const getAll = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'shopName ownerName phone village')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'shopName ownerName phone village');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { customerId, items, discount, paymentType } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }
    if (!paymentType || !['cash', 'credit'].includes(paymentType)) {
      return res.status(400).json({ message: 'Valid paymentType (cash/credit) is required' });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      const qty = Number(item.qty) || 0;
      if (qty <= 0) continue;
      if (product.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }
      const price = Number(item.price) ?? product.wholesalePrice;
      orderItems.push({
        productId: product._id,
        name: product.name,
        qty,
        price
      });
      subtotal += price * qty;
    }

    const discountAmount = Number(discount) || 0;
    const total = Math.max(0, subtotal - discountAmount);

    const order = await Order.create({
      customerId: customerId || undefined,
      items: orderItems,
      subtotal,
      discount: discountAmount,
      total,
      paymentType,
      status: 'completed'
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty }
      });
    }

    if (paymentType === 'credit' && customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { dueAmount: total }
      });
    }

    const populated = await Order.findById(order._id)
      .populate('customerId', 'shopName ownerName phone village');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('customerId', 'shopName ownerName phone village');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, create, updateStatus };
