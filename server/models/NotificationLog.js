const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customerName: { type: String, default: 'Customer' },
    recipient: { type: String, required: true }, // Email or Phone number
    channel: { type: String, enum: ['Email', 'SMS'], required: true },
    type: { type: String, required: true }, // Notification stage / template name
    event: { type: String, default: '' }, // e.g. ORDER_CONFIRMED
    status: { type: String, enum: ['Sent', 'Delivered', 'Failed', 'Pending'], default: 'Pending' },
    provider: { type: String, default: 'Brevo' }, // Brevo / Fast2SMS
    providerMessageId: { type: String, default: '' },
    subject: { type: String, default: '' },
    content: { type: String, default: '' },
    error: { type: String, default: '' },
    idempotencyKey: { type: String, default: '' },
    sentAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
