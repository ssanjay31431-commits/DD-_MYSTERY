import { load } from '@cashfreepayments/cashfree-js';

export const loadCashfreeSDK = async (overrideMode = null) => {
  try {
    const envVal = (import.meta.env.VITE_CASHFREE_ENV || 'PRODUCTION').toUpperCase().trim();
    const defaultIsProd = envVal === 'PRODUCTION' || envVal === 'PROD';
    
    let targetMode = defaultIsProd ? 'production' : 'sandbox';
    if (overrideMode) {
      const cleanMode = String(overrideMode).toLowerCase().trim();
      if (cleanMode === 'production' || cleanMode === 'prod') {
        targetMode = 'production';
      } else if (cleanMode === 'sandbox' || cleanMode === 'test') {
        targetMode = 'sandbox';
      }
    }

    const cashfree = await load({
      mode: targetMode
    });
    return cashfree;
  } catch (error) {
    console.error('[Cashfree SDK Load Error]', error);
    throw error;
  }
};
