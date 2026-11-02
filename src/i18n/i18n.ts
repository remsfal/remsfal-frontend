import { createI18n } from 'vue-i18n';
import numberFormats from '@/i18n/numberFormats';
import datetimeFormats from '@/i18n/datetimeFormats';

import de from '@/i18n/locales/de.json';
import en from '@/i18n/locales/en.json';

// Downstream projects add or override messages in src/extensions/locales/<locale>.json (see AGENT.md).
const extensionMessages = import.meta.glob<Record<string, string>>(
  '/src/extensions/locales/*.json', { eager: true, import: 'default' },
);

/** Merges the downstream extension messages of a locale over the upstream messages. */
export function withExtensionMessages<T extends Record<string, string>>(
  locale: string,
  messages: T,
  extensions: Record<string, Record<string, string>> = extensionMessages,
): T {
  return { ...messages, ...extensions[`/src/extensions/locales/${locale}.json`] };
}

export type Locale = 'en' | 'de';

export const locales: Locale[] = ['en', 'de'];

/** Maps an arbitrary locale string (e.g. from the backend) to a supported locale, falling back to 'en'. */
export function toSupportedLocale(value: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : 'en';
}

const browserLocale =
  navigator.languages?.[0] ||
  navigator.language ||
  'en';

const newLocale = browserLocale.split('-')[0];
const locale = locales.includes(newLocale as Locale) ? (newLocale as Locale) : 'en';

const i18n = createI18n({
  legacy: false,
  locale,
  fallback: 'en',
  messages: {
    de: withExtensionMessages('de', de),
    en: withExtensionMessages('en', en),
  },
  numberFormats: numberFormats,
  datetimeFormats: datetimeFormats,
});

export default i18n;
