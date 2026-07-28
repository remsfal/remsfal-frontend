import { describe, test, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { tenancyService, formatTenancyLabel, type TenancyJson } from '@/services/TenancyService';

describe('TenancyService with MSW', () => {
  test('getTenancies returns all tenancies', async () => {
    const tenancies = await tenancyService.getTenancies();
    expect(Array.isArray(tenancies)).toBe(true);
    if (tenancies.length > 0) {
      expect(tenancies[0]).toHaveProperty('id');
      expect(tenancies[0]).toHaveProperty('rentalUnits');
    }
  });

  test('getTenancies handles empty response', async () => {
    const tenancies = await tenancyService.getTenancies();
    expect(Array.isArray(tenancies)).toBe(true);
  });

  test('getTenancies falls back to an empty array when agreements field is missing', async () => {
    server.use(
      http.get('/api/v1/tenancies', () => HttpResponse.json({})),
    );

    const tenancies = await tenancyService.getTenancies();
    expect(tenancies).toEqual([]);
  });
});

describe('formatTenancyLabel', () => {
  test('uses only the street when zip/city are missing', () => {
    const tenancy = { address: { street: 'Musterstraße 1' } } as TenancyJson;
    expect(formatTenancyLabel(tenancy)).toBe('Musterstraße 1');
  });

  test('uses only zip/city when street is missing', () => {
    const tenancy = { address: { zip: '12345', city: 'Berlin' } } as TenancyJson;
    expect(formatTenancyLabel(tenancy)).toBe('12345 Berlin');
  });

  test('combines street and zip/city when all are present', () => {
    const tenancy = {
      address: {
        street: 'Musterstraße 1', zip: '12345', city: 'Berlin',
      },
    } as TenancyJson;
    expect(formatTenancyLabel(tenancy)).toBe('Musterstraße 1, 12345 Berlin');
  });

  test('falls back to projectTitle when there is no address', () => {
    const tenancy = { projectTitle: 'Wohnpark Nord' } as TenancyJson;
    expect(formatTenancyLabel(tenancy)).toBe('Wohnpark Nord');
  });

  test('falls back to the default label when neither address nor projectTitle exist', () => {
    const tenancy = {} as TenancyJson;
    expect(formatTenancyLabel(tenancy)).toBe('Unbekanntes Mietverhältnis');
  });

  test('falls back past an address object with no usable fields', () => {
    const tenancy = { address: {}, projectTitle: 'Wohnpark Nord' } as TenancyJson;
    expect(formatTenancyLabel(tenancy)).toBe('Wohnpark Nord');
  });
});
