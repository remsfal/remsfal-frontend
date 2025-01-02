import type { NumberFormats } from '@intlify/core-base';

const numberFormats: NumberFormats = {
  en: {
    currency: {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'symbol',
    },
    percent: {
      style: 'percent',
    },
    decimal: {
      style: 'decimal',
    },
  },
  de: {
    currency: {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'symbol',
    },
    percent: {
      style: 'percent',
    },
    decimal: {
      style: 'decimal',
    },
  },
};

export default numberFormats;
