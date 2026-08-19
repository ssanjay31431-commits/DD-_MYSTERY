const AdminSettings = require('../models/AdminSettings');

// @desc Get current admin settings (Public)
// @route GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({
        advanceType: 'fixed',
        advanceAmount: 100,
        codAdvanceType: 'fixed',
        codAdvanceValue: 100,
        deliveryCharge: 0,
        freeDeliveryMinAmount: 199,
        instagramLink: 'https://www.instagram.com/',
        whatsappNumber: '+91 00000 00000',
        upiId: 'david468468@airtel',
        upiName: 'Sagariya David S',
        paymentMethodName: 'Manual UPI'
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

    const {
      advanceType,
      advanceAmount,
      codAdvanceType,
      codAdvanceValue,
      deliveryCharge,
      freeDeliveryMinAmount,
      instagramLink,
      whatsappNumber,
      upiId,
      upiName,
      paymentMethodName
    } = req.body;

    if (advanceType) settings.advanceType = advanceType;
    if (advanceAmount !== undefined) settings.advanceAmount = Number(advanceAmount);
    if (codAdvanceType) settings.codAdvanceType = codAdvanceType;
    if (codAdvanceValue !== undefined) settings.codAdvanceValue = Number(codAdvanceValue);
    if (deliveryCharge !== undefined) settings.deliveryCharge = Number(deliveryCharge);
    if (freeDeliveryMinAmount !== undefined) settings.freeDeliveryMinAmount = Number(freeDeliveryMinAmount);
    if (instagramLink !== undefined) settings.instagramLink = instagramLink;
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (upiId !== undefined) settings.upiId = upiId;
    if (upiName !== undefined) settings.upiName = upiName;
    if (paymentMethodName !== undefined) settings.paymentMethodName = paymentMethodName;

    const updated = await settings.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
