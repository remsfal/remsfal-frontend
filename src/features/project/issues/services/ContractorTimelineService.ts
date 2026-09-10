import { apiClient, type ApiComponents, type Readable, type RequestOptions } from '@/services/ApiClient';

export type ContractorTimelineJson = Readable<ApiComponents['schemas']['ContractorTimelineJson']>;
export type ContractorTimelineListJson = Readable<ApiComponents['schemas']['ContractorTimelineListJson']>;

class ContractorTimelineService {
  // The OpenAPI spec for this endpoint doesn't declare the `issueId` path parameter, so the generated
  // type has `path?: never` here — same spec bug as `/ticketing/v1/order-management/{issueId}/timeline`,
  // worked around the same way (see ContractorOrderTimelineService).
  async getTimelineEntries(issueId: string): Promise<Required<ContractorTimelineListJson>> {
    const options = { pathParams: { issueId } } as unknown as
      RequestOptions<'/ticketing/v1/issues/{issueId}/contractor-timeline', 'get'>;
    const result = await apiClient.get(
      '/ticketing/v1/issues/{issueId}/contractor-timeline',
      options,
    ) as Partial<ContractorTimelineListJson>;
    return { timelines: result.timelines ?? [], visibleToTenant: result.visibleToTenant ?? false };
  }

  async createTimelineEntryWithAttachments(
    issueId: string,
    organizationId: string,
    timeline: Partial<ContractorTimelineJson>,
    files: File[],
  ): Promise<void> {
    const formData = new FormData();
    formData.append('timeline', new Blob([JSON.stringify(timeline)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    const body = formData as unknown as
      Parameters<typeof apiClient.post<'/ticketing/v1/issues/{issueId}/contractor-timeline'>>[1];
    const options = { pathParams: { issueId }, params: { organizationId } } as unknown as
      RequestOptions<'/ticketing/v1/issues/{issueId}/contractor-timeline', 'post'>;
    await apiClient.post('/ticketing/v1/issues/{issueId}/contractor-timeline', body, options);
  }
}

export const contractorTimelineService = new ContractorTimelineService();
