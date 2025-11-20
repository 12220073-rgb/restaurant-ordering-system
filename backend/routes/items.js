const express = require('express');
const router = express.Router();
const { getAllItems, addItem } = require('../controllers/itemsController');

// GET all items
router.get('/', getAllItems);

// POST add new item
router.post('/', addItem);

module.exports = router;
