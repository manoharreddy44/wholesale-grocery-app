require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const User = require('./models/User');

const products = [
  {
    name: 'Sugar 50kg Bag',
    category: 'Groceries',
    wholesalePrice: 2400,
    retailPrice: 2600,
    stock: 80,
    unit: 'bag',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Sugar+50kg+Bag'
  },
  {
    name: 'Sugar Sachets (Box of 500)',
    category: 'Groceries',
    wholesalePrice: 280,
    retailPrice: 320,
    stock: 120,
    unit: 'box',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Sugar+Sachets+Box'
  },
  {
    name: 'Sona Masoori Rice 25kg',
    category: 'Grains',
    wholesalePrice: 1125,
    retailPrice: 1250,
    stock: 100,
    unit: 'bag',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Rice+25kg+Bag'
  },
  {
    name: 'Fortune Sunflower Oil 15L',
    category: 'Cooking',
    wholesalePrice: 2100,
    retailPrice: 2350,
    stock: 50,
    unit: 'tin',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Oil+15L+Tin'
  },
  {
    name: 'Toor Dal 30kg',
    category: 'Pulses',
    wholesalePrice: 3600,
    retailPrice: 3900,
    stock: 60,
    unit: 'bag',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Toor+Dal+30kg'
  }
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
