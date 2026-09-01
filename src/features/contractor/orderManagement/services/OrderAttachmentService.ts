import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type OrderAttachmentJson = Readable<ApiComponents['schemas']['OrderAttachmentJson']>;

class OrderAttachmentService {
  async uploadAttachments(requestId: string, files: File[]): Promise<OrderAttachmentJson[]> {
    const formData = new FormData();
    files.forEach((file) => { formData.append('attachment', file); });

    const result = await apiClient.post(
      '/ticketing/v1/order-management/quotation-requests/{processId}/attachments',
      formData as never,
      { pathParams: { processId: requestId } },
    );
    return result ?? [];
  }
}

export const orderAttachmentService = new OrderAttachmentService();
