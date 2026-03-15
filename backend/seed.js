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
    name: 'Sona Masoori Rice 25kg Bag',
    category: 'Grains',
    wholesalePrice: 1125,
    retailPrice: 1250,
    stock: 100,
    unit: 'bag',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Rice+25kg+Bag'
  },
  {
    name: 'Fortune Sunflower Oil 15L Tin',
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
  },
  {
    name: 'Surf Excel Matic 10kg',
    category: 'Personal Care',
    wholesalePrice: 850,
    retailPrice: 950,
    stock: 75,
    unit: 'kg',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Surf+Excel+10kg'
  },
  {
    name: 'Tata Tea Gold 1kg',
    category: 'Groceries',
    wholesalePrice: 420,
    retailPrice: 480,
    stock: 150,
    unit: 'kg',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Tea+1kg'
  },
  {
    name: 'Tata Salt 1kg (Carton 50)',
    category: 'Groceries',
    wholesalePrice: 18,
    retailPrice: 22,
    stock: 200,
    unit: 'carton',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Salt+1kg+Carton'
  },
  {
    name: 'Lifebuoy Soap 75g (Box of 24)',
    category: 'Personal Care',
    wholesalePrice: 288,
    retailPrice: 336,
    stock: 80,
    unit: 'box',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Lifebuoy+Soap+Box'
  },
  {
    name: 'Parle-G Biscuit 1kg (Pack of 10)',
    category: 'Groceries',
    wholesalePrice: 520,
    retailPrice: 600,
    stock: 100,
    unit: 'pack',
    imageUrl: 'https://placehold.co/400x400/eeeeee/333333?text=Parle-G+1kg+Pack'
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
    console.log('Inserted 10 products');

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
