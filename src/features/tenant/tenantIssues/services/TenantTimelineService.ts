import { apiClient, type ApiComponents, type Readable, type Writable } from '@/services/ApiClient';

export type TenantTimelineJson = Readable<ApiComponents['schemas']['TenantTimelineJson']>;
export type TimelineListJson = Readable<ApiComponents['schemas']['TenantTimelineListJson']>;
export type TenantTimelineWritableJson = Writable<ApiComponents['schemas']['TenantTimelineJson']>;

class TenantTimelineService {
  async getTimelineEntries(issueId: string): Promise<TimelineListJson> {
    const result = await apiClient.get(
      '/ticketing/v1/tenant-relations/issues/{issueId}/timeline',
      { pathParams: { issueId } },
    ) as Partial<TimelineListJson>;
    return { timelines: result.timelines ?? [] };
  }

  async createTimelineEntryWithAttachments(
    issueId: string,
    timeline: TenantTimelineWritableJson,
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
