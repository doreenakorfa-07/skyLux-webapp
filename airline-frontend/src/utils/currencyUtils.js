export const exchangeRates = {
  USD: { rate: 1, symbol: '$' },
  GHS: { rate: 14.5, symbol: 'GH₵' },
  NGN: { rate: 1600, symbol: '₦' },
  KES: { rate: 128, symbol: 'KSh' },
  ZAR: { rate: 17.8, symbol: 'R' },
  EUR: { rate: 0.92, symbol: '€' }
};

export const formatPrice = (usdAmount, currency = 'USD') => {
  const { rate, symbol } = exchangeRates[currency] || exchangeRates.USD;
  const converted = usdAmount * rate;
  return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getCurrencySymbol = (currency = 'USD') => {
  return exchangeRates[currency]?.symbol || '$';
};
