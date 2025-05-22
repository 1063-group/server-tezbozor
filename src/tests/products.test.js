// tests/productModel.test.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let Product;

// Define minimal User and Category schemas for testing
const userSchema = new mongoose.Schema({ role: String });
const categorySchema = new mongoose.Schema({ name: String });

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Register test models
  mongoose.model('User', userSchema);
  mongoose.model('Category', categorySchema);

  // Import Product model after registering dependencies
  Product = require('../models/Products');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Clean up collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Product Model', () => {
  it('calculates income correctly on save', async () => {
    // Create related documents
    const User = mongoose.model('User');
    const Category = mongoose.model('Category');
    const seller = await User.create({ role: 'seller' });
    const category = await Category.create({ name: 'Test Category' });

    const product = new Product({
      name: 'Test Product',
      seller: seller._id,
      category: category._id,
      price: { costPrice: 100, sellingPrice: 150 },
      stock: 10,
    });

    await product.save();
    expect(product.price.income).toBe(50);
  });

  it('calculates average rating from comments', async () => {
    const User = mongoose.model('User');
    const Category = mongoose.model('Category');
    const seller = await User.create({ role: 'seller' });
    const category = await Category.create({ name: 'Test Category' });

    const product = new Product({
      name: 'Rated Product',
      seller: seller._id,
      category: category._id,
      price: { costPrice: 50, sellingPrice: 100 },
      stock: 5,
      comments: [
        { user: seller._id, text: 'Good', rating: 4 },
        { user: seller._id, text: 'Excellent', rating: 5 },
      ],
    });

    await product.save();
    // (4 + 5) / 2 = 4.5
    expect(product.rating).toBeCloseTo(4.5, 2);
  });

  it('sets rating to 0 if no comments', async () => {
    const User = mongoose.model('User');
    const Category = mongoose.model('Category');
    const seller = await User.create({ role: 'seller' });
    const category = await Category.create({ name: 'Test Category' });

    const product = new Product({
      name: 'No Comments',
      seller: seller._id,
      category: category._id,
      price: { costPrice: 20, sellingPrice: 40 },
      stock: 2,
    });

    await product.save();
    expect(product.rating).toBe(0);
  });
});
