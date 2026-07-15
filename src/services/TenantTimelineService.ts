import { apiClient, type ApiComponents, type ApiPaths } from '@/services/ApiClient';

type TenantTimelineCreateBody = ApiPaths['/ticketing/v1/tenant-relations/issues/{issueId}/timeline']['post']['requestBody']['content']['multipart/form-data'];
export type TenantTimelineJson = ApiComponents['schemas']['TenantTimelineJson'];
export type TenantTimelineListJson = ApiComponents['schemas']['TenantTimelineListJson'];

class TenantTimelineService {
  async getTimelineEntries(issueId: string): Promise<TenantTimelineListJson> {
    return apiClient.get(
      '/ticketing/v1/tenant-relations/issues/{issueId}/timeline',
      { pathParams: { issueId } },
    );
  }

  async createTimelineEntryWithAttachments(
    issueId: string,
    timeline: Partial<TenantTimelineJson>,
    files: File[],
  ): Promise<void> {
    const formData = new FormData();
    formData.append('timeline', new Blob([JSON.stringify(timeline)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    await apiClient.post('/ticketing/v1/tenant-relations/issues/{issueId}/timeline', formData as TenantTimelineCreateBody, {
      pathParams: { issueId },
    });
  }
}

export const tenantTimelineService = new TenantTimelineService();
