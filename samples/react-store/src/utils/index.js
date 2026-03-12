export const capitalize = value => value.charAt(0).toUpperCase() + value.slice(1);

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
