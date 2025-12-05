import { createI18n } from 'vue-i18n';
import numberFormats from '@/i18n/numberFormats';
import datetimeFormats from '@/i18n/datetimeFormats';

import de from '@/i18n/locales/de.json';
import en from '@/i18n/locales/en.json';

export type Locale = 'en' | 'de';

export const locales: Locale[] = ['en', 'de'];

const browserLocale =
  navigator.languages?.[0] ||
  navigator.language ||
  "en";

const newLocale = browserLocale.split('-')[0];
const locale = locales.includes(newLocale as Locale) ? (newLocale as Locale) : 'en';

const i18n = createI18n({
  legacy: false,
  locale,
  fallback: 'en',
  messages: {
    de,
    en,
  },
  numberFormats: numberFormats,
  datetimeFormats: datetimeFormats,
});

export default i18n;
