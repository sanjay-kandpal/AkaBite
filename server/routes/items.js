const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

router.get('/items', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sortBy } = req.query;
    let query = {};
    if (category) {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    let items = Item.find(query);
    
    if (sortBy) {
      const [field, order] = sortBy.split(':');
      items = items.sort({ [field]: order === 'desc' ? -1 : 1 });
    }
    
    items = await items.exec();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
});

module.exports = router;