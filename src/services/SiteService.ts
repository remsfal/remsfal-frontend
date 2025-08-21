import { typedRequest } from '@/services/api/typedRequest';
import type { RequestBody, ResponseType } from '@/services/api/typedRequest';
import type { components, paths } from '../../src/services/api/platform-schema';

export type SiteUnit = components['schemas']['SiteJson'];

export type CreateSiteBody = RequestBody<
  '/api/v1/projects/{projectId}/properties/{propertyId}/sites',
  'post'
>;

export type UpdateSiteBody = RequestBody<
  '/api/v1/projects/{projectId}/sites/{siteId}',
  'patch'
>;

export type GetSiteResponse = ResponseType<
  '/api/v1/projects/{projectId}/sites/{siteId}',
  'get'
>;

class SiteService {
  async createSite(
    projectId: string,
    propertyId: string,
    body: CreateSiteBody
  ): Promise<SiteUnit> {
    return typedRequest<
      '/api/v1/projects/{projectId}/properties/{propertyId}/sites',
      'post',
      SiteUnit
    >('post', '/api/v1/projects/{projectId}/properties/{propertyId}/sites', {
      pathParams: { projectId, propertyId },
      body,
    });
  }

  async getSite(projectId: string, siteId: string): Promise<GetSiteResponse> {
    return typedRequest<
      '/api/v1/projects/{projectId}/sites/{siteId}',
      'get',
      GetSiteResponse
    >('get', '/api/v1/projects/{projectId}/sites/{siteId}', {
      pathParams: { projectId, siteId },
    });
  }

  async updateSite(
    projectId: string,
    siteId: string,
    body: UpdateSiteBody
  ): Promise<SiteUnit> {
    return typedRequest<
      '/api/v1/projects/{projectId}/sites/{siteId}',
      'patch',
      SiteUnit
    >('patch', '/api/v1/projects/{projectId}/sites/{siteId}', {
      pathParams: { projectId, siteId },
      body,
    });
  }

  async deleteSite(projectId: string, siteId: string): Promise<void> {
    return typedRequest<
      '/api/v1/projects/{projectId}/sites/{siteId}',
      'delete',
      void
    >('delete', '/api/v1/projects/{projectId}/sites/{siteId}', {
      pathParams: { projectId, siteId },
    });
  }
}

export const siteService = new SiteService();
