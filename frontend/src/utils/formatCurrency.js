export const formatCurrency = (amount, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€' };
  const sym = symbols[currency] || '₹';
  return `${sym}${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
