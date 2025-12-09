import {describe, test, expect, beforeEach, vi} from 'vitest';

async function loadI18n() {
  vi.resetModules();
  return import('@/i18n/i18n.ts');
}

describe('i18n browser locale detection', () => {

  beforeEach(() => {
    vi.resetModules();
  });

  test('uses navigator.languages[0] and strips hyphen (e.g. "de-DE" → "de")', async () => {
    vi.stubGlobal('navigator', {
      languages: ['de-DE'],
      language: 'de-DE'
    });

    const { default: i18n } = await loadI18n();

    expect(i18n.global.locale.value).toBe('de');
  });

  test('fallbacks to navigator.language when navigator.languages is missing', async () => {
    vi.stubGlobal('navigator', {
      language: 'de-DE'
    });

    const { default: i18n } = await loadI18n();

    expect(i18n.global.locale.value).toBe('de');
  });

  test('falls back to "en" when browser locale is not supported', async () => {
    vi.stubGlobal('navigator', {
      languages: ['fr-FR'],
      language: 'fr-FR'
    });

    const { default: i18n } = await loadI18n();

    expect(i18n.global.locale.value).toBe('en');
  });

  test('uses "en" when navigator is empty', async () => {
    vi.stubGlobal('navigator', {});

    const { default: i18n } = await loadI18n();

    expect(i18n.global.locale.value).toBe('en');
  });

});