import { apiClient, type ApiComponents } from '@/services/ApiClient';
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

    // OpenAPI currently exposes multipart request body as non-JSON, which ApiClient.post does not infer yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await apiClient.post('/ticketing/v1/tenant-relations/issues/{issueId}/timeline', formData as any, {
      pathParams: { issueId },
    });
  }
}

export const tenantTimelineService = new TenantTimelineService();
