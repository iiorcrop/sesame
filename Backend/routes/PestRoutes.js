const express = require('express');
const { createPest, getPest, updatePest, deletePest } = require('../controllers/PestController');
const router = express.Router();

// Post request to create new pest data
router.post('/pest', createPest); 

// Get request to fetch all pest data
router.get('/pest', getPest);   

// Put request to update pest data by ID
router.put('/pest/:id', updatePest);  

// Delete request to remove pest data by ID
router.delete('/pest/:id', deletePest);

module.exports = router;
