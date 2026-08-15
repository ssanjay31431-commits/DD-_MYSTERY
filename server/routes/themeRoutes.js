const express = require('express');
const router = express.Router();
const { getThemes, createTheme, updateTheme, deleteTheme } = require('../controllers/themeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getThemes)
  .post(protect, admin, createTheme);

router.route('/:id')
  .put(protect, admin, updateTheme)
  .delete(protect, admin, deleteTheme);

module.exports = router;
