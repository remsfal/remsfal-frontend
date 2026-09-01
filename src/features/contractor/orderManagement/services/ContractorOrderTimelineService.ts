import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type ContractorTimelineJson = Readable<ApiComponents['schemas']['ContractorTimelineJson']>;
export type ContractorTimelineListJson = Readable<ApiComponents['schemas']['ContractorTimelineListJson']>;
export type ParticipantRole = ApiComponents['schemas']['ParticipantRole'];
export type MessagePurpose = ApiComponents['schemas']['MessagePurpose'];

export interface CreateContractorTimelineEntry {
  purpose: MessagePurpose;
  message: string;
  recipient: ParticipantRole;
  attachmentIds?: string[];
}

class ContractorOrderTimelineService {
  async getTimelineEntries(requestId: string): Promise<ContractorTimelineListJson> {
    const result = await apiClient.get(
      '/ticketing/v1/order-management/quotation-requests/{requestId}/timeline',
      { pathParams: { requestId } },
    ) as Partial<ContractorTimelineListJson>;
    return { timelines: result.timelines ?? [] };
  }

  async createTimelineEntry(requestId: string, entry: CreateContractorTimelineEntry): Promise<void> {
    await apiClient.post(
      '/ticketing/v1/order-management/quotation-requests/{requestId}/timeline',
      entry,
      { pathParams: { requestId } },
    );
  }
}

export const contractorOrderTimelineService = new ContractorOrderTimelineService();
