import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { parseMultipart, type MultipartPart } from '../../../../utils/testHelpers';
import { issueRequestService } from '@/features/contractor/orderManagement/services/IssueRequestService';

const REQUESTS_URL = '/ticketing/v1/order-management/:issueId/requests';

describe('IssueRequestService', () => {
  test('createRequest sends multipart form data', async () => {
    let receivedIssueId: string | undefined;
    let parts: Record<string, MultipartPart[]> = {};
    server.use(
      http.post(REQUESTS_URL, async ({ request, params }) => {
        receivedIssueId = params.issueId as string;
        parts = await parseMultipart(request);
        return new HttpResponse(null, { status: 201 });
      }),
    );
    const files = [new File(['a'], 'a.png', { type: 'image/png' })];

    await issueRequestService.createRequest('issue-1', { message: 'Bitte um Rückmeldung' }, files);

    expect(receivedIssueId).toBe('issue-1');
    expect(parts.request).toHaveLength(1);
    expect(parts.request[0].contentType).toBe('application/json');
    expect(JSON.parse(parts.request[0].body)).toEqual({ message: 'Bitte um Rückmeldung' });
    expect(parts.attachment).toEqual([{
      filename: 'a.png', contentType: 'image/png', body: 'a'
    }]);
  });

  test('createRequest sends no attachment parts when no files are given', async () => {
    let parts: Record<string, MultipartPart[]> = {};
    server.use(
      http.post(REQUESTS_URL, async ({ request }) => {
        parts = await parseMultipart(request);
        return new HttpResponse(null, { status: 201 });
      }),
    );

    await issueRequestService.createRequest('issue-1', { message: 'Nur Text' });

    expect(parts.request).toHaveLength(1);
    expect(parts.attachment).toBeUndefined();
  });

  test('createRequest rejects when the request fails', async () => {
    server.use(http.post(REQUESTS_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(issueRequestService.createRequest('issue-1', { message: 'Nur Text' })).rejects.toThrow();
  });
});
