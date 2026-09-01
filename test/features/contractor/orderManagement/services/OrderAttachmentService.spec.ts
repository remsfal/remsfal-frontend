import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { orderAttachmentService, type OrderAttachmentJson }
  from '@/features/contractor/orderManagement/services/OrderAttachmentService';

describe('OrderAttachmentService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('uploadAttachments sends multipart form data with one part per file', async () => {
    const uploaded: OrderAttachmentJson[] = [
      {
        attachmentId: 'att-1', fileName: 'a.txt', contentType: 'text/plain'
      },
      {
        attachmentId: 'att-2', fileName: 'b.txt', contentType: 'text/plain'
      },
    ];
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(uploaded);
    const files = [
      new File(['a'], 'a.txt', { type: 'text/plain' }),
      new File(['b'], 'b.txt', { type: 'text/plain' }),
    ];

    const result = await orderAttachmentService.uploadAttachments('request-1', files);

    const [path, payload, options] = postSpy.mock.calls[0];
    expect(path).toBe('/ticketing/v1/order-management/quotation-requests/{processId}/attachments');
    expect(payload).toBeInstanceOf(FormData);
    expect(options).toEqual({ pathParams: { processId: 'request-1' } });
    expect((payload as FormData).getAll('attachment')).toHaveLength(2);
    expect(result).toEqual(uploaded);
  });

  test('uploadAttachments returns an empty array when the response is empty', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);

    const result = await orderAttachmentService.uploadAttachments('request-1', []);

    expect(result).toEqual([]);
  });
});
