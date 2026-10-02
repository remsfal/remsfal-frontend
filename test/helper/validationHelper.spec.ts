import { describe, it, expect } from 'vitest';
import { isValidPhone, isValidUuid, phoneSchema, emailSchema } from '@/helper/validationHelper';
import { optionalEmailSchema, nameSchema, streetSchema } from '@/helper/validationHelper';

const t = ((key: string) => key) as unknown as Parameters<typeof phoneSchema>[0];

describe('validationHelper', () => {
  describe('name', () => {
    it.each([
      'Max',
      'Hans-Peter',
      'Müller-Lüdenscheidt',
      'Bad Homburg',
      'Groß Strömkendorf',
      "O'Brien",
      'D’Angelo',
    ])('accepts %s', (value) => {
      expect(nameSchema(t).safeParse(value).success).toBe(true);
    });

    it.each(['Berlin1', 'Max!', 'Max_Muster'])('rejects %s with the name error', (value) => {
      expect(nameSchema(t).safeParse(value).error?.issues[0].message).toBe('validation.name');
    });

    it('requires a value', () => {
      expect(nameSchema(t).safeParse('   ').error?.issues[0].message).toBe('validation.required');
    });
  });

  describe('street', () => {
    it.each(['Hauptstraße 12a', 'Am Markt 1/3', 'Karl-Marx-Allee 90'])('accepts %s', (value) => {
      expect(streetSchema(t).safeParse(value).success).toBe(true);
    });

    it.each(['Hauptstraße', '12'])('rejects %s without letters and a number', (value) => {
      expect(streetSchema(t).safeParse(value).error?.issues[0].message).toBe('address.validation.streetInvalid');
    });
  });

  describe('uuid', () => {
    it('accepts UUIDs case-insensitively', () => {
      expect(isValidUuid('3f2504e0-4f89-11d3-9a0c-0305e82c3301')).toBe(true);
      expect(isValidUuid('3F2504E0-4F89-11D3-9A0C-0305E82C3301')).toBe(true);
    });

    it.each(['', 'not-a-uuid', '3f2504e0-4f89-11d3-9a0c-0305e82c330'])('rejects %j', (value) => {
      expect(isValidUuid(value)).toBe(false);
    });
  });

  describe('phone', () => {
    it.each(['+4930123', '+491511234567', '+123456789012345'])('accepts %s', (value) => {
      expect(isValidPhone(value)).toBe(true);
    });

    it.each(['+4912', '491511234567', '+0491511234567', '+1234567890123456', '+49 151 1234567'])(
      'rejects %s',
      (value) => {
        expect(isValidPhone(value)).toBe(false);
      },
    );

    it('schema allows empty and undefined values', () => {
      expect(phoneSchema(t).safeParse('').success).toBe(true);
      expect(phoneSchema(t).safeParse(undefined).success).toBe(true);
    });

    it('schema reports the translated error for invalid numbers', () => {
      const result = phoneSchema(t).safeParse('+4912');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('validation.phone');
    });
  });

  describe('email', () => {
    it('trims surrounding whitespace before validating', () => {
      expect(emailSchema(t).safeParse('  max@example.com  ')).toEqual({
        success: true,
        data: 'max@example.com',
      });
      expect(optionalEmailSchema(t).safeParse('  max@example.com  ').data).toBe('max@example.com');
    });

    it('required schema rejects empty and invalid values with the translated error', () => {
      expect(emailSchema(t).safeParse('').error?.issues[0].message).toBe('validation.email');
      expect(emailSchema(t).safeParse('not-an-email').error?.issues[0].message).toBe('validation.email');
    });

    it('optional schema allows empty, blank and undefined values', () => {
      expect(optionalEmailSchema(t).safeParse('').success).toBe(true);
      expect(optionalEmailSchema(t).safeParse('   ').success).toBe(true);
      expect(optionalEmailSchema(t).safeParse(undefined).success).toBe(true);
    });

    it('optional schema rejects invalid values with the translated error', () => {
      const result = optionalEmailSchema(t).safeParse('not-an-email');
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('validation.email');
    });
  });
});
