const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  wholesalePrice: { type: Number, required: true },
  retailPrice: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true, default: 'kg' },
  imageUrl: { type: String, default: 'https://placehold.co/400x400/eeeeee/333333?text=Product' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
