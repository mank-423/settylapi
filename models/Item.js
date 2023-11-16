const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  user: { type: String }, // Reference to the User model
  highestBidAmount: { type: Number, default: 0 }, // Track the highest bid amount
  highestBidder: { type: String, default: null }, // Track the user with the highest bid
  biddingStatus: { type: String, enum: ['open', 'closed'], default: 'open' }, // Bidding status
}, { collection: 'items' });

module.exports = mongoose.model('Item', itemSchema);
