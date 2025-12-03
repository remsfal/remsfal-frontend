import {describe, it, expect, beforeAll, afterAll, afterEach} from 'vitest';
import { server } from '../mocks/server';
import { siteService, type SiteUnit } from '../../src/services/SiteService';

const projectId = 'project123';
const propertyId = 'property456';
const siteId = 'site789';

const mockSite: SiteUnit = {
  address: {
    street: 'Main St',
    city: 'Sample City',
    zip: '12345',
    province: '',
    countryCode: '',
  },
  title: 'New Site',
  description: 'A description of the new site.',
  space: 1000, 
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('SiteService (MSW)', () => {
  it('should create a site', async () => {
    const created = await siteService.createSite(projectId, propertyId, mockSite);
    expect(created).toMatchObject({ id: 'new-site-id', ...mockSite });
  });

  it('should get a site', async () => {
    const site = await siteService.getSite(projectId, siteId);
    expect(site).toMatchObject({ id: siteId, ...mockSite });
  });

  it('should update a site', async () => {
    const updates = { title: 'Updated Site', space: 2000 };
    const updated = await siteService.updateSite(projectId, siteId, updates);
    expect(updated).toMatchObject({ id: siteId, ...updates });
  });

  it('should delete a site', async () => {
    await siteService.deleteSite(projectId, siteId);
    // If no error is thrown, the delete was successful
  });

  it('should handle get site errors', async () => {
    await expect(siteService.getSite(projectId, 'not-found')).rejects.toThrow();
  });

  it('should handle delete site errors', async () => {
    await expect(
      siteService.deleteSite(projectId, 'cannot-delete'),
    ).rejects.toThrow();
  });
});
