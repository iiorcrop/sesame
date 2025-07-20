const mongoose = require('mongoose');

// Define the Market Data schema
const MarketDataSchema = new mongoose.Schema({
  stateName: {
    type: String,
  },
  districtName: {
    type: String,
  },
  marketName: {
    type: String,
  },
  variety: {
    type: String,
  },
  arrivals: {
    type: String,
  },
  minPrice: {
    type: Number, 
  },
  maxPrice: {
    type: Number, 
  },
  modalPrice: {
    type: Number, 
  },
  reportedDate: {
    type: Date,
  },
});

// Export the model
module.exports = mongoose.model('MarketData', MarketDataSchema);
