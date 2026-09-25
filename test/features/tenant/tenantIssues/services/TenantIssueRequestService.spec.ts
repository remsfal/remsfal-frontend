import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { tenantIssueRequestService } from '@/features/tenant/tenantIssues/services/TenantIssueRequestService';

describe('TenantIssueRequestService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getRequests requests the list by issue id', async () => {
    const requests = [{ issueRequestId: 'req-1', message: 'Bitte um Rückmeldung' }];
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ requests });

    const result = await tenantIssueRequestService.getRequests('issue-1');

    expect(getSpy).toHaveBeenCalledWith(
      '/ticketing/v1/tenant-relations/issues/{issueId}/requests',
      { pathParams: { issueId: 'issue-1' } },
    );
    expect(result).toEqual(requests);
  });

  test('getRequests returns fallback empty list when requests are missing', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({});

    const result = await tenantIssueRequestService.getRequests('issue-1');

    expect(result).toEqual([]);
  });

  test('answerRequest sends multipart form data', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);
    const files = [new File(['a'], 'a.png', { type: 'image/png' })];

    await tenantIssueRequestService.answerRequest('issue-1', 'req-1', { message: 'Anbei das Foto' }, files);

    const [path, payload, options] = postSpy.mock.calls[0];
    expect(path).toBe('/ticketing/v1/tenant-relations/issues/{issueId}/requests/{issueRequestId}/response');
    expect(payload).toBeInstanceOf(FormData);
    expect(options).toEqual({ pathParams: { issueId: 'issue-1', issueRequestId: 'req-1' } });

    const formData = payload as FormData;
    const responsePart = formData.get('response');
    expect(responsePart).toBeInstanceOf(Blob);
    expect(await (responsePart as Blob).text()).toBe(JSON.stringify({ message: 'Anbei das Foto' }));
    expect(formData.getAll('attachment')).toHaveLength(1);
  });

  test('answerRequest sends no attachment parts when no files are given', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);

    await tenantIssueRequestService.answerRequest('issue-1', 'req-1', { message: 'Nur Text' }, []);

    const formData = postSpy.mock.calls[0][1] as FormData;
    expect(formData.getAll('attachment')).toHaveLength(0);
  });
});
