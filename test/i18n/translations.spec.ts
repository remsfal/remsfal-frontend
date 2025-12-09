import { describe, test, expect } from 'vitest';
import de from '../../src/i18n/locales/de.json';
import en from '../../src/i18n/locales/en.json';

describe('Translation Keys for Account Settings', () => {
  test('German translations contain all required account settings keys', () => {
    expect(de['accountSettings.userProfile.managementView']).toBeDefined();
    expect(de['accountSettings.userProfile.tenanciesView']).toBeDefined();
    expect(de['accountSettings.userProfile.contractorsView']).toBeDefined();
    expect(de['accountSettings.userProfile.saveButton']).toBeDefined();
    expect(de['accountSettings.userProfile.cancelButton']).toBeDefined();
    expect(de['accountSettings.userProfile.saveSuccessMessage']).toBeDefined();
    expect(de['accountSettings.userProfile.saveErrorMessage']).toBeDefined();
    expect(de['accountSettings.delete.delete']).toBeDefined();
    expect(de['accountSettings.address.selectCountry']).toBeDefined();
  });

  test('English translations contain all required account settings keys', () => {
    expect(en['accountSettings.userProfile.managementView']).toBeDefined();
    expect(en['accountSettings.userProfile.tenanciesView']).toBeDefined();
    expect(en['accountSettings.userProfile.contractorsView']).toBeDefined();
    expect(en['accountSettings.userProfile.saveButton']).toBeDefined();
    expect(en['accountSettings.userProfile.cancelButton']).toBeDefined();
    expect(en['accountSettings.userProfile.saveSuccessMessage']).toBeDefined();
    expect(en['accountSettings.userProfile.saveErrorMessage']).toBeDefined();
    expect(en['accountSettings.delete.delete']).toBeDefined();
    expect(en['accountSettings.address.selectCountry']).toBeDefined();
  });

  test('English translations have correct values for buttons', () => {
    expect(en['accountSettings.userProfile.contractorsView']).toBe('View For Contractors');
    expect(en['accountSettings.userProfile.saveButton']).toBe('Save');
    expect(en['accountSettings.userProfile.cancelButton']).toBe('Cancel');
    expect(en['accountSettings.delete.delete']).toBe('Delete Account');
  });

  test('German translations have correct values for buttons', () => {
    expect(de['accountSettings.userProfile.contractorsView']).toBe('Zur Auftragnehmer Ansicht');
    expect(de['accountSettings.userProfile.saveButton']).toBe('Speichern');
    expect(de['accountSettings.userProfile.cancelButton']).toBe('Abbrechen');
    expect(de['accountSettings.delete.delete']).toBe('Konto löschen');
  });
});
