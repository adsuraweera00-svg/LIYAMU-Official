const API_URL = 'https://open.er-api.com/v6/latest/USD';
const BUFFER_PERCENTAGE = 0.02; // 2% buffer for bank fees

/**
 * Fetches the current USD to LKR exchange rate.
 * @returns {Promise<number>}
 */
export const getExchangeRate = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (data && data.rates && data.rates.LKR) {
      // Apply buffer
      return data.rates.LKR * (1 + BUFFER_PERCENTAGE);
    }
    return 300; // Fallback rate
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return 300; // Fallback rate
  }
};

/**
 * Formats a USD amount into LKR string.
 * @param {number} usdAmount 
 * @param {number} rate 
 * @returns {string}
 */
export const formatLKR = (usdAmount, rate) => {
  const lkr = usdAmount * rate;
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(lkr).replace('LKR', 'Rs.');
};
