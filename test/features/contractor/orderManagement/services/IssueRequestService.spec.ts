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

  test('getRequests returns the open requests of the issue', async () => {
    const openRequest = { issueRequestId: 'req-1', message: 'Bitte um Rückmeldung' };
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ requests: [openRequest] });

    const requests = await issueRequestService.getRequests('issue-1');

    const pathParams = { issueId: 'issue-1' };
    expect(getSpy).toHaveBeenCalledWith('/ticketing/v1/order-management/{issueId}/requests', { pathParams });
    expect(requests).toEqual([openRequest]);
  });

  test('getRequests falls back to an empty list', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({});

    await expect(issueRequestService.getRequests('issue-1')).resolves.toEqual([]);
  });

  test('deleteRequest deletes the request of the issue', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValueOnce(undefined);

    await issueRequestService.deleteRequest('issue-1', 'req-1');

    const pathParams = { issueId: 'issue-1', requestId: 'req-1' };
    expect(deleteSpy).toHaveBeenCalledWith('/ticketing/v1/order-management/{issueId}/requests/{requestId}', { pathParams });
  });
});
