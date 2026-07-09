import { apiClient } from '@/services/ApiClient';

export interface TenantTimelineJson {
  issueId?: string;
  tenancyId?: string;
  timelineId?: string;
  projectId?: string;
  attachmentId?: string[];
  senderId?: string;
  senderName?: string;
  title?: string;
  message?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface TenantTimelineListJson {
  size: number;
  timelines: TenantTimelineJson[];
}

class TenantTimelineService {
  async getTimelineEntries(issueId: string): Promise<TenantTimelineListJson> {
    // @ts-expect-error: Endpoint not yet in generated schema
    const result = await apiClient.get(
      '/ticketing/v1/issues/{issueId}/timelines',
      { pathParams: { issueId } },
    ) as Partial<TenantTimelineListJson>;

    return {
      size: result.size ?? result.timelines?.length ?? 0,
      timelines: result.timelines ?? [],
    };
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

    // @ts-expect-error: Endpoint not yet in generated schema
    await apiClient.post('/ticketing/v1/issues/{issueId}/timelines', formData, {
      pathParams: { issueId },
    });
  }
}

export const tenantTimelineService = new TenantTimelineService();
