import { describe, it, expect } from 'vitest';
import { UNIT_TYPE_ICONS, getIconForUnitType } from '@/features/project/rentableUnits/unitTypeIcons';
import type { UnitType } from '@/services/PropertyService';

describe('unitTypeIcons', () => {
  describe('UNIT_TYPE_ICONS', () => {
    it('has correct icon for PROPERTY', () => {
      expect(UNIT_TYPE_ICONS.PROPERTY).toBe('pi pi-map');
    });

    it('has correct icon for BUILDING', () => {
      expect(UNIT_TYPE_ICONS.BUILDING).toBe('pi pi-home');
    });

    it('has correct icon for APARTMENT', () => {
      expect(UNIT_TYPE_ICONS.APARTMENT).toBe('pi pi-building');
    });

    it('has correct icon for COMMERCIAL', () => {
      expect(UNIT_TYPE_ICONS.COMMERCIAL).toBe('pi pi-briefcase');
    });

    it('has correct icon for STORAGE', () => {
      expect(UNIT_TYPE_ICONS.STORAGE).toBe('pi pi-warehouse');
    });

    it('has correct icon for SITE', () => {
      expect(UNIT_TYPE_ICONS.SITE).toBe('pi pi-sun');
    });
  });

  describe('getIconForUnitType', () => {
    it('returns correct icon for PROPERTY', () => {
      expect(getIconForUnitType('PROPERTY')).toBe('pi pi-map');
    });

    it('returns correct icon for BUILDING', () => {
      expect(getIconForUnitType('BUILDING')).toBe('pi pi-home');
    });

    it('returns correct icon for APARTMENT', () => {
      expect(getIconForUnitType('APARTMENT')).toBe('pi pi-building');
    });

    it('returns correct icon for COMMERCIAL', () => {
      expect(getIconForUnitType('COMMERCIAL')).toBe('pi pi-briefcase');
    });

    it('returns correct icon for STORAGE', () => {
      expect(getIconForUnitType('STORAGE')).toBe('pi pi-warehouse');
    });

    it('returns correct icon for SITE', () => {
      expect(getIconForUnitType('SITE')).toBe('pi pi-sun');
    });

    it('returns fallback icon for unknown type', () => {
      expect(getIconForUnitType(undefined as unknown as UnitType)).toBe('pi pi-shop');
    });
  });
});
