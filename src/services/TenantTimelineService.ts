import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';
export type TenantTimelineJson = ApiComponents['schemas']['TenantTimelineJson'];
export type TenantTimelineListJson = ApiComponents['schemas']['TenantTimelineListJson'];

class TenantTimelineService {
  async getTimelineEntries(issueId: string): Promise<TenantTimelineListJson> {
    const result = await apiClient.get(
      '/ticketing/v1/tenant-relations/issues/{issueId}/timeline',
      { pathParams: { issueId } },
    ) as Partial<TenantTimelineListJson>;
    return { timelines: result.timelines ?? [] };
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

    await apiClient.post(
      '/ticketing/v1/tenant-relations/issues/{issueId}/timeline',
      formData as never,
      { pathParams: { issueId } },
    );
  }
}

export const tenantTimelineService = new TenantTimelineService();
