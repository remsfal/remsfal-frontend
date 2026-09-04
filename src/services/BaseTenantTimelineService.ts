import { apiClient, type ApiComponents, type Readable, type RequestOptions } from '@/services/ApiClient';

export type TimelineJson = Readable<ApiComponents['schemas']['TimelineJson']>;
export type TimelineListJson = Readable<ApiComponents['schemas']['TimelineListJson']>;

type TimelineBasePath = '/ticketing/v1/issues' | '/ticketing/v1/tenant-relations/issues';

export class TimelineService<B extends TimelineBasePath> {
  private readonly timelinePath: `${B}/{issueId}/timeline`;

  constructor(basePath: B) {
    this.timelinePath = `${basePath}/{issueId}/timeline` as `${B}/{issueId}/timeline`;
  }

  async getTimelineEntries(issueId: string): Promise<TimelineListJson> {
    const options = { pathParams: { issueId } } as unknown as RequestOptions<typeof this.timelinePath, 'get'>;
    const result = await apiClient.get(this.timelinePath, options) as Partial<TimelineListJson>;
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

    const body = formData as unknown as Parameters<typeof apiClient.post<typeof this.timelinePath>>[1];
    const options = { pathParams: { issueId } } as unknown as RequestOptions<typeof this.timelinePath, 'post'>;
    await apiClient.post(this.timelinePath, body, options);
  }
}

export function createTimelineService<B extends TimelineBasePath>(basePath: B) {
  return new TimelineService(basePath);
}
