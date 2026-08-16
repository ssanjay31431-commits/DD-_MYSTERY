const axios = require('axios');
const nodemailer = require('nodemailer');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const getBrevoHeaders = () => ({
  'accept': 'application/json',
  'api-key': process.env.BREVO_API_KEY || '',
  'content-type': 'application/json'
});

const getSender = () => ({
  name: process.env.BREVO_SENDER_NAME || 'DD MYSTERY BOX',
  email: process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'support@ddmysterybox.com'
});

const sendViaSmtp = async ({ recipientEmail, recipientName, subject, htmlContent }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    const errorMsg = 'SMTP settings are not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)';
    console.error('[EMAIL ERROR] To:', recipientEmail, '| Provider: Brevo SMTP | Error:', errorMsg);
    return { success: false, error: errorMsg };
  }

  const sender = getSender();
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  try {
    const response = await transporter.sendMail({
      from: `${sender.name} <${sender.email}>`,
      to: recipientEmail,
      subject,
      html: htmlContent
    });

    console.log('\n[EMAIL]');
    console.log(`To: ${recipientEmail}`);
    console.log(`Sender: ${sender.email}`);
    console.log('Provider: Brevo SMTP');
    console.log(`HTTP: 250`);
    console.log(`Message ID: ${response.messageId || 'N/A'}`);
    console.log('Full SMTP response:', JSON.stringify(response, null, 2));
    console.log('Status: accepted\n');

    return {
      success: true,
      providerMessageId: response.messageId || `brevo_smtp_${Date.now()}`,
      providerResponse: response,
      httpStatus: 250
    };
  } catch (error) {
    const errorText = error?.response?.body || error?.message || 'SMTP send failed';
    console.error('\n[EMAIL ERROR] Full SMTP error response:');
    console.error(errorText);
    console.error('\n[EMAIL ERROR] Summary:');
    console.error(`To: ${recipientEmail}`);
    console.error(`Sender: ${sender.email}`);
    console.error('Provider: Brevo SMTP');
    console.error(`HTTP: ${error?.response?.status || 'N/A'}`);
    console.error(`Error: ${errorText}\n`);

    return {
      success: false,
      error: errorText,
      providerResponse: error?.response?.body || error?.response || null,
      httpStatus: error?.response?.status || null
    };
  }
};

