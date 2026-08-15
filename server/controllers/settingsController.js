const AdminSettings = require('../models/AdminSettings');

// @desc Get current admin settings (Public)
// @route GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({
        codAdvanceType: 'fixed',
        codAdvanceValue: 100,
        deliveryCharge: 0,
        freeDeliveryMinAmount: 199
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update admin settings (Admin Only)
// @route PUT /api/admin/settings
const updateSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings();
    }

    const { codAdvanceType, codAdvanceValue, deliveryCharge, freeDeliveryMinAmount } = req.body;

    if (codAdvanceType) settings.codAdvanceType = codAdvanceType;
    if (codAdvanceValue !== undefined) settings.codAdvanceValue = Number(codAdvanceValue);
    if (deliveryCharge !== undefined) settings.deliveryCharge = Number(deliveryCharge);
    if (freeDeliveryMinAmount !== undefined) settings.freeDeliveryMinAmount = Number(freeDeliveryMinAmount);

    const updated = await settings.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
