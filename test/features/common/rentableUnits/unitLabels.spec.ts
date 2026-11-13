import { beforeAll, describe, expect, it } from 'vitest';
import { formatUnitLabel, getUnitTypeLabel } from '@/features/common/rentableUnits/unitLabels';
import type { UnitType } from '@/features/common/rentableUnits/unitTypes';
import i18n from '@/i18n/i18n';

type Translator = Parameters<typeof getUnitTypeLabel>[1];

const t = i18n.global.t as unknown as Translator;

beforeAll(() => {
  i18n.global.locale.value = 'de';
});

describe('unitLabels', () => {
  describe('getUnitTypeLabel', () => {
    it.each([
      ['PROPERTY', 'Grundstück'],
      ['SITE', 'Außenanlage'],
      ['BUILDING', 'Gebäude'],
      ['APARTMENT', 'Wohnung'],
      ['STORAGE', 'Nebennutzungsraum'],
      ['COMMERCIAL', 'Gewerbe'],
    ] as [UnitType, string][])('translates %s', (type, label) => {
      expect(getUnitTypeLabel(type, t)).toBe(label);
    });

    it('falls back to the raw value for an unknown type', () => {
      expect(getUnitTypeLabel('GARAGE' as UnitType, t)).toBe('GARAGE');
    });

    it('returns "unknown unit" when the type is missing', () => {
      expect(getUnitTypeLabel(undefined, t)).toBe('Unbekannte Einheit');
      expect(getUnitTypeLabel(null, t)).toBe('Unbekannte Einheit');
    });
  });

  describe('formatUnitLabel', () => {
    it('combines the type with title and location', () => {
      const unit = {
        type: 'APARTMENT' as UnitType,
        title: '3A',
        location: 'EG links',
      };
      expect(formatUnitLabel(unit, t)).toBe('Wohnung 3A EG links');
    });

    it('shows a location that equals the title only once', () => {
      const unit = {
        type: 'APARTMENT' as UnitType,
        title: 'EG links',
        location: ' eg links ',
      };
      expect(formatUnitLabel(unit, t)).toBe('Wohnung EG links');
    });

    it('omits the type when the title already contains it', () => {
      expect(formatUnitLabel({ type: 'APARTMENT', title: 'Wohnung 1A' }, t)).toBe('Wohnung 1A');
    });

    it('shows only the type when title and location are missing', () => {
      expect(formatUnitLabel({ type: 'STORAGE' }, t)).toBe('Nebennutzungsraum');
    });

    it('shows only title and location when the type is missing', () => {
      expect(formatUnitLabel({ title: 'Keller 2', location: null }, t)).toBe('Keller 2');
    });

    it('returns "unknown unit" when nothing is known', () => {
      expect(formatUnitLabel({ title: '  ' }, t)).toBe('Unbekannte Einheit');
    });
  });
});
