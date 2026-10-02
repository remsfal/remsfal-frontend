import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { issueRequestService } from '@/features/contractor/orderManagement/services/IssueRequestService';

describe('IssueRequestService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('createRequest sends multipart form data', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);
    const files = [new File(['a'], 'a.png', { type: 'image/png' })];

    await issueRequestService.createRequest('issue-1', { message: 'Bitte um Rückmeldung' }, files);

    const [path, payload, options] = postSpy.mock.calls[0];
    expect(path).toBe('/ticketing/v1/order-management/{issueId}/requests');
    expect(payload).toBeInstanceOf(FormData);
    expect(options).toEqual({ pathParams: { issueId: 'issue-1' } });

    const formData = payload as FormData;
    const requestPart = formData.get('request');
    expect(requestPart).toBeInstanceOf(Blob);
    expect(await (requestPart as Blob).text()).toBe(JSON.stringify({ message: 'Bitte um Rückmeldung' }));
    expect(formData.getAll('attachment')).toHaveLength(1);
  });

  test('createRequest sends no attachment parts when no files are given', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);

    await issueRequestService.createRequest('issue-1', { message: 'Nur Text' });

    const formData = postSpy.mock.calls[0][1] as FormData;
    expect(formData.getAll('attachment')).toHaveLength(0);
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
