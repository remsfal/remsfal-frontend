import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { contractorOrderTimelineService, type ContractorTimelineListJson }
  from '@/features/contractor/orderManagement/services/ContractorOrderTimelineService';

describe('ContractorOrderTimelineService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getTimelineEntries requests timeline list by issue id', async () => {
    const timelineList: ContractorTimelineListJson = {
      timelines: [{
        timelineId: 'timeline-1', purpose: 'MESSAGE_SENT', message: 'Hello', senderRole: 'CONTRACTOR'
      }],
    };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce(timelineList);

    const result = await contractorOrderTimelineService.getTimelineEntries('issue-1');

    expect(getSpy).toHaveBeenCalledWith(
      '/ticketing/v1/order-management/{issueId}/timeline',
      { pathParams: { issueId: 'issue-1' } },
    );
    expect(result).toEqual({ ...timelineList, visibleToTenant: false });
  });

  test('getTimelineEntries returns fallback empty list and visibleToTenant when missing', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({});

    const result = await contractorOrderTimelineService.getTimelineEntries('issue-1');

    expect(result).toEqual({ timelines: [], visibleToTenant: false });
  });

  test('getTimelineEntries passes through visibleToTenant from the response', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ timelines: [], visibleToTenant: true });

    const result = await contractorOrderTimelineService.getTimelineEntries('issue-1');

    expect(result).toEqual({ timelines: [], visibleToTenant: true });
  });

  test('createTimelineEntryWithAttachments sends multipart form data', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);
    const files = [
      new File(['a'], 'a.txt', { type: 'text/plain' }),
      new File(['b'], 'b.txt', { type: 'text/plain' }),
    ];

    await contractorOrderTimelineService.createTimelineEntryWithAttachments(
      'issue-1',
      { purpose: 'MESSAGE_SENT', message: 'Hello tenant' },
      files,
    );

    const [path, payload, options] = postSpy.mock.calls[0];
    expect(path).toBe('/ticketing/v1/order-management/{issueId}/timeline');
    expect(payload).toBeInstanceOf(FormData);
    expect(options).toEqual({ pathParams: { issueId: 'issue-1' } });

    const formData = payload as FormData;
    const timelinePart = formData.get('timeline');
    expect(timelinePart).toBeInstanceOf(Blob);
    expect(await (timelinePart as Blob).text()).toBe(
      JSON.stringify({ purpose: 'MESSAGE_SENT', message: 'Hello tenant' }),
    );
    expect(formData.getAll('attachment')).toHaveLength(2);
  });

  test('createTimelineEntryWithAttachments includes messageToTenant in the timeline JSON part when set', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);

    await contractorOrderTimelineService.createTimelineEntryWithAttachments(
      'issue-1',
      {
        purpose: 'MESSAGE_SENT', message: 'Hallo Mieter', messageToTenant: true 
      },
      [],
    );

    const postSpy = vi.mocked(apiClient.post);
    const formData = postSpy.mock.calls[0][1] as FormData;
    const timelinePart = formData.get('timeline');
    expect(await (timelinePart as Blob).text()).toBe(
      JSON.stringify({
        purpose: 'MESSAGE_SENT', message: 'Hallo Mieter', messageToTenant: true 
      }),
    );
  });
});
