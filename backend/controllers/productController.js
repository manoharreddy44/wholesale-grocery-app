const Product = require('../models/Product');

const getAll = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, category, wholesalePrice, retailPrice, stock, unit, imageUrl } = req.body;
    if (!name || category == null || wholesalePrice == null || retailPrice == null || stock == null) {
      return res.status(400).json({ message: 'Name, category, prices and stock are required' });
    }
    const product = await Product.create({
      name,
      category: category || 'General',
      wholesalePrice: Number(wholesalePrice),
      retailPrice: Number(retailPrice),
      stock: Number(stock),
      unit: unit || 'kg',
      imageUrl: imageUrl || 'https://picsum.photos/seed/grocery/200/200'
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
