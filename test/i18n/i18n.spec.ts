import {describe, test, expect, beforeEach, vi} from 'vitest';

async function loadI18n() {
  vi.resetModules();
  return import('@/i18n/i18n');
}

describe('i18n browser locale detection', () => {

  beforeEach(() => {
    vi.resetModules();
  });

  test('uses navigator.languages[0] and strips hyphen (e.g. "de-DE" → "de")', async () => {
    vi.stubGlobal('navigator', { languages: ['de-DE'], language: 'de-DE'});

    const { default: i18n } = await loadI18n();

    expect(i18n.global.locale.value).toBe('de');
  });

  test('fallbacks to navigator.language when navigator.languages is missing', async () => {
    vi.stubGlobal('navigator', {language: 'de-DE'});

    const { default: i18n } = await loadI18n();

    expect(i18n.global.locale.value).toBe('de');
  });

  test('falls back to "en" when browser locale is not supported', async () => {
    vi.stubGlobal('navigator', {languages: ['fr-FR'], language: 'fr-FR'});

    const { default: i18n } = await loadI18n();

    expect(i18n.global.locale.value).toBe('en');
  });

  test('uses "en" when navigator is empty', async () => {
    vi.stubGlobal('navigator', {});

    const { default: i18n } = await loadI18n();

    expect(i18n.global.locale.value).toBe('en');
  });

});

describe('toSupportedLocale', () => {
  test.each(['de', 'en'])('keeps the supported locale %s', async (locale) => {
    const { toSupportedLocale } = await loadI18n();

    expect(toSupportedLocale(locale)).toBe(locale);
  });

  test.each(['fr', 'de-DE', ''])('falls back to English for unsupported locale "%s"', async (locale) => {
    const { toSupportedLocale } = await loadI18n();

    expect(toSupportedLocale(locale)).toBe('en');
  });
});

describe('withExtensionMessages', () => {

  test('adds and overrides messages from the extension file of the locale', async () => {
    const { withExtensionMessages } = await loadI18n();
    const extensions = {
      '/src/extensions/locales/de.json': { 'footer.poweredBy': 'Downstream', 'downstream.key': 'Neu' },
      '/src/extensions/locales/en.json': { 'footer.poweredBy': 'English' },
    };

    const messages = withExtensionMessages('de', { 'footer.poweredBy': 'Upstream', 'other.key': 'Bleibt' }, extensions);

    expect(messages).toEqual({
      'footer.poweredBy': 'Downstream',
      'downstream.key': 'Neu',
      'other.key': 'Bleibt',
    });
  });

  test('keeps the upstream messages if the locale has no extension file', async () => {
    const { withExtensionMessages } = await loadI18n();
    const upstream = { 'footer.poweredBy': 'Upstream' };

    expect(withExtensionMessages('en', upstream, {})).toEqual(upstream);
  });

  test.each(['de', 'en'])('merges only the extension messages for %s without mutating either input', async (locale) => {
    const { withExtensionMessages } = await loadI18n();
    const upstream = Object.freeze({ 'shared.key': 'Upstream', 'upstream.key': 'Unchanged' });
    const extensions = Object.freeze({
      '/src/extensions/locales/de.json': Object.freeze({ 'shared.key': 'Deutsch', 'extension.key': 'Neu' }),
      '/src/extensions/locales/en.json': Object.freeze({ 'shared.key': 'English', 'extension.key': 'New' }),
    });

    const merged = withExtensionMessages(locale, upstream, extensions);

    expect(merged).toEqual({
      ...upstream,
      ...extensions[`/src/extensions/locales/${locale}.json` as keyof typeof extensions],
    });
    expect(merged).not.toBe(upstream);
    expect(upstream).toEqual({ 'shared.key': 'Upstream', 'upstream.key': 'Unchanged' });
  });

  test('allows an extension to intentionally replace a message with an empty string', async () => {
    const { withExtensionMessages } = await loadI18n();
    const extensions = { '/src/extensions/locales/de.json': { 'shared.key': '' } };

    expect(withExtensionMessages('de', { 'shared.key': 'Upstream' }, extensions)).toEqual({ 'shared.key': '' });
  });

  test('does not merge messages from other locales when the requested extension is absent', async () => {
    const { withExtensionMessages } = await loadI18n();
    const upstream = { 'shared.key': 'Upstream' };
    const extensions = { '/src/extensions/locales/de.json': { 'shared.key': 'Deutsch', 'extension.key': 'Neu' } };

    expect(withExtensionMessages('en', upstream, extensions)).toEqual(upstream);
  });

  // Must also hold in downstream projects that ship src/extensions/locales/*.json,
  // so the expectation includes whatever extension messages exist.
  test.each(['de', 'en'])('loads the upstream %s locale merged with the extension messages', async (locale) => {
    const { default: i18n } = await loadI18n();
    const { default: messages } = locale === 'de'
      ? await import('@/i18n/locales/de.json')
      : await import('@/i18n/locales/en.json');
    const extensions = import.meta.glob<Record<string, string>>(
      '/src/extensions/locales/*.json', { eager: true, import: 'default' },
    );

    expect(i18n.global.getLocaleMessage(locale)).toEqual({
      ...messages,
      ...extensions[`/src/extensions/locales/${locale}.json`],
    });
  });

});