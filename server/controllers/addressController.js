const Address = require('../models/Address');

// @desc Get user saved addresses
// @route GET /api/addresses
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Add new address
// @route POST /api/addresses
const createAddress = async (req, res) => {
  try {
    const { fullName, mobileNumber, houseNo, street, area, city, district, state, pincode, landmark, addressType, isDefault, latitude, longitude } = req.body;

    // Validate required fields
    if (!fullName || !mobileNumber || !houseNo || !street || !area || !city || !state || !pincode) {
      return res.status(400).json({ message: 'Missing required fields: fullName, mobileNumber, houseNo, street, area, city, state, pincode' });
    }

    // Validate pincode format (should be 6 digits for India)
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Pincode must be 6 digits' });
    }

    // Validate mobile number format
    if (!/^\d{10}$/.test(mobileNumber.replace(/[^\d]/g, ''))) {
      return res.status(400).json({ message: 'Mobile number must be 10 digits' });
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = new Address({
      user: req.user._id,
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      houseNo: houseNo.trim(),
      street: street.trim(),
      area: area.trim(),
      city: city.trim(),
      district: (district || city).trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: (landmark || '').trim(),
      addressType: addressType || 'Home',
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      isDefault: isDefault || false
    });

    const savedAddress = await address.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error('Address creation error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(400).json({ message: error.message || 'Failed to save address' });
  }
};

// @desc Update address
// @route PUT /api/addresses/:id
const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(address, req.body);
    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete address
// @route DELETE /api/addresses/:id
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (address) {
      res.json({ message: 'Address deleted successfully' });
    } else {
      res.status(404).json({ message: 'Address not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress };
