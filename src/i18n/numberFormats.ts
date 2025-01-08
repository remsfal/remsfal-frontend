import type { NumberFormats } from '@intlify/core-base';

const numberFormats: NumberFormats = {
  en: {
    // Example: 1.5 $
    currency: {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'symbol',
    },
    // Example: 1.5 $
    percent: {
      style: 'percent',
    },
    // Example: 1.5
    decimal: {
      style: 'decimal',
    },
  },
  de: {
    // Example: 1,5 €
    currency: {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'symbol',
    },
    // Example: 1,5 %
    percent: {
      style: 'percent',
    },
    // Example: 1,5
    decimal: {
      style: 'decimal',
    },
  },
};

export default numberFormats;
