import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type TimelineJson = Readable<ApiComponents['schemas']['TimelineJson']>;
export type TimelineListJson = Readable<ApiComponents['schemas']['TimelineListJson']>;

type TimelineBasePath = '/ticketing/v1/issues' | '/ticketing/v1/tenant-relations/issues';

export function createTimelineService<B extends TimelineBasePath>(basePath: B) {
  const timelinePath = `${basePath}/{issueId}/timeline` as `${B}/{issueId}/timeline`;

  return {
    async getTimelineEntries(issueId: string): Promise<TimelineListJson> {
      const result = await apiClient.get(
        timelinePath,
        { pathParams: { issueId } } as never,
      ) as Partial<TimelineListJson>;
      return { timelines: result.timelines ?? [] };
    },

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
        timelinePath,
        formData as never,
        { pathParams: { issueId } } as never,
      );
    },
  };
}
