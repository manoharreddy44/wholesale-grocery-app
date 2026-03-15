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
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch orders' });
  }
};

const getOne = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'shopName ownerName phone village');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch order' });
  }
};

/**
 * Create order: validates items, calculates total on backend, deducts product stock,
 * and increments customer dueAmount when paymentType is 'credit'.
 */
const create = async (req, res) => {
  try {
    const { customerId, items, discount, paymentType } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    if (!paymentType || !['cash', 'credit'].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid paymentType (cash or credit) is required'
      });
    }

    if (paymentType === 'credit' && !customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer is required for credit payment'
      });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const productId = item.productId;
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a productId'
        });
      }

      let product;
      try {
        product = await Product.findById(productId);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: `Invalid productId: ${productId}`
        });
      }

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${productId}`
        });
      }

      const qty = Math.floor(Number(item.qty)) || 0;
      if (qty <= 0) {
        continue;
      }

      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock} ${product.unit}`
        });
      }

      const price = Number(item.price);
      const unitPrice = Number.isFinite(price) && price >= 0 ? price : product.wholesalePrice;
      const lineTotal = unitPrice * qty;

      orderItems.push({
        productId: product._id,
        name: product.name,
        qty,
        price: unitPrice
      });
      subtotal += lineTotal;
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid items (quantity must be greater than 0)'
      });
    }

    const discountAmount = Math.max(0, Number(discount) || 0);
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
      try {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.qty }
        });
      } catch (e) {
        console.error('Failed to deduct stock for product', item.productId, e);
        return res.status(500).json({
          success: false,
          message: 'Failed to update product stock. Order was created but inventory may be inconsistent.'
        });
      }
    }

    if (paymentType === 'credit' && customerId) {
      let customer;
      try {
        customer = await Customer.findById(customerId);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customerId'
        });
      }

      if (!customer) {
        return res.status(400).json({
          success: false,
          message: 'Customer not found for credit payment'
        });
      }

      try {
        await Customer.findByIdAndUpdate(customerId, {
          $inc: { dueAmount: total }
        });
      } catch (e) {
        console.error('Failed to update customer dueAmount', customerId, e);
        return res.status(500).json({
          success: false,
          message: 'Failed to update customer due amount. Order was created but khata may be inconsistent.'
        });
      }
    }

    const populated = await Order.findById(order._id)
      .populate('customerId', 'shopName ownerName phone village');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create order'
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('customerId', 'shopName ownerName phone village');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update order status' });
  }
};

module.exports = { getAll, getOne, create, updateStatus };
