import { describe, test, expect } from 'vitest';
import RentalAgreementService from '@/services/RentalAgreementService';

describe('RentalAgreementService', () => {
  const service = new RentalAgreementService();
  const testProjectId = 'project-1';

  test('fetchRentalAgreements returns array', async () => {
    const agreements = await service.fetchRentalAgreements(testProjectId);
    expect(Array.isArray(agreements)).toBe(true);
  });

  test('loadRentalAgreement returns single agreement', async () => {
    // This will need MSW handler
    const agreementId = 'agreement-1';
    const agreement = await service.loadRentalAgreement(testProjectId, agreementId);
    expect(agreement).toBeDefined();
  });

  test('extractTenants returns flattened tenant list', () => {
    const agreements = [
      {
        id: 'a1',
        tenants: [
          {
 firstName: 'John', lastName: 'Doe', email: 'john@example.com' 
},
          {
 firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' 
}
        ]
      },
      {
        id: 'a2',
        tenants: [
          {
 firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com' 
}
        ]
      }
    ];

    const tenants = service.extractTenants(agreements);
    expect(tenants).toHaveLength(3);
    expect(tenants[0].firstName).toBe('John');
    expect(tenants[2].firstName).toBe('Bob');
  });

  test('extractTenants handles empty arrays', () => {
    const tenants = service.extractTenants([]);
    expect(tenants).toEqual([]);
  });

  test('extractTenants handles agreements without tenants', () => {
    const agreements = [{ id: 'a1' }, { id: 'a2' }];
    const tenants = service.extractTenants(agreements);
    expect(tenants).toEqual([]);
  });
});
