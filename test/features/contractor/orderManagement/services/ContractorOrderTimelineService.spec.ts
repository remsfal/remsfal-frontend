import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { contractorOrderTimelineService } from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';

describe('ContractorOrderTimelineService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getTimelineEntries requests timeline list by issue id', async () => {
    const timelines = [{
      timelineId: 'timeline-1', purpose: 'MESSAGE_SENT', message: 'Hello', senderRole: 'CONTRACTOR'
    }];
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ timelines });

    const result = await contractorOrderTimelineService.getTimelineEntries('issue-1');

    expect(getSpy).toHaveBeenCalledWith(
      '/ticketing/v1/order-management/{issueId}/timeline',
      { pathParams: { issueId: 'issue-1' } },
    );
    expect(result).toEqual(timelines);
  });

  test('getTimelineEntries returns fallback empty list when missing', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({});

    const result = await contractorOrderTimelineService.getTimelineEntries('issue-1');

    expect(result).toEqual([]);
  });

  test('createTimelineEntryWithAttachments sends the timeline JSON part', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);

    await contractorOrderTimelineService.createTimelineEntryWithAttachments(
      'issue-1',
      { purpose: 'MESSAGE_SENT', message: 'Hallo' },
      [],
    );

    const postSpy = vi.mocked(apiClient.post);
    const formData = postSpy.mock.calls[0][1] as FormData;
    const timelinePart = formData.get('timeline');
    expect(await (timelinePart as Blob).text()).toBe(
      JSON.stringify({ purpose: 'MESSAGE_SENT', message: 'Hallo' }),
    );
  });
});
