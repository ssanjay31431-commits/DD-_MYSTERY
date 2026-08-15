const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema(
  {
    recipientName: { type: String, required: true },
    birthdayDate: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, default: 'Unspecified' },
    favoriteColor: { type: String, required: true }, // Pink, Purple, Blue, Black, Red, Green, Yellow, Custom
    theme: { type: String, required: true }, // Marvel, WWE, Anime, BGMI, etc.
    personalMessage: { type: String, default: '' },
    giftPreferences: { type: String, default: '' },
    thingsToAvoid: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    budget: { type: Number },
    quantity: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = customizationSchema;
