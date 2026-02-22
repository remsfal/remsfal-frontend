import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type SiteJson = ApiComponents['schemas']['SiteJson'];

export default class SiteService {
  // Create a new site
  async createSite(projectId: string, propertyId: string, data: SiteJson): Promise<SiteJson> {
    const site = await apiClient.post(
      '/api/v1/projects/{projectId}/properties/{propertyId}/sites',
      data,
      { pathParams: { projectId, propertyId } },
    ) as SiteJson;
    console.log('POST create site:', site);
    return site;
  }

  // Get a single site
  async getSite(projectId: string, siteId: string): Promise<SiteJson> {
    const site = await apiClient.get('/api/v1/projects/{projectId}/sites/{siteId}', {pathParams: { projectId, siteId },});
    console.log('GET site:', site);
    return site;
  }

  // Update a site
  async updateSite(projectId: string, siteId: string, data: SiteJson): Promise<SiteJson> {
    const updated = await apiClient.patch(
      '/api/v1/projects/{projectId}/sites/{siteId}',
      data,
      {pathParams: { projectId, siteId },},
    );
    console.log('PATCH update site:', updated);
    return updated;
  }

  // Delete a site
  async deleteSite(projectId: string, siteId: string): Promise<void> {
    await apiClient.delete('/api/v1/projects/{projectId}/sites/{siteId}', {pathParams: { projectId, siteId },});
    console.log('DELETE site successful', siteId);
  }
}

export const siteService = new SiteService();
