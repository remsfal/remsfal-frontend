import type { DateTimeFormats } from '@intlify/core-base';

const datetimeFormats: DateTimeFormats = {
  en: {
    // Example: "12/19/2024"
    shortFormat: {
      dateStyle: 'short',
    },
    // Example: "Dec 19 2024 Thu 12:20"
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    },
    // Example: "Dec 19 2024"
    longDate: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    // Example: "December 19 2024"
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
