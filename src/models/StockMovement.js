const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['incoming', 'outgoing', 'adjustment'], required: true },
  quantity: { type: Number, required: true },
  costPrice: { type: Number, required: function () { return this.type === 'incoming'; } },
  note: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('StockMovement', stockMovementSchema);
