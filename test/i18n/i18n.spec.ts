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

  test('loads the upstream locale files unchanged when no extensions exist', async () => {
    const { default: i18n } = await loadI18n();
    const { default: de } = await import('@/i18n/locales/de.json');

    expect(i18n.global.getLocaleMessage('de')).toEqual(de);
  });

});