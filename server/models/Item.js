const mongoose = require('mongoose');

const ItemSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stockQuantity: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);