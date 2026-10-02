import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { parseMultipart, type MultipartPart } from '../../../../utils/testHelpers';
import { contractorTimelineService } from '@/features/project/issues/services/ContractorTimelineService';

const TIMELINE_URL = '/ticketing/v1/issues/:issueId/contractor-timeline';

describe('ContractorTimelineService', () => {
  test('getTimelineEntries fetches entries for the given issue', async () => {
    let receivedIssueId: string | undefined;
    let receivedOrganizationId: string | null = 'unset';
    server.use(
      http.get(TIMELINE_URL, ({ request, params }) => {
        receivedIssueId = params.issueId as string;
        receivedOrganizationId = new URL(request.url).searchParams.get('organizationId');
        return HttpResponse.json({
          timelines: [{
            timelineId: 't-1', purpose: 'MESSAGE_SENT', message: 'Hi'
          }],
        });
      }),
    );

    const result = await contractorTimelineService.getTimelineEntries('issue-1');

    expect(receivedIssueId).toBe('issue-1');
    expect(receivedOrganizationId).toBeNull();
    expect(result.timelines).toHaveLength(1);
  });

  test('getTimelineEntries restricts the timeline to the given organization', async () => {
    let receivedOrganizationId: string | null = null;
    server.use(
      http.get(TIMELINE_URL, ({ request }) => {
        receivedOrganizationId = new URL(request.url).searchParams.get('organizationId');
        return HttpResponse.json({ timelines: [] });
      }),
    );

    await contractorTimelineService.getTimelineEntries('issue-1', 'org-1');

    expect(receivedOrganizationId).toBe('org-1');
  });

  test('getTimelineEntries defaults to an empty list when the response is empty', async () => {
    server.use(http.get(TIMELINE_URL, () => HttpResponse.json({})));

    const result = await contractorTimelineService.getTimelineEntries('issue-1');

    expect(result).toEqual({ timelines: [] });
  });

  test('getTimelineEntries rejects when the request fails', async () => {
    server.use(http.get(TIMELINE_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(contractorTimelineService.getTimelineEntries('issue-1')).rejects.toThrow();
  });

  test('createTimelineEntryWithAttachments sends multipart form data with the organizationId query param', async () => {
    let receivedIssueId: string | undefined;
    let receivedOrganizationId: string | null = null;
    let parts: Record<string, MultipartPart[]> = {};
    server.use(
      http.post(TIMELINE_URL, async ({ request, params }) => {
        receivedIssueId = params.issueId as string;
        receivedOrganizationId = new URL(request.url).searchParams.get('organizationId');
        parts = await parseMultipart(request);
        return new HttpResponse(null, { status: 201 });
      }),
    );

    await contractorTimelineService.createTimelineEntryWithAttachments(
      'issue-1',
      'org-1',
      { purpose: 'MESSAGE_SENT', message: 'Hello' },
      [],
    );

    expect(receivedIssueId).toBe('issue-1');
    expect(receivedOrganizationId).toBe('org-1');
    expect(parts.timeline).toHaveLength(1);
    expect(parts.timeline[0].contentType).toBe('application/json');
    expect(JSON.parse(parts.timeline[0].body)).toEqual({ purpose: 'MESSAGE_SENT', message: 'Hello' });
    expect(parts.attachment).toBeUndefined();
  });

  test('createTimelineEntryWithAttachments rejects when the request fails', async () => {
    server.use(http.post(TIMELINE_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(
      contractorTimelineService.createTimelineEntryWithAttachments(
        'issue-1',
        'org-1',
        { purpose: 'MESSAGE_SENT', message: 'Hello' },
        [],
      ),
    ).rejects.toThrow();
  });
});
