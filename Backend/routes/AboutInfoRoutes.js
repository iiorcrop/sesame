const express = require('express');
const { createAboutInfo, getAboutInfo, updateAboutInfo, deleteAboutInfo } = require('../controllers/AboutInfoController');
const router = express.Router();

// Create a new AboutInfo
router.post('/aboutinfo', createAboutInfo); 

// Get all AboutInfo
router.get('/aboutinfo', getAboutInfo);   

// Update AboutInfo by ID
router.put('/aboutinfo/:id', updateAboutInfo);  

// Delete AboutInfo by ID
router.delete('/aboutinfo/:id', deleteAboutInfo);

module.exports = router;
