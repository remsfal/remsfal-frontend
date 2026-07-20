import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { tenantTimelineService, type TimelineListJson } from '@/services/TenantTimelineService';

describe('TenantTimelineService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getTimelineEntries requests timeline list by issue id', async () => {
    const timelineList: TimelineListJson = {
      timelines: [{
        timelineId: 'timeline-1', purpose: 'MESSAGE_SENT', message: 'Hello' 
      }],
    };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce(timelineList);

    const result = await tenantTimelineService.getTimelineEntries('issue-1');

    expect(getSpy).toHaveBeenCalledWith(
      '/ticketing/v1/tenant-relations/issues/{issueId}/timeline',
      { pathParams: { issueId: 'issue-1' } },
    );
    expect(result).toEqual(timelineList);
  });

  test('getTimelineEntries returns fallback empty list when timelines are missing', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({});

    const result = await tenantTimelineService.getTimelineEntries('issue-1');

    expect(result).toEqual({ timelines: [] });
  });

  test('createTimelineEntryWithAttachments sends multipart form data', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);
    const files = [
      new File(['a'], 'a.txt', { type: 'text/plain' }),
      new File(['b'], 'b.txt', { type: 'text/plain' }),
    ];

    await tenantTimelineService.createTimelineEntryWithAttachments(
      'issue-1',
      { purpose: 'MESSAGE_SENT' },
      files,
    );

    const [path, payload, options] = postSpy.mock.calls[0];
    expect(path).toBe('/ticketing/v1/tenant-relations/issues/{issueId}/timeline');
    expect(payload).toBeInstanceOf(FormData);
    expect(options).toEqual({ pathParams: { issueId: 'issue-1' } });

    const formData = payload as FormData;
    const timelinePart = formData.get('timeline');
    expect(timelinePart).toBeInstanceOf(Blob);
    expect(await (timelinePart as Blob).text()).toBe(JSON.stringify({ purpose: 'MESSAGE_SENT' }));
    expect(formData.getAll('attachment')).toHaveLength(2);
  });
});
