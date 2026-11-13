import type { ComposerTranslation } from 'vue-i18n';
import type { UnitType } from './unitTypes';

/** A rentable unit as delivered by the different APIs (tenancies, rental agreements, tenants, ...). */
export interface UnitLabelSource {
  type?: UnitType | null;
  title?: string | null;
  location?: string | null;
}

/**
 * Translated name of a rentable unit type, e.g. "Wohnung" for `APARTMENT`.
 * Falls back to the raw value for unknown types and to "unknown unit" if the type is missing.
 */
export const getUnitTypeLabel = (
  unitType: UnitType | null | undefined,
  t: ComposerTranslation,
): string => {
  if (!unitType) {
    return t('unitTypes.unknown');
  }

  const labelKey = `unitTypes.${unitType.toLowerCase()}`;
  const label = t(labelKey);
  return label === labelKey ? unitType : label;
};

/**
 * Display label of a rentable unit: type name followed by title and location, e.g. "Wohnung 3A EG links".
 * Duplicate parts are shown once: a location equal to the title, and the type name if title or location
 * already contain it (title "Wohnung 3A" stays "Wohnung 3A"). Falls back to "unknown unit" if nothing is known.
 */
export const formatUnitLabel = (unit: UnitLabelSource, t: ComposerTranslation): string => {
  const details = [unit.title, unit.location]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part, index, parts) => parts.findIndex((value) => value.toLowerCase() === part.toLowerCase()) === index)
    .join(' ');
  const typeLabel = unit.type ? getUnitTypeLabel(unit.type, t) : null;
  const detailWords = details.toLowerCase().split(/\s+/);
  const showTypeLabel = typeLabel && !detailWords.includes(typeLabel.toLowerCase());
  return [showTypeLabel ? typeLabel : null, details].filter(Boolean).join(' ') || t('unitTypes.unknown');
};
