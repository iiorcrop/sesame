const MarketData = require('../models/MarketData');

// Create Market Data (multiple rows at once)
exports.createMarketData = async (req, res) => {
  try {
    const marketDataArray = req.body; // Expecting an array of market data objects

    if (!Array.isArray(marketDataArray) || marketDataArray.length === 0) {
      return res.status(400).json({ message: 'Invalid data format or empty array' });
    }

    // Save multiple market data entries at once
    const newMarketData = await MarketData.insertMany(marketDataArray);
    res.status(201).json(newMarketData);
  } catch (error) {
    res.status(500).json({ message: 'Error creating market data', error });
  }
};

// Get All Market Data
exports.getMarketData = async (req, res) => {
  try {
    const marketData = await MarketData.find();
    res.status(200).json(marketData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching market data', error });
  }
};

// Update Market Data
exports.updateMarketData = async (req, res) => {
  try {
    const marketDataId = req.params.id;
    const updatedMarketData = await MarketData.findByIdAndUpdate(marketDataId, req.body, { new: true });

    if (!updatedMarketData) {
      return res.status(404).json({ message: 'Market data not found' });
    }

    res.status(200).json(updatedMarketData);
  } catch (error) {
    res.status(500).json({ message: 'Error updating market data', error });
  }
};

// Delete Market Data
exports.deleteMarketData = async (req, res) => {
  try {
    const marketDataId = req.params.id;
    const deletedMarketData = await MarketData.findByIdAndDelete(marketDataId);

    if (!deletedMarketData) {
      return res.status(404).json({ message: 'Market data not found' });
    }

    res.status(200).json({ message: 'Market data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting market data', error });
  }
};
