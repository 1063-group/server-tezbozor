const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  subtitles: [{ type: String }], // optional: statiklar
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CategoryINPR', CategorySchema);
