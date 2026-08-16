const brevo = require('../services/brevoEmailService');

(async () => {
  try {
    const sampleOrder = {
      orderId: 'DDMB-TEST-0001',
      items: [
        { productSnapshot: { name: 'DD CHOCO MYSTERY BOX', image: '', price: 199 }, customizationSnapshot: { theme: 'Birthday Star' }, quantity: 1, unitPrice: 199 }
      ],
      deliveryAddressSnapshot: { fullName: 'S Sanjay', mobileNumber: '7708447215', houseNo: '1/27', street: 'Main road', area: 'Ganapathypuram', city: 'Nagapattinam', state: 'Tamil Nadu', pincode: '609702' },
      pricing: { totalAmount: 199, amountPaid: 100, remainingBalance: 99 }
    };

    console.log('TEST: Sending Order Confirmation Email via Brevo API');
    const res = await brevo.sendOrderConfirmationEmail({ recipientEmail: 'ssanjay31431@gmail.com', recipientName: 'S Sanjay', order: sampleOrder });
    console.log('\nTEST RESULT:');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Test script error:', err);
  }
})();
