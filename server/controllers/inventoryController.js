const Inventory = require('../models/Inventory');

// @desc Admin get all inventory items
// @route GET /api/inventory
const getInventoryItems = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ status: 1, itemName: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin add inventory item
// @route POST /api/inventory
const addInventoryItem = async (req, res) => {
  try {
    const { itemName, sku, category, quantity, lowStockThreshold, unitPrice, unit } = req.body;
    const item = new Inventory({
      itemName,
      sku: sku.toUpperCase(),
      category,
      quantity,
      lowStockThreshold,
      unitPrice,
      unit
    });

    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Admin update inventory item
// @route PUT /api/inventory/:id
const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (item) {
      Object.assign(item, req.body);
      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Admin delete inventory item
// @route DELETE /api/inventory/:id
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (item) {
      res.json({ message: 'Inventory item removed' });
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem };
