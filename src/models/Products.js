// models/Product.js
const mongoose = require('mongoose');

// Субдокумент для комментариев с рейтингом
const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CategoryINPR',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    price: {
      costPrice: { type: Number, required: false },
      sellingPrice: { type: Number, required: false },
      income: { type: Number, default: 0 },
    },
    stock: { type: Number, required: false, min: 0 },
    lowStockThreshold: { type: Number, default: 10 }, // 🔥 Default past limit
    view: { type: Number, default: 0 },
    images: [String],
    description: String,
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    rating: { type: Number, default: 0 },
    comments: [commentSchema],
    tags: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Вычисляем прибыль и общий рейтинг перед сохранением
productSchema.pre('save', function (next) {
  // Income calculation
  this.price.income = this.price.sellingPrice - this.price.costPrice;

  // Average rating from comments
  if (Array.isArray(this.comments) && this.comments.length > 0) {
    const total = this.comments.reduce((sum, c) => sum + c.rating, 0);
    this.rating = Math.round((total / this.comments.length) * 100) / 100; // округление до 2 знаков
  } else {
    this.rating = 0;
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);
