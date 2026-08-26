import { apiClient, type ApiComponents } from '@/services/ApiClient';

export type TimelineJson = ApiComponents['schemas']['TimelineJson'];
export type TimelineListJson = ApiComponents['schemas']['TimelineListJson'];

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

    await apiClient.post(
      '/ticketing/v1/issues/{issueId}/timeline',
      formData as never,
      { pathParams: { issueId } },
    );
  }
}

export const issueTimelineService = new IssueTimelineService();
