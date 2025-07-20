const express = require('express');
const { createMarketData, getMarketData, updateMarketData, deleteMarketData } = require('../controllers/MarketDataController');
const router = express.Router();

// Post request to create new market data
router.post('/marketData', createMarketData); 

// Get request to fetch all market data
router.get('/marketData', getMarketData);   

// Put request to update market data by ID
router.put('/marketData/:id', updateMarketData);  

// Delete request to remove market data by ID
router.delete('/marketData/:id', deleteMarketData);

module.exports = router;
