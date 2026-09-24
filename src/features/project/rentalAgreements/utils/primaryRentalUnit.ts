import type { RentalAgreementJson, RentJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

/**
 * Rent lists in order of how specifically they describe where a tenant lives or works:
 * dwelling and commercial units first, then the enclosing building, site, storage and property.
 */
const RENT_PRIORITY = [
  'apartmentRents',
  'commercialRents',
  'buildingRents',
  'siteRents',
  'storageRents',
  'propertyRents',
] as const satisfies readonly (keyof RentalAgreementJson)[];

/**
 * Returns the ID of the rental unit that best represents the given rental agreement,
 * or undefined if the agreement has no rented units.
 */
export function getPrimaryRentalUnitId(agreement: RentalAgreementJson): string | undefined {
  for (const field of RENT_PRIORITY) {
    const rents = (agreement[field] as RentJson[] | undefined) ?? [];
    const unitId = rents.find((rent) => rent.rentalUnitId)?.rentalUnitId;
    if (unitId) return unitId;
  }
  return undefined;
}
