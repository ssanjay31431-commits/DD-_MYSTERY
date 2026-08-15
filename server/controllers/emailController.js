const { sendNotification } = require('../utils/emailService');

// @desc Admin Send Email to Customer (Template or Custom)
// @route POST /api/admin/email/send
const sendAdminEmail = async (req, res) => {
  try {
    const { recipientEmail, recipientPhone, subject, message, templateType, orderId } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    const emailResult = await sendNotification({
      type: templateType || 'CUSTOM_EMAIL',
      recipientEmail,
      recipientPhone,
      orderId: orderId || 'N/A',
      subject: subject || 'DD Mystery Box Update',
      customMessage: message
    });

    res.json({
      success: true,
      message: `Email dispatched successfully to ${recipientEmail}`,
      details: emailResult
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendAdminEmail };
