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
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { shopName, ownerName, phone, village, dueAmount } = req.body;
    if (!shopName || !ownerName || !phone) {
      return res.status(400).json({ message: 'Shop name, owner name and phone are required' });
    }
    const customer = await Customer.create({
      shopName,
      ownerName,
      phone,
      village: village || '',
      dueAmount: Number(dueAmount) || 0
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
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

module.exports = { getAll, getOne, create, update, remove };
