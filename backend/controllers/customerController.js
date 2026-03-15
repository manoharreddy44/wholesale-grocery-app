const Customer = require('../models/Customer');

const getAll = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ shopName: 1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { shopName, ownerName, phone, village, dueAmount, password } = req.body;
    if (!shopName || !ownerName || !phone) {
      return res.status(400).json({ message: 'Shop name, owner name and phone are required' });
    }
    const customer = await Customer.create({
      shopName,
      ownerName,
      phone,
      village: village || '',
      dueAmount: Number(dueAmount) || 0,
      password: password || 'password123'
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { password, ...updates } = req.body;
    const updateDoc = { ...updates };
    if (password !== undefined && password !== '') updateDoc.password = password;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateDoc,
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, getMe, create, update, remove };
