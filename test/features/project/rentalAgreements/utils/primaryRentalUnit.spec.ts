import { describe, it, expect } from 'vitest';
import type { RentalAgreementJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';
import { getPrimaryRentalUnitId } from '@/features/project/rentalAgreements/utils/primaryRentalUnit';

describe('getPrimaryRentalUnitId', () => {
  it('prefers apartments over all other units', () => {
    const agreement = {
      propertyRents: [{ rentalUnitId: 'prop-1' }],
      storageRents: [{ rentalUnitId: 'storage-1' }],
      apartmentRents: [{ rentalUnitId: 'apt-1' }],
    } as RentalAgreementJson;
    expect(getPrimaryRentalUnitId(agreement)).toBe('apt-1');
  });

  it('prefers a building over storage and property', () => {
    const agreement = {
      propertyRents: [{ rentalUnitId: 'prop-1' }],
      storageRents: [{ rentalUnitId: 'storage-1' }],
      buildingRents: [{ rentalUnitId: 'bld-1' }],
    } as RentalAgreementJson;
    expect(getPrimaryRentalUnitId(agreement)).toBe('bld-1');
  });

  it('falls back to the property', () => {
    const agreement = { propertyRents: [{ rentalUnitId: 'prop-1' }] } as RentalAgreementJson;
    expect(getPrimaryRentalUnitId(agreement)).toBe('prop-1');
  });

  it('returns undefined when no units are rented', () => {
    expect(getPrimaryRentalUnitId({} as RentalAgreementJson)).toBeUndefined();
  });
});
