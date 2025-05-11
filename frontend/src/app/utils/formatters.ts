

export const formatCurrency = (value: number, currency: string = 'USD', locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
}
