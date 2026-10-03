import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { parseMultipart, type MultipartPart } from '../../../../utils/testHelpers';
import { tenantTimelineService, type TimelineListJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';

const TIMELINE_URL = '/ticketing/v1/tenant-relations/issues/:issueId/timeline';

describe('TenantTimelineService', () => {
  test('getTimelineEntries requests timeline list by issue id', async () => {
    const timelineList: TimelineListJson = {
      timelines: [{
        timelineId: 'timeline-1', purpose: 'MESSAGE_SENT', message: 'Hello'
      }],
    };
    let receivedIssueId: string | undefined;
    server.use(
      http.get(TIMELINE_URL, ({ params }) => {
        receivedIssueId = params.issueId as string;
        return HttpResponse.json(timelineList);
      }),
    );

    const result = await tenantTimelineService.getTimelineEntries('issue-1');

    expect(receivedIssueId).toBe('issue-1');
    expect(result).toEqual(timelineList);
  });

  test('getTimelineEntries returns fallback empty list when timelines are missing', async () => {
    server.use(http.get(TIMELINE_URL, () => HttpResponse.json({})));

    const result = await tenantTimelineService.getTimelineEntries('issue-1');

    expect(result).toEqual({ timelines: [] });
  });

  test('getTimelineEntries rejects when the request fails', async () => {
    server.use(http.get(TIMELINE_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(tenantTimelineService.getTimelineEntries('issue-1')).rejects.toThrow();
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
    const files = [
      new File(['a'], 'a.txt', { type: 'text/plain' }),
      new File(['b'], 'b.txt', { type: 'text/plain' }),
    ];

    await tenantTimelineService.createTimelineEntryWithAttachments(
      'issue-1',
      { purpose: 'MESSAGE_SENT', message: 'Hello' },
      files,
    );

    expect(receivedIssueId).toBe('issue-1');
    expect(parts.timeline).toHaveLength(1);
    expect(parts.timeline[0].contentType).toBe('application/json');
    expect(JSON.parse(parts.timeline[0].body)).toEqual({ purpose: 'MESSAGE_SENT', message: 'Hello' });
    expect(parts.attachment).toEqual([
      {
        filename: 'a.txt', contentType: 'text/plain', body: 'a'
      },
      {
        filename: 'b.txt', contentType: 'text/plain', body: 'b'
      },
    ]);
  });

  test('createTimelineEntryWithAttachments rejects when the request fails', async () => {
    server.use(http.post(TIMELINE_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(
      tenantTimelineService.createTimelineEntryWithAttachments(
        'issue-1',
        { purpose: 'MESSAGE_SENT', message: 'Hello' },
        [],
      ),
    ).rejects.toThrow();
  });
});
