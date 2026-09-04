import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type ContractorTimelineJson = Readable<ApiComponents['schemas']['ContractorTimelineJson']>;
export type ContractorTimelineListJson = Readable<ApiComponents['schemas']['ContractorTimelineListJson']>;
export type OrderAttachmentJson = Readable<ApiComponents['schemas']['OrderAttachmentJson']>;
export type ParticipantRole = ApiComponents['schemas']['ParticipantRole'];
export type MessagePurpose = ApiComponents['schemas']['MessagePurpose'];

export interface CreateContractorTimelineEntry {
  purpose: MessagePurpose;
  message: string;
  recipient: ParticipantRole;
}

class ContractorOrderTimelineService {
  async getTimelineEntries(requestId: string): Promise<ContractorTimelineListJson> {
    const result = await apiClient.get(
      '/ticketing/v1/order-management/quotation-requests/{requestId}/timeline',
      { pathParams: { requestId } },
    ) as Partial<ContractorTimelineListJson>;
    return { timelines: result.timelines ?? [] };
  }

  async createTimelineEntryWithAttachments(
    requestId: string,
    entry: CreateContractorTimelineEntry,
    files: File[],
  ): Promise<void> {
    const formData = new FormData();
    formData.append('timeline', new Blob([JSON.stringify(entry)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    await apiClient.post(
      '/ticketing/v1/order-management/quotation-requests/{requestId}/timeline',
      formData as never,
      { pathParams: { requestId } },
    );
  }
}

export const contractorOrderTimelineService = new ContractorOrderTimelineService();
