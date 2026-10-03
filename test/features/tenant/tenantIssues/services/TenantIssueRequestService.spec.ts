import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { parseMultipart, type MultipartPart } from '../../../../utils/testHelpers';
import { tenantIssueRequestService } from '@/features/tenant/tenantIssues/services/TenantIssueRequestService';

const REQUESTS_URL = '/ticketing/v1/tenant-relations/issues/:issueId/requests';
const ANSWER_URL = '/ticketing/v1/tenant-relations/issues/:issueId/requests/:requestId';

describe('TenantIssueRequestService', () => {
  test('getRequests requests the list by issue id', async () => {
    const requests = [{ issueRequestId: 'req-1', message: 'Bitte um Rückmeldung' }];
    let receivedIssueId: string | undefined;
    server.use(
      http.get(REQUESTS_URL, ({ params }) => {
        receivedIssueId = params.issueId as string;
        return HttpResponse.json({ requests });
      }),
    );

    const result = await tenantIssueRequestService.getRequests('issue-1');

    expect(receivedIssueId).toBe('issue-1');
    expect(result).toEqual(requests);
  });

  test('getRequests returns fallback empty list when requests are missing', async () => {
    server.use(http.get(REQUESTS_URL, () => HttpResponse.json({})));

    const result = await tenantIssueRequestService.getRequests('issue-1');

    expect(result).toEqual([]);
  });

  test('getRequests rejects when the request fails', async () => {
    server.use(http.get(REQUESTS_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(tenantIssueRequestService.getRequests('issue-1')).rejects.toThrow();
  });

  test('answerRequest sends multipart form data', async () => {
    let receivedParams: Record<string, unknown> = {};
    let parts: Record<string, MultipartPart[]> = {};
    server.use(
      http.post(ANSWER_URL, async ({ request, params }) => {
        receivedParams = { ...params };
        parts = await parseMultipart(request);
        return new HttpResponse(null, { status: 201 });
      }),
    );
    const files = [new File(['a'], 'a.png', { type: 'image/png' })];

    await tenantIssueRequestService.answerRequest('issue-1', 'req-1', { message: 'Anbei das Foto' }, files);

    expect(receivedParams).toEqual({ issueId: 'issue-1', requestId: 'req-1' });
    expect(parts.response).toHaveLength(1);
    expect(parts.response[0].contentType).toBe('application/json');
    expect(JSON.parse(parts.response[0].body)).toEqual({ message: 'Anbei das Foto' });
    expect(parts.attachment).toEqual([{
      filename: 'a.png', contentType: 'image/png', body: 'a'
    }]);
  });

  test('answerRequest sends no attachment parts when no files are given', async () => {
    let parts: Record<string, MultipartPart[]> = {};
    server.use(
      http.post(ANSWER_URL, async ({ request }) => {
        parts = await parseMultipart(request);
        return new HttpResponse(null, { status: 201 });
      }),
    );

    await tenantIssueRequestService.answerRequest('issue-1', 'req-1', { message: 'Nur Text' }, []);

    expect(parts.response).toHaveLength(1);
    expect(parts.attachment).toBeUndefined();
  });

  test('answerRequest rejects when the request fails', async () => {
    server.use(http.post(ANSWER_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(
      tenantIssueRequestService.answerRequest('issue-1', 'req-1', { message: 'Nur Text' }, []),
    ).rejects.toThrow();
  });
});
