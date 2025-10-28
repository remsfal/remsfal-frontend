import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type SiteUnit = ApiComponents['schemas']['SiteJson'];

export default class SiteService {
  // Create a new site
  async createSite(projectId: string, propertyId: string, data: SiteUnit): Promise<SiteUnit> {
    const site = await apiClient.post(
      '/api/v1/projects/{projectId}/properties/{propertyId}/sites',
      data,
      { pathParams: { projectId, propertyId } },
    ) as SiteUnit;
    console.log('POST create site:', site);
    return site;
  }

  // Get a single site
  async getSite(projectId: string, siteId: string): Promise<SiteUnit> {
    try {
      const site = await apiClient.get('/api/v1/projects/{projectId}/sites/{siteId}', {
        pathParams: { projectId, siteId },
      });
      console.log('GET site:', site);
      return site;
    } catch (error: any) {
      console.error('site retrieval error', error?.response?.status || error);
      throw error?.response?.status || error;
    }
  }

  // Update a site
  async updateSite(projectId: string, siteId: string, data: SiteUnit): Promise<SiteUnit> {
    const updated = await apiClient.patch('/api/v1/projects/{projectId}/sites/{siteId}', data, {
      pathParams: { projectId, siteId },
    });
    console.log('PATCH update site:', updated);
    return updated;
  }

  // Delete a site (returns boolean for success/failure)
  async deleteSite(projectId: string, siteId: string): Promise<boolean> {
    try {
      await apiClient.delete('/api/v1/projects/{projectId}/sites/{siteId}', {
        pathParams: { projectId, siteId },
      });
      console.log('DELETE site successful', siteId);
      return true;
    } catch (error) {
      console.error('DELETE site failed:', error);
      return false;
    }
  }
}

export const siteService = new SiteService();
