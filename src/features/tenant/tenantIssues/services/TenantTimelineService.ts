import { apiClient } from '@/services/ApiClient';
import type { components as ticketingComponents } from '@/services/api/ticketing-schema';

export type TimelineJson = ticketingComponents['schemas']['TimelineJson'];
export type TimelineListJson = ticketingComponents['schemas']['TimelineListJson'];

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
    timeline: Partial<TimelineJson>,
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