// Helper to generate DD Mystery Box branded HTML Email
const generateEmailTemplate = ({ title, bannerColor = '#ec4899', customerName, orderId, order, currentStage = 'Confirmed', customMessage = '' }) => {
  const items = order?.items || [];
  const address = order?.deliveryAddressSnapshot || {};
  const totalAmount = order?.pricing?.totalAmount || order?.totalAmount || 0;
  const advancePaid = order?.pricing?.amountPaid || order?.amountPaid || order?.advancePaid || order?.advanceRequired || 0;
  const remainingBalance = order?.pricing?.remainingBalance !== undefined ? order.pricing.remainingBalance : (order?.remainingBalance !== undefined ? order.remainingBalance : Math.max(0, totalAmount - advancePaid));
  const rawMethod = order?.paymentInfo?.method || order?.paymentMethod || 'ADVANCE';
  const paymentMethod = rawMethod === 'FULL' || rawMethod === 'Full Online Payment' ? 'Full Online Payment' : 'Advance Payment';
  const courier = order?.shipment?.provider || order?.courierName || order?.trackingInfo?.courier || '';
  const awb = order?.shipment?.awb || order?.awbNumber || order?.trackingInfo?.awb || '';
  const trackingUrl = order?.shipment?.trackingUrl || order?.trackingUrl || (awb ? `https://shiprocket.co/tracking/${awb}` : '');

  const stages = [
    { key: 'Confirmed', label: 'Order Confirmed' },
    { key: 'Preparing', label: 'Preparing' },
    { key: 'Packed', label: 'Packed' },
    { key: 'Shipped', label: 'Shipped' },
    { key: 'Out for Delivery', label: 'Out for Delivery' },
    { key: 'Delivered', label: 'Delivered' }
  ];

  const currentStageIndex = stages.findIndex(s => s.key.toLowerCase() === (currentStage || '').toLowerCase());

  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #1e1b4b;">
      <td style="padding: 12px 8px; vertical-align: middle;">
        <img src="${item.productSnapshot?.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=150&q=80'}" alt="${item.productSnapshot?.name}" style="width: 50px; height: 50px; object-fit: cover; borderRadius: 10px;" />
      </td>
      <td style="padding: 12px 8px; color: #ffffff; font-weight: bold;">
        ${item.productSnapshot?.name || 'DD Mystery Box'}
        ${item.customizationSnapshot?.theme ? `<div style="font-size: 11px; color: #c084fc;">Theme: ${item.customizationSnapshot.theme}</div>` : ''}
      </td>
      <td style="padding: 12px 8px; text-align: center; color: #cbd5e1;">x${item.quantity || 1}</td>
      <td style="padding: 12px 8px; text-align: right; color: #f472b6; font-weight: bold;">₹${(item.unitPrice || item.price || 0) * (item.quantity || 1)}</td>
    </tr>
  `).join('');

  const timelineHtml = stages.map((st, idx) => {
    const isCompleted = currentStageIndex >= 0 && idx <= currentStageIndex;
    return `
      <div style="flex: 1; text-align: center; font-size: 10px;">
        <div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${isCompleted ? '#ec4899' : '#334155'}; color: #ffffff; line-height: 20px; margin: 0 auto 4px auto; font-weight: bold;">
          ${isCompleted ? '✓' : idx + 1}
        </div>
        <span style="color: ${isCompleted ? '#f472b6' : '#64748b'}; font-weight: ${isCompleted ? 'bold' : 'normal'};">${st.label}</span>
      </div>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>DD MYSTERY BOX</title>
  </head>
  <body style="background-color: #0c0a17; margin: 0; padding: 20px; font-family: Arial, sans-serif; color: #e2e8f0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #131127; border-radius: 24px; border: 1px solid #3b0764; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
      
      <!-- Header Banner -->
      <tr>
        <td align="center" style="background: linear-gradient(135deg, #831843 0%, #3b0764 100%); padding: 30px 20px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">🎁 DD MYSTERY BOX</h1>
          <p style="color: #f472b6; margin: 5px 0 0 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Your Birthday. Your Theme. Your Surprise!</p>
        </td>
      </tr>

      <!-- Title Badge -->
      <tr>
        <td style="padding: 24px 24px 12px 24px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 800;">${title}</h2>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">Hello <strong style="color: #ffffff;">${customerName || address.fullName || 'Valued Customer'}</strong>,</p>
          ${customMessage ? `<div style="background-color: #1e1b4b; padding: 14px; border-radius: 12px; border-left: 4px solid #c084fc; color: #e2e8f0; font-size: 13px; margin: 12px 0;">${customMessage}</div>` : ''}
        </td>
      </tr>

      <!-- Visual Timeline -->
      <tr>
        <td style="padding: 12px 24px;">
          <div style="background-color: #0f172a; padding: 16px; border-radius: 16px; border: 1px solid #1e293b;">
            <p style="color: #fbbf24; font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0 0 12px 0; text-align: center;">Order Progress Timeline</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              ${timelineHtml}
            </div>
          </div>
        </td>
      </tr>

      <!-- Order Items Snapshot -->
      <tr>
        <td style="padding: 12px 24px;">
          <h3 style="color: #f472b6; font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 0 0 10px 0;">Order Details (${orderId})</h3>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px;">
            <thead>
              <tr style="color: #94a3b8; border-bottom: 1px solid #334155; font-size: 11px; text-transform: uppercase;">
                <th align="left" style="padding: 6px;">Item</th>
                <th align="left" style="padding: 6px;">Product</th>
                <th align="center" style="padding: 6px;">Qty</th>
                <th align="right" style="padding: 6px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </td>
      </tr>

      <!-- Payment Breakdown -->
      <tr>
        <td style="padding: 12px 24px;">
          <div style="background-color: #090d16; padding: 16px; border-radius: 16px; border: 1px solid #1e1b4b;">
            <h3 style="color: #38bdf8; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 10px 0;">Payment Details</h3>
            <table width="100%" style="font-size: 12px; color: #cbd5e1;">
              <tr><td style="padding: 3px 0;">Payment Method:</td><td align="right" style="color: #ffffff; font-weight: bold;">${paymentMethod}</td></tr>
              <tr><td style="padding: 3px 0;">Delivery Charge:</td><td align="right" style="color: #ffffff; font-weight: bold;">₹${order?.deliveryFee || order?.pricing?.deliveryFee || 0}</td></tr>
              <tr><td style="padding: 3px 0;">Total Order Value:</td><td align="right" style="color: #ffffff; font-weight: bold;">₹${totalAmount}</td></tr>
              <tr><td style="padding: 3px 0;">Online Paid:</td><td align="right" style="color: #4ade80; font-weight: bold;">₹${advancePaid}</td></tr>
              <tr><td style="padding: 3px 0;">Remaining Balance:</td><td align="right" style="color: #fbbf24; font-weight: bold;">₹${remainingBalance}</td></tr>
            </table>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #38bdf8; background-color: #0f172a; padding: 8px 12px; border-radius: 8px;">
              ${remainingBalance > 0 ? ` You have paid <strong>₹${advancePaid}</strong> online. Remaining Balance: <strong>₹${remainingBalance}</strong>.` : ` <strong>₹${totalAmount}</strong> paid in full online!`}
            </p>
          </div>
        </td>
      </tr>

      <!-- Delivery Address -->
      <tr>
        <td style="padding: 12px 24px;">
          <div style="background-color: #090d16; padding: 16px; border-radius: 16px; border: 1px solid #1e1b4b;">
            <h3 style="color: #fbbf24; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 8px 0;">Delivery Location</h3>
            <p style="margin: 0; font-size: 13px; color: #ffffff; font-weight: bold;">${address.fullName || customerName || 'Customer'}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">
              ${address.houseNo ? `${address.houseNo}, ` : ''}${address.street ? `${address.street}, ` : ''}${address.area ? `${address.area}, ` : ''}${address.landmark ? `(Landmark: ${address.landmark}), ` : ''}${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}
            </p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #cbd5e1; font-family: monospace;">📞 Mobile: ${address.mobileNumber || order?.user?.phone || 'N/A'}</p>
          </div>
        </td>
      </tr>

      <!-- Real Courier Tracking Section -->
      <tr>
        <td style="padding: 12px 24px;">
          <div style="background-color: #1e1b4b; padding: 16px; border-radius: 16px; text-align: center;">
            ${awb ? `
              <p style="color: #a7f3d0; font-size: 12px; font-weight: bold; margin: 0 0 4px 0;">Shipment Dispatched!</p>
              <p style="color: #ffffff; font-size: 12px; margin: 0 0 10px 0;">Courier: <strong>${courier || 'Delivery Partner'}</strong> | AWB: <span style="font-family: monospace; color: #fbbf24;">${awb}</span></p>
              <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: linear-gradient(90deg, #ec4899, #8b5cf6); color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 12px; font-weight: bold; font-size: 12px; text-transform: uppercase;">Track Your Package →</a>
            ` : `
              <p style="color: #cbd5e1; font-size: 12px; margin: 0;">🚚 Your tracking details will be updated once your package is handed over to our courier partner.</p>
            `}
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td align="center" style="padding: 24px; border-top: 1px solid #1e1b4b; color: #64748b; font-size: 11px;">
          <p style="margin: 0;">Thank you for choosing <strong>DD MYSTERY BOX</strong>! 🎁</p>
          <p style="margin: 4px 0 0 0;">If you have any questions, reply directly to this email.</p>
        </td>
      </tr>

    </table>
  </body>
  </html>
  `;
};

// Generic Brevo API sender helper
const sendBrevoEmail = async ({ recipientEmail, recipientName, subject, htmlContent }) => {
  if (!recipientEmail || !recipientEmail.includes('@')) {
    const errorMsg = `Invalid recipient email address: "${recipientEmail}"`;
    console.error('[EMAIL ERROR] To:', recipientEmail, '| Provider: Brevo | Error:', errorMsg);
    return { success: false, error: errorMsg };
  }

  const sender = getSender();
  if (!sender.email || !sender.email.includes('@')) {
    const errorMsg = `Invalid sender email address: "${sender.email}". Set BREVO_SENDER_EMAIL or SMTP_USER to a verified Brevo sender.`;
    console.error('[EMAIL ERROR] To:', recipientEmail, '| Provider: Brevo | Error:', errorMsg);
    return { success: false, error: errorMsg };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const hasSmtpConfig = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

  if (!apiKey && !hasSmtpConfig) {
    const errorMsg = 'BREVO_API_KEY and SMTP credentials are not configured in the backend environment';
    console.error('[EMAIL ERROR] To:', recipientEmail, '| Provider: Brevo | Error:', errorMsg);
    return { success: false, error: errorMsg };
  }

  if (apiKey) {
    try {
      const payload = {
        sender,
        to: [{ email: recipientEmail, name: recipientName || recipientEmail }],
        subject: subject,
        htmlContent: htmlContent
      };

      const response = await axios.post(BREVO_API_URL, payload, { headers: getBrevoHeaders() });
      const messageId = response.data?.messageId || response.data?.id;

      console.log('\n[EMAIL]');
      console.log(`To: ${recipientEmail}`);
      console.log(`Sender: ${sender.email}`);
      console.log(`Provider: Brevo`);
      console.log(`HTTP: ${response.status}`);
      console.log(`Message ID: ${messageId || 'N/A'}`);
      console.log('Full Brevo response:', JSON.stringify(response.data, null, 2));
      console.log(`Status: accepted\n`);

      if (response.status === 201 || response.status === 200) {
        return {
          success: true,
          providerMessageId: messageId || `brevo_${Date.now()}`,
          providerResponse: response.data,
          httpStatus: response.status
        };
      }

      return {
        success: false,
        error: `Unexpected response status from Brevo: ${response.status}`,
        providerResponse: response.data,
        httpStatus: response.status
      };
    } catch (error) {
      const httpStatus = error.response?.status || 'N/A';
      const providerResponse = error.response?.data || null;
      const errorMsg = providerResponse?.message || providerResponse?.code || error.message || 'Brevo API call failed';

      console.error('\n[EMAIL ERROR] Full Brevo error response:');
      try { console.error(JSON.stringify(providerResponse, null, 2)); } catch (e) { console.error(providerResponse); }

      console.error('\n[EMAIL ERROR] Summary:');
      console.error(`To: ${recipientEmail}`);
      console.error(`Sender: ${sender.email}`);
      console.error(`Provider: Brevo`);
      console.error(`HTTP: ${httpStatus}`);
      console.error(`Error: ${errorMsg}\n`);

      if (hasSmtpConfig) {
        console.warn('[EMAIL WARN] Brevo API rejected the message. Falling back to Brevo SMTP with configured SMTP credentials.');
        return sendViaSmtp({ recipientEmail, recipientName, subject, htmlContent });
      }

      return {
        success: false,
        error: errorMsg,
        providerResponse,
        httpStatus
      };
    }
  }

  return sendViaSmtp({ recipientEmail, recipientName, subject, htmlContent });
};

// Specialized Brevo Email Functions

const sendOrderConfirmationEmail = async ({ recipientEmail, recipientName, order }) => {
  const subject = `🎁 Your DD Mystery Box Order is Confirmed! — ${order.orderId}`;
  const htmlContent = generateEmailTemplate({
    title: `Order #${order.orderId} Confirmed!`,
    customerName: recipientName,
    orderId: order.orderId,
    order,
    currentStage: 'Confirmed'
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendPaymentConfirmationEmail = async ({ recipientEmail, recipientName, order }) => {
  const paid = order?.pricing?.amountPaid || order?.amountPaid || order?.advancePaid || 0;
  const rem = order?.pricing?.remainingBalance !== undefined ? order.pricing.remainingBalance : (order?.remainingBalance || 0);
  const subject = `💳 Payment Received for Order — ${order.orderId || order.orderNumber}`;
  const htmlContent = generateEmailTemplate({
    title: `Payment Confirmed!`,
    customerName: recipientName,
    orderId: order.orderId || order.orderNumber,
    order,
    currentStage: 'Confirmed',
    customMessage: `We have verified your online payment of ₹${paid}. ${rem > 0 ? `Remaining balance: ₹${rem}.` : 'Order is fully paid!'}`
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendPreparingEmail = async ({ recipientEmail, recipientName, order }) => {
  const subject = `📦 Your DD Mystery Box Is Being Prepared! — ${order.orderId}`;
  const htmlContent = generateEmailTemplate({
    title: `Workshop Assembling Your Mystery Box!`,
    customerName: recipientName,
    orderId: order.orderId,
    order,
    currentStage: 'Preparing',
    customMessage: `Our mystery workshop is carefully assembling your items and custom gifts for order #${order.orderId}!`
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendPackedEmail = async ({ recipientEmail, recipientName, order }) => {
  const subject = `🎁 Your DD Mystery Box Has Been Packed! — ${order.orderId}`;
  const htmlContent = generateEmailTemplate({
    title: `Packed & Ready for Courier Pickup!`,
    customerName: recipientName,
    orderId: order.orderId,
    order,
    currentStage: 'Packed',
    customMessage: `Your mystery box for order #${order.orderId} has been packed with love and nostalgia!`
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendShipmentEmail = async ({ recipientEmail, recipientName, order }) => {
  const subject = `🚚 Your DD Mystery Box Has Been Shipped! — ${order.orderId}`;
  const htmlContent = generateEmailTemplate({
    title: `Package Handed to Courier Partner!`,
    customerName: recipientName,
    orderId: order.orderId,
    order,
    currentStage: 'Shipped'
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendPickupEmail = async ({ recipientEmail, recipientName, order }) => {
  const subject = `🚚 Your DD Mystery Box Has Been Picked Up! — ${order.orderId}`;
  const htmlContent = generateEmailTemplate({
    title: `Courier Pickup Confirmed!`,
    customerName: recipientName,
    orderId: order.orderId,
    order,
    currentStage: 'Shipped',
    customMessage: `Your package for order #${order.orderId} has been picked up by our courier partner.`
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendTransitEmail = async ({ recipientEmail, recipientName, order }) => {
  const subject = `🚚 Your DD Mystery Box Is On Its Way! — ${order.orderId}`;
  const htmlContent = generateEmailTemplate({
    title: `Package In Transit!`,
    customerName: recipientName,
    orderId: order.orderId,
    order,
    currentStage: 'Shipped',
    customMessage: `Your package for order #${order.orderId} is currently in transit to your city.`
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendOutForDeliveryEmail = async ({ recipientEmail, recipientName, order }) => {
  const ordId = order.orderId || order.orderNumber;
  const subject = `🛵 Your DD Mystery Box Is Out for Delivery! — ${ordId}`;
  const htmlContent = generateEmailTemplate({
    title: `Out For Delivery Today!`,
    customerName: recipientName,
    orderId: ordId,
    order,
    currentStage: 'Out for Delivery',
    customMessage: `Get ready! Your mystery box is out for delivery today.`
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendDeliveredEmail = async ({ recipientEmail, recipientName, order }) => {
  const subject = `🎉 Your DD Mystery Box Has Been Delivered! — ${order.orderId}`;
  const htmlContent = generateEmailTemplate({
    title: `Surprise Delivered Successfully!`,
    customerName: recipientName,
    orderId: order.orderId,
    order,
    currentStage: 'Delivered',
    customMessage: `Order #${order.orderId} has been delivered. Thank you for choosing DD Mystery Box!`
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendFailedDeliveryEmail = async ({ recipientEmail, recipientName, order, reason }) => {
  const subject = `⚠️ Delivery Update for Order ${order.orderId}`;
  const htmlContent = generateEmailTemplate({
    title: `Delivery Attempt Unsuccessful`,
    customerName: recipientName,
    orderId: order.orderId,
    order,
    currentStage: 'Out for Delivery',
    customMessage: `The courier partner attempted delivery for order #${order.orderId} but was unsuccessful. Reason: ${reason || 'Customer unavailable'}. Next attempt will be made soon.`
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendCancellationEmail = async ({ recipientEmail, recipientName, order, reason }) => {
  const subject = `Order #${order.orderId} Cancelled — DD Mystery Box`;
  const htmlContent = generateEmailTemplate({
    title: `Order Cancellation Notice`,
    customerName: recipientName,
    orderId: order.orderId,
    order,
    currentStage: 'Cancelled',
    customMessage: `Order #${order.orderId} has been cancelled. Reason: ${reason || 'Request processed'}.`
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject, htmlContent });
};

const sendCustomEmail = async ({ recipientEmail, recipientName, subject, customMessage, order }) => {
  const htmlContent = generateEmailTemplate({
    title: subject || `Notification from DD Mystery Box`,
    customerName: recipientName,
    orderId: order?.orderId || 'N/A',
    order,
    currentStage: order?.orderStatus || 'Confirmed',
    customMessage
  });
  return sendBrevoEmail({ recipientEmail, recipientName, subject: subject || 'Update regarding your DD Mystery Box Order', htmlContent });
};

module.exports = {
  sendBrevoEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendPreparingEmail,
  sendPackedEmail,
  sendShipmentEmail,
  sendPickupEmail,
  sendTransitEmail,
  sendOutForDeliveryEmail,
  sendDeliveredEmail,
  sendFailedDeliveryEmail,
  sendCancellationEmail,
  sendCustomEmail
};
