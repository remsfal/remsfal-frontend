import { describe, it, expect, vi, beforeEach } from 'vitest';
import TenancyService from '../../src/services/TenancyService';

describe('TenancyService', () => {
  const service = new TenancyService();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should get a list of tasks', async () => {
    const mockTenancy = service.loadMockTenancyData('1');
    const actualTenancy = {
      id: '1',
      listOfTenants: [
        {
          id: '1',
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max.mustermann@sample.com',
        },
        {
          id: '2',
          firstName: 'Erika',
          lastName: 'Musterfrau',
          email: 'erika.musterfrau@sample.com',
        },
      ],
      listOfUnits: [
        { id: '1', rentalObject: 'Wohnung', unitTitle: 'Wohnung 101' },
        { id: '2', rentalObject: 'Wohnung', unitTitle: 'Wohnung 202' },
      ],
      rentalStart: new Date('2020-01-01'),
      rentalEnd: new Date('2024-12-31'),
      active: false,
    };

    expect(mockTenancy).toEqual(actualTenancy);
  });
});
