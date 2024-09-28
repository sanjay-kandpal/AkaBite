// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const mongoose = require('mongoose')

router.use(auth);
// Get user's cart
router.get('/', auth, async (req, res) => {
  console.log('Get cart route hit');
  try {
    let cart = await Cart.findOne({ user: req.user }).populate('items.item');
    if (!cart) {
      cart = new Cart({ user: req.user, items: [] });
      await cart.save();
    }

    // check stock availability for each item in the cart
    const updatedItems = [];
    const unavailableItems = [];

    for (const cartItem of cart.items) {
      const item = await Item.findById(cartItem.item._id);
      if (!item || item.stockQuantity === 0) {
        unavailableItems.push(cartItem.item.name);
      } else if (item.stockQuantity < cartItem.quantity) {
        cartItem.quantity = item.stockQuantity;
        updatedItems.push(cartItem);
      } else {
        updatedItems.push(cartItem);
      }
    }

    // Update cart if there were changes
    if (updatedItems.length !== cart.items.length) {
      cart.items = updatedItems;
      await cart.save();
    }

    res.json({ cart, unavailableItems });
    
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    let cart = await Cart.findOne({ user: req.user });
    if (!cart) {
      cart = new Cart({ user: req.user, items: [] });
    }
    const cartItemIndex = cart.items.findIndex(cartItem => cartItem.item.toString() === itemId);
    if (cartItemIndex > -1) {
      cart.items[cartItemIndex].quantity += quantity;
    } else {
      cart.items.push({ item: itemId, quantity });
    }
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
});


// Update item quantity in cart
router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const cartItemIndex = cart.items.findIndex(item => item.item.toString() === req.params.itemId);
    if (cartItemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available', availableStock: item.stockQuantity });
    }
    cart.items[cartItemIndex].quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating item quantity', error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const itemIdToRemove = req.params.itemId;
    console.log('Item ID to remove:', itemIdToRemove);
    console.log('Type of itemIdToRemove:', typeof itemIdToRemove);

    let cart = await Cart.findOne({ user: req.user });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    console.log('Current cart items:');
    cart.items.forEach((item, index) => {
      console.log(`Item ${index}:`);
      console.log('  _id =', item._id.toString());
      console.log('  item =', item.item);
      console.log('  quantity =', item.quantity);
    });

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemIdToRemove);
    console.log('Found item index:', itemIndex);

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      
      // Repopulate the cart to get full item details
      cart = await Cart.findOne({ user: req.user }).populate('items.item');
      
      console.log('Updated cart:', JSON.stringify(cart, null, 2));
      res.json(cart);
    } else {
      console.log('Item not found in cart. Cart contents:', JSON.stringify(cart, null, 2));
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
});
module.exports = router;