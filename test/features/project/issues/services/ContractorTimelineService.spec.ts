import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { contractorTimelineService } from '@/features/project/issues/services/ContractorTimelineService';

describe('ContractorTimelineService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getTimelineEntries fetches entries for the given issue', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      timelines: [{
        timelineId: 't-1', purpose: 'MESSAGE_SENT', message: 'Hi' 
      }],
      visibleToTenant: true,
    });

    const result = await contractorTimelineService.getTimelineEntries('issue-1');

    const [path, options] = getSpy.mock.calls[0];
    expect(path).toBe('/ticketing/v1/issues/{issueId}/contractor-timeline');
    expect(options).toEqual({ pathParams: { issueId: 'issue-1' } });
    expect(result.timelines).toHaveLength(1);
    expect(result.visibleToTenant).toBe(true);
  });

  test('getTimelineEntries defaults to an empty list when the response is empty', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({});

    const result = await contractorTimelineService.getTimelineEntries('issue-1');

    expect(result).toEqual({ timelines: [], visibleToTenant: false });
  });

  test('createTimelineEntryWithAttachments sends multipart form data with the organizationId query param', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);

    await contractorTimelineService.createTimelineEntryWithAttachments(
      'issue-1',
      'org-1',
      { purpose: 'MESSAGE_SENT', message: 'Hello' },
      [],
    );

    const [path, payload, options] = postSpy.mock.calls[0];
    expect(path).toBe('/ticketing/v1/issues/{issueId}/contractor-timeline');
    expect(payload).toBeInstanceOf(FormData);
    expect(options).toEqual({ pathParams: { issueId: 'issue-1' }, params: { organizationId: 'org-1' } });

    const formData = payload as FormData;
    const timelinePart = formData.get('timeline');
    expect(timelinePart).toBeInstanceOf(Blob);
    expect(await (timelinePart as Blob).text()).toBe(
      JSON.stringify({ purpose: 'MESSAGE_SENT', message: 'Hello' }),
    );
  });
});
