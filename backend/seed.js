require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const User = require('./models/User');

const products = [
  { name: 'Sona Masoori Rice 25kg', category: 'Grains', wholesalePrice: 1100, retailPrice: 1250, stock: 50, unit: 'bag', imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Rice+25kg+Bag' },
  { name: 'Fortune Sunflower Oil 15L', category: 'Cooking', wholesalePrice: 1800, retailPrice: 2000, stock: 30, unit: 'tin', imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Oil+15L+Tin' },
  { name: 'Sugar 50kg Bag', category: 'Groceries', wholesalePrice: 2000, retailPrice: 2200, stock: 40, unit: 'bag', imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Sugar+50kg+Bag' },
  { name: 'Toor Dal 30kg', category: 'Pulses', wholesalePrice: 3200, retailPrice: 3500, stock: 25, unit: 'bag', imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Toor+Dal+30kg' },
  { name: 'Surf Excel Matic 10kg', category: 'Personal Care', wholesalePrice: 1500, retailPrice: 1700, stock: 20, unit: 'pack', imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Surf+Excel+10kg' }
];

const customers = [
  { shopName: 'Village Mart', ownerName: 'Ramesh Kumar', phone: '9876543210', village: 'North Village', dueAmount: 0, password: 'password123' },
  { shopName: 'Daily Needs Store', ownerName: 'Sita Devi', phone: '9876543211', village: 'South Village', dueAmount: 0, password: 'password123' }
];

const adminUser = {
  shopName: 'Wholesale Grocery Co',
  ownerName: 'Admin',
  phone: '9999999999',
  password: 'admin123',
  role: 'admin'
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Inserted products');

    await Customer.deleteMany({});
    for (const c of customers) {
      await Customer.create(c);
    }
    console.log('Inserted 2 customers (password: password123)');

    const existingUser = await User.findOne({ phone: adminUser.phone });
    if (!existingUser) {
      await User.create(adminUser);
      console.log('Created admin user (phone: 9999999999, password: admin123)');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Seed completed successfully');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
