export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount ?? 0);

export const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' });
