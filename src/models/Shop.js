const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  shopname: { type: String, required: true, unique: true, trim: true },
  logotype: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png',
  },
  description: { type: String, trim: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (id) {
        const user = await mongoose.model('User').findById(id);
        return user && user.role === 'seller';
      },
      message: 'Only sellers can own shops',
    },
  },
  address: { type: String },
  location: {
    lat: { type: Number },
    lon: { type: Number },
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  view: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  TariffPlan: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    default: 'basic',
  },
  isBanned: {
    status: { type: Boolean, default: false },
    from: { type: Date },
    to: { type: Date },
    reason: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
