import { typedRequest } from '@/services/api/typedRequest';
import type { components } from '@/services/api/platform-schema';

export type SiteUnit = components['schemas']['SiteJson'];

export default class SiteService {
  static readonly BASE_PATH = '/api/v1/projects' as const;

  // Create a new site
  async createSite(projectId: string, propertyId: string, data: SiteUnit): Promise<SiteUnit> {
    const site = await typedRequest<'/api/v1/projects/{projectId}/properties/{propertyId}/sites', 'post', SiteUnit>(
      'post',
      `${SiteService.BASE_PATH}/{projectId}/properties/{propertyId}/sites`,
      {
        pathParams: { projectId, propertyId },
        body: data,
      },
    );
    console.log('POST create site:', site);
    return site;
  }

  // Get a single site
  async getSite(projectId: string, siteId: string): Promise<SiteUnit> {
    try {
      const site = await typedRequest<'/api/v1/projects/{projectId}/sites/{siteId}', 'get', SiteUnit>(
        'get',
        `${SiteService.BASE_PATH}/{projectId}/sites/{siteId}`,
        {
          pathParams: { projectId, siteId },
        },
      );
      console.log('GET site:', site);
      return site;
    } catch (error: any) {
      console.error('site retrieval error', error?.response?.status || error);
      throw error?.response?.status || error;
    }
  }

  // Update a site
  async updateSite(projectId: string, siteId: string, data: SiteUnit): Promise<SiteUnit> {
    const updated = await typedRequest<'/api/v1/projects/{projectId}/sites/{siteId}', 'patch', SiteUnit>(
      'patch',
      `${SiteService.BASE_PATH}/{projectId}/sites/{siteId}`,
      {
        pathParams: { projectId, siteId },
        body: data,
      },
    );
    console.log('PATCH update site:', updated);
    return updated;
  }

  // Delete a site (returns boolean for success/failure)
  async deleteSite(projectId: string, siteId: string): Promise<boolean> {
    try {
      await typedRequest<'/api/v1/projects/{projectId}/sites/{siteId}', 'delete'>(
        'delete',
        `${SiteService.BASE_PATH}/{projectId}/sites/{siteId}`,
        { pathParams: { projectId, siteId } },
      );
      console.log('DELETE site successful', siteId);
      return true;
    } catch (error) {
      console.error('DELETE site failed:', error);
      return false;
    }
  }
}

export const siteService = new SiteService();
