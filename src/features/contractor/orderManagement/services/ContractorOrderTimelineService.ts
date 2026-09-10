import { apiClient, type ApiComponents, type Readable, type Writable } from '@/services/ApiClient';

export type ContractorTimelineJson = Readable<ApiComponents['schemas']['ContractorTimelineJson']>;
export type ContractorTimelineListJson = Readable<ApiComponents['schemas']['ContractorTimelineListJson']>;
export type OrderAttachmentJson = Readable<ApiComponents['schemas']['OrderAttachmentJson']>;
export type MessagePurpose = ApiComponents['schemas']['MessagePurpose'];
export type ContractorTimelineWritableJson = Writable<ApiComponents['schemas']['ContractorTimelineJson']>;

class ContractorOrderTimelineService {
  async getTimelineEntries(issueId: string): Promise<Required<ContractorTimelineListJson>> {
    const result = await apiClient.get('/ticketing/v1/order-management/{issueId}/timeline', { pathParams: { issueId } });
    return { timelines: result.timelines ?? [], visibleToTenant: result.visibleToTenant ?? false };
  }

  async createTimelineEntryWithAttachments(
    issueId: string,
    entry: ContractorTimelineWritableJson,
    files: File[],
  ): Promise<void> {
    const formData = new FormData();
    formData.append('timeline', new Blob([JSON.stringify(entry)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    const body = formData as unknown as
      Parameters<typeof apiClient.post<'/ticketing/v1/order-management/{issueId}/timeline'>>[1];
    await apiClient.post('/ticketing/v1/order-management/{issueId}/timeline', body, { pathParams: { issueId } });
  }
}

export const contractorOrderTimelineService = new ContractorOrderTimelineService();
