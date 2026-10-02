import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { parseMultipart, type MultipartPart } from '../../../../utils/testHelpers';
import { issueTimelineService } from '@/features/project/issues/services/IssueTimelineService';

const TIMELINE_URL = '/ticketing/v1/issues/:issueId/tenant-timeline';

describe('IssueTimelineService', () => {
  test('getTimelineEntries requests timeline list by issue id', async () => {
    const timelines = [{
      timelineId: 'timeline-1', purpose: 'MESSAGE_SENT', message: 'Hello'
    }];
    let receivedIssueId: string | undefined;
    server.use(
      http.get(TIMELINE_URL, ({ params }) => {
        receivedIssueId = params.issueId as string;
        return HttpResponse.json({ timelines });
      }),
    );

    const result = await issueTimelineService.getTimelineEntries('issue-1');

    expect(receivedIssueId).toBe('issue-1');
    expect(result).toEqual({ timelines });
  });

  test('getTimelineEntries returns fallback empty list when timelines are missing', async () => {
    server.use(http.get(TIMELINE_URL, () => HttpResponse.json({})));

    const result = await issueTimelineService.getTimelineEntries('issue-1');

    expect(result).toEqual({ timelines: [] });
  });

  test('getTimelineEntries rejects when the request fails', async () => {
    server.use(http.get(TIMELINE_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(issueTimelineService.getTimelineEntries('issue-1')).rejects.toThrow();
  });

  test('createTimelineEntryWithAttachments sends multipart form data', async () => {
    let receivedIssueId: string | undefined;
    let parts: Record<string, MultipartPart[]> = {};
    server.use(
      http.post(TIMELINE_URL, async ({ request, params }) => {
        receivedIssueId = params.issueId as string;
        parts = await parseMultipart(request);
        return new HttpResponse(null, { status: 201 });
      }),
    );

    await issueTimelineService.createTimelineEntryWithAttachments(
      'issue-1',
      { purpose: 'MESSAGE_SENT', message: 'Hello' },
      [new File(['a'], 'a.txt', { type: 'text/plain' })],
    );

    expect(receivedIssueId).toBe('issue-1');
    expect(parts.timeline).toHaveLength(1);
    expect(parts.timeline[0].contentType).toBe('application/json');
    expect(JSON.parse(parts.timeline[0].body)).toEqual({ purpose: 'MESSAGE_SENT', message: 'Hello' });
    expect(parts.attachment).toEqual([{
      filename: 'a.txt', contentType: 'text/plain', body: 'a'
    }]);
  });

  test('createTimelineEntryWithAttachments rejects when the request fails', async () => {
    server.use(http.post(TIMELINE_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(
      issueTimelineService.createTimelineEntryWithAttachments(
        'issue-1',
        { purpose: 'MESSAGE_SENT', message: 'Hello' },
        [],
      ),
    ).rejects.toThrow();
  });
});
