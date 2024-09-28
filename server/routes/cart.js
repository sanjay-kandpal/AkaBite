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
    res.json(cart);
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
    const cartItemId = req.params.itemId;

    console.log('Updating cart item:', cartItemId);
    console.log('New quantity:', quantity);

    const cart = await Cart.findOne({ user: req.user });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItemIndex = cart.items.findIndex(item => item._id.toString() === cartItemId);
    if (cartItemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const cartItem = cart.items[cartItemIndex];
    console.log('Found cart item:', cartItem);

    const item = await Item.findById(cartItem.item);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in inventory' });
    }

    if (item.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available', availableStock: item.stockQuantity });
    }

    cart.items[cartItemIndex].quantity = quantity;
    await cart.save();

    // Fetch the updated cart with populated item details
    const updatedCart = await Cart.findOne({ user: req.user }).populate('items.item');
    
    console.log('Updated cart:', JSON.stringify(updatedCart, null, 2));
    res.json(updatedCart);
  } catch (error) {
    console.error('Error updating item quantity:', error);
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