import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { contractorOrderTimelineService, type ContractorTimelineListJson }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';

describe('ContractorOrderTimelineService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getTimelineEntries requests timeline list by request id', async () => {
    const timelineList: ContractorTimelineListJson = {
      timelines: [{
        timelineId: 'timeline-1', purpose: 'MESSAGE_SENT', message: 'Hello', senderRole: 'CONTRACTOR'
      }],
    };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce(timelineList);

    const result = await contractorOrderTimelineService.getTimelineEntries('request-1');

    expect(getSpy).toHaveBeenCalledWith(
      '/ticketing/v1/order-management/quotation-requests/{requestId}/timeline',
      { pathParams: { requestId: 'request-1' } },
    );
    expect(result).toEqual(timelineList);
  });

  test('getTimelineEntries returns fallback empty list when timelines are missing', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({});

    const result = await contractorOrderTimelineService.getTimelineEntries('request-1');

    expect(result).toEqual({ timelines: [] });
  });

  test('createTimelineEntryWithAttachments sends multipart form data', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);
    const files = [
      new File(['a'], 'a.txt', { type: 'text/plain' }),
      new File(['b'], 'b.txt', { type: 'text/plain' }),
    ];

    await contractorOrderTimelineService.createTimelineEntryWithAttachments(
      'request-1',
      {
        purpose: 'MESSAGE_SENT', message: 'Hello tenant', recipient: 'TENANT' 
      },
      files,
    );

    const [path, payload, options] = postSpy.mock.calls[0];
    expect(path).toBe('/ticketing/v1/order-management/quotation-requests/{requestId}/timeline');
    expect(payload).toBeInstanceOf(FormData);
    expect(options).toEqual({ pathParams: { requestId: 'request-1' } });

    const formData = payload as FormData;
    const timelinePart = formData.get('timeline');
    expect(timelinePart).toBeInstanceOf(Blob);
    expect(await (timelinePart as Blob).text()).toBe(
      JSON.stringify({
        purpose: 'MESSAGE_SENT', message: 'Hello tenant', recipient: 'TENANT' 
      }),
    );
    expect(formData.getAll('attachment')).toHaveLength(2);
  });
});
