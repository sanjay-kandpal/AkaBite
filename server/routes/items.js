const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Get items by category
router.get('/items', async (req, res) => {
  try {
    const categoryId = req.query.category;
    const items = await Item.find({ category: categoryId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;