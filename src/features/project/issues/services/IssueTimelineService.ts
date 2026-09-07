import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type TimelineJson = Readable<ApiComponents['schemas']['TenantTimelineJson']>;
export type TimelineListJson = Readable<ApiComponents['schemas']['TenantTimelineListJson']>;

class IssueTimelineService {
  async getTimelineEntries(issueId: string): Promise<TimelineListJson> {
    const result = await apiClient.get(
      '/ticketing/v1/issues/{issueId}/timeline',
      { pathParams: { issueId } },
    ) as Partial<TimelineListJson>;
    return { timelines: result.timelines ?? [] };
  }

  async createTimelineEntryWithAttachments(
    issueId: string,
    timeline: Partial<TimelineJson>,
    files: File[],
  ): Promise<void> {
    const formData = new FormData();
    formData.append('timeline', new Blob([JSON.stringify(timeline)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    const path = '/ticketing/v1/issues/{issueId}/tenant-timeline';
    // Do NOT set Content-Type manually — axios/browser sets multipart/form-data with boundary automatically
    return apiClient.post(path, formData as never, { pathParams: { issueId } }) as Promise<TimelineJson>;
  }
}

export const issueTimelineService = new IssueTimelineService();
