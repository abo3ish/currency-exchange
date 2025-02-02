export const formatNumber = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 2
  }).format(num);
};

export const unformatNumber = (value: string): string => {
  return value.replace(/,/g, '');
};
