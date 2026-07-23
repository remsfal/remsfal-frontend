import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { issueTimelineService, type TimelineJson } from '@/features/project/issues/services/IssueTimelineService';

describe('IssueTimelineService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('createTimelineEntry sends multipart form data', async () => {
    const timelineEntry: TimelineJson = {
      timelineId: 'timeline-1', purpose: 'MESSAGE_SENT', message: 'Hello' 
    };
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(timelineEntry);

    const result = await issueTimelineService.createTimelineEntry('issue-1', 'MESSAGE_SENT', 'Hello');

    const [path, payload, options] = postSpy.mock.calls[0];
    expect(path).toBe('/ticketing/v1/issues/{issueId}/timeline');
    expect(payload).toBeInstanceOf(FormData);
    expect(options).toEqual({ pathParams: { issueId: 'issue-1' } });

    const formData = payload as FormData;
    const timelinePart = formData.get('timeline');
    expect(timelinePart).toBeInstanceOf(Blob);
    expect(await (timelinePart as Blob).text()).toBe(
      JSON.stringify({ purpose: 'MESSAGE_SENT', message: 'Hello' }),
    );
    expect(result).toEqual(timelineEntry);
  });
});
