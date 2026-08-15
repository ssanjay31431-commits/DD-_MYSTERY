const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc Get user cart
// @route GET /api/cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add item to cart (with customization)
// @route POST /api/cart/add
const addToCart = async (req, res) => {
  try {
    const { productId, customization, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    cart.items.push({
      product: product._id,
      customization,
      quantity,
      unitPrice: product.price
    });

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.status(201).json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update cart item quantity / customization
// @route PUT /api/cart/item/:itemId
const updateCartItem = async (req, res) => {
  try {
    const { quantity, customization } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === req.params.itemId);
    if (itemIndex > -1) {
      if (quantity !== undefined) {
        cart.items[itemIndex].quantity = quantity;
      }
      if (customization !== undefined) {
        cart.items[itemIndex].customization = {
          ...cart.items[itemIndex].customization,
          ...customization
        };
      }
      await cart.save();
      const updatedCart = await Cart.findById(cart._id).populate('items.product');
      return res.json(updatedCart);
    } else {
      return res.status(404).json({ message: 'Cart item not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Remove item from cart
// @route DELETE /api/cart/item/:itemId
const removeCartItem = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
      await cart.save();
      const updatedCart = await Cart.findById(cart._id).populate('items.product');
      res.json(updatedCart);
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Clear user cart
// @route DELETE /api/cart/clear
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.couponApplied = { code: '', discountAmount: 0 };
      await cart.save();
      res.json({ message: 'Cart cleared', items: [] });
    } else {
      res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
