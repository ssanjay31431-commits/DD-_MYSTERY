const { sendBrevoEmail } = require('./brevoEmailService');

/**
 * Universal Brevo Email dispatch helper
 * Validates recipient, sender, executes API call, and parses provider response.
 */
const sendEmail = async ({ recipientEmail, recipientName, subject, htmlContent }) => {
  return await sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

module.exports = {
  sendEmail,
  sendBrevoEmail
};
