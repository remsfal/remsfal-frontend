import { apiClient, type ApiComponents, type Readable, type RequestOptions } from '@/services/ApiClient';

export type ContractorTimelineJson = Readable<ApiComponents['schemas']['ContractorTimelineJson']>;
export type ContractorTimelineListJson = Readable<ApiComponents['schemas']['ContractorTimelineListJson']>;
export type OrderAttachmentJson = Readable<ApiComponents['schemas']['OrderAttachmentJson']>;
export type MessagePurpose = ApiComponents['schemas']['MessagePurpose'];

export interface CreateContractorTimelineEntry {
  purpose: MessagePurpose;
  message: string;
}

const TIMELINE_PATH = '/ticketing/v1/order-management/{issueId}/timeline';

class ContractorOrderTimelineService {
  async getTimelineEntries(issueId: string): Promise<ContractorTimelineListJson> {
    // The backend mounts this endpoint's shared interface under two different path templates
    // (contractor: {issueId}/timeline, manager: {issueId}/quotation-request/{requestId}/timeline),
    // so it deliberately declares no @PathParam on the shared method — the OpenAPI spec therefore
    // has no documented path parameter here, even though {issueId} must still be supplied at runtime.
    const options = { pathParams: { issueId } } as unknown as RequestOptions<typeof TIMELINE_PATH, 'get'>;
    const result = await apiClient.get(TIMELINE_PATH, options) as Partial<ContractorTimelineListJson>;
    return { timelines: result.timelines ?? [] };
  }

  async createTimelineEntryWithAttachments(
    issueId: string,
    entry: CreateContractorTimelineEntry,
    files: File[],
  ): Promise<void> {
    const formData = new FormData();
    formData.append('timeline', new Blob([JSON.stringify(entry)], { type: 'application/json' }));

    files.forEach((file) => {
      formData.append('attachment', file);
    });

    const body = formData as unknown as Parameters<typeof apiClient.post<typeof TIMELINE_PATH>>[1];
    const options = { pathParams: { issueId } } as unknown as RequestOptions<typeof TIMELINE_PATH, 'post'>;
    await apiClient.post(TIMELINE_PATH, body, options);
  }
}

export const contractorOrderTimelineService = new ContractorOrderTimelineService();
