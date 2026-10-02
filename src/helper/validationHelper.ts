import type { useI18n } from 'vue-i18n';
import { z } from 'zod';

type Translate = ReturnType<typeof useI18n>['t'];

/**
 * Letters (incl. German umlauts), spaces, hyphens and apostrophes, e.g. "Hans-Peter", "Bad Homburg"
 * or "O'Brien". Accepts the typographic apostrophe (’) too, as autocorrect often inserts it.
 */
export const NAME_REGEX = /^[A-Za-zÄÖÜäöüß\s'’-]+$/;

/** Must contain at least one letter and one digit, e.g. "Hauptstraße 12a". */
export const STREET_REGEX = /^(?=.*[A-Za-zÄÖÜäöüß])(?=.*\d)[A-Za-zÄÖÜäöüß0-9\s./-]+$/;

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/** Required name of a person or place. */
export function nameSchema(t: Translate) {
  return z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    .regex(NAME_REGEX, { message: t('validation.name') });
}

/** Required street including house number. */
export function streetSchema(t: Translate) {
  return z
    .string()
    .trim()
    .min(1, { message: t('validation.required') })
    .regex(STREET_REGEX, { message: t('address.validation.streetInvalid') });
}

/** E.164: leading '+', no leading zero in the country code, 5–15 digits in total. */
export const PHONE_REGEX = /^\+[1-9]\d{4,14}$/;

export function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value);
}

/** Optional phone number entered via `PhoneInput`. */
export function phoneSchema(t: Translate) {
  return z
    .string()
    .optional()
    .refine((v) => !v || isValidPhone(v), { message: t('validation.phone') });
}

// Trim before piping into z.email(): the format check of z.email().trim() runs on the untrimmed value.

/** Required email address. */
export function emailSchema(t: Translate) {
  return z.string().trim().pipe(z.email({ message: t('validation.email') }));
}

/** Optional email address; empty input is allowed. */
export function optionalEmailSchema(t: Translate) {
  return z
    .string()
    .trim()
    .pipe(z.email({ message: t('validation.email') }).or(z.literal('')))
    .optional();
}
