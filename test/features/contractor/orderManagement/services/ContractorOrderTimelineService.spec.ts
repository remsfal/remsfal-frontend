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

  test('createTimelineEntry posts a plain JSON body with recipient and attachmentIds', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);

    await contractorOrderTimelineService.createTimelineEntry('request-1', {
      purpose: 'MESSAGE_SENT',
      message: 'Hello tenant',
      recipient: 'TENANT',
      attachmentIds: ['att-1'],
    });

    expect(postSpy).toHaveBeenCalledWith(
      '/ticketing/v1/order-management/quotation-requests/{requestId}/timeline',
      {
        purpose: 'MESSAGE_SENT', message: 'Hello tenant', recipient: 'TENANT', attachmentIds: ['att-1']
      },
      { pathParams: { requestId: 'request-1' } },
    );
    const [, payload] = postSpy.mock.calls[0];
    expect(payload).not.toBeInstanceOf(FormData);
  });
});
