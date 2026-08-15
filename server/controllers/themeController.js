const Theme = require('../models/Theme');

// @desc Get all themes
// @route GET /api/themes
const getThemes = async (req, res) => {
  try {
    const themes = await Theme.find({ isActive: true }).sort({ isPopular: -1, name: 1 });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin create theme
// @route POST /api/themes
const createTheme = async (req, res) => {
  try {
    const { name, category, previewImage, accentColor, bgGradient, isPopular } = req.body;
    const theme = new Theme({
      name,
      category,
      previewImage,
      accentColor,
      bgGradient,
      isPopular
    });
    const createdTheme = await theme.save();
    res.status(201).json(createdTheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Admin update theme
// @route PUT /api/themes/:id
const updateTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (theme) {
      theme.name = req.body.name || theme.name;
      theme.category = req.body.category || theme.category;
      theme.previewImage = req.body.previewImage ?? theme.previewImage;
      theme.accentColor = req.body.accentColor || theme.accentColor;
      theme.bgGradient = req.body.bgGradient || theme.bgGradient;
      theme.isPopular = req.body.isPopular ?? theme.isPopular;
      theme.isActive = req.body.isActive ?? theme.isActive;

      const updatedTheme = await theme.save();
      res.json(updatedTheme);
    } else {
      res.status(404).json({ message: 'Theme not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Admin delete theme
// @route DELETE /api/themes/:id
const deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (theme) {
      await theme.deleteOne();
      res.json({ message: 'Theme removed' });
    } else {
      res.status(404).json({ message: 'Theme not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getThemes, createTheme, updateTheme, deleteTheme };
