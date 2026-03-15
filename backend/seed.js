require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const User = require('./models/User');

const products = [
  { name: 'Rice', category: 'Grains', wholesalePrice: 45, retailPrice: 50, stock: 500, unit: 'kg', imageUrl: 'https://picsum.photos/seed/rice/200/200' },
  { name: 'Oil', category: 'Cooking', wholesalePrice: 180, retailPrice: 200, stock: 100, unit: 'L', imageUrl: 'https://picsum.photos/seed/oil/200/200' },
  { name: 'Sugar', category: 'Groceries', wholesalePrice: 55, retailPrice: 60, stock: 200, unit: 'kg', imageUrl: 'https://picsum.photos/seed/sugar/200/200' },
  { name: 'Dal', category: 'Pulses', wholesalePrice: 120, retailPrice: 135, stock: 150, unit: 'kg', imageUrl: 'https://picsum.photos/seed/dal/200/200' },
  { name: 'Soap', category: 'Personal Care', wholesalePrice: 25, retailPrice: 30, stock: 300, unit: 'pcs', imageUrl: 'https://picsum.photos/seed/soap/200/200' }
];

const customers = [
  { shopName: 'Village Mart', ownerName: 'Ramesh Kumar', phone: '9876543210', village: 'North Village', dueAmount: 0 },
  { shopName: 'Daily Needs Store', ownerName: 'Sita Devi', phone: '9876543211', village: 'South Village', dueAmount: 0 }
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
    console.log('Inserted 5 products');

    await Customer.deleteMany({});
    await Customer.insertMany(customers);
    console.log('Inserted 2 customers');

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
