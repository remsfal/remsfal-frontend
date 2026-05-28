import type { UnitType } from '@/services/PropertyService';

export const UNIT_TYPE_ICONS: Record<UnitType, string> = {
  PROPERTY: 'pi pi-map',
  BUILDING: 'pi pi-home',
  APARTMENT: 'pi pi-building',
  COMMERCIAL: 'pi pi-briefcase',
  STORAGE: 'pi pi-warehouse',
  SITE: 'pi pi-sun',
};

export function getIconForUnitType(type: UnitType): string {
  return UNIT_TYPE_ICONS[type] ?? 'pi pi-shop';
}
