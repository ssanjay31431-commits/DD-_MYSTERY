import { load } from '@cashfreepayments/cashfree-js';

let cashfreeInstance = null;

export const loadCashfreeSDK = async () => {
  if (cashfreeInstance) return cashfreeInstance;

  try {
    const isProduction = import.meta.env.VITE_CASHFREE_ENV === 'PRODUCTION' || import.meta.env.VITE_CASHFREE_ENV === 'PROD';
    cashfreeInstance = await load({
      mode: isProduction ? 'production' : 'sandbox'
    });
    return cashfreeInstance;
  } catch (error) {
    console.error('[Cashfree SDK Load Error]', error);
    throw error;
  }
};
