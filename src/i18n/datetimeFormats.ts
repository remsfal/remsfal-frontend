import type { DateTimeFormats } from '@intlify/core-base';

const datetimeFormats: DateTimeFormats = {
  en: {
    shortFormat: {
      dateStyle: 'short',
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    },
    longDate: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    longMonth: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  },
  de: {
    shortFormat: {
      dateStyle: 'short',
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    },
    longDate: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    longMonth: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  },
};

export default datetimeFormats;
