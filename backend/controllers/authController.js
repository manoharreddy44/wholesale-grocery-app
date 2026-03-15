const User = require('../models/User');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone });
    if (user) {
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );
        return res.json({
          token,
          user: {
            id: user._id,
            shopName: user.shopName,
            ownerName: user.ownerName,
            phone: user.phone,
            role: user.role
          }
        });
      }
    }

    const customer = await Customer.findOne({ phone });
    if (customer) {
      const isMatch = await customer.comparePassword(password);
      if (isMatch) {
        const token = jwt.sign(
          { id: customer._id, role: 'customer' },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );
        return res.json({
          token,
          user: {
            id: customer._id,
            shopName: customer.shopName,
            ownerName: customer.ownerName,
            phone: customer.phone,
            role: 'customer',
            dueAmount: customer.dueAmount
          }
        });
      }
    }

    return res.status(401).json({ message: 'Invalid phone or password' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const { shopName, ownerName, phone, password } = req.body;
    if (!shopName || !ownerName || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: 'Phone already registered' });
    }
    const user = await User.create({ shopName, ownerName, phone, password, role: 'admin' });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: {
        id: user._id,
        shopName: user.shopName,
        ownerName: user.ownerName,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { login, register };
