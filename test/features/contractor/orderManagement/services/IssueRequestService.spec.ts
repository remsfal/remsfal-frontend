import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { issueRequestService } from '@/features/contractor/orderManagement/services/IssueRequestService';

describe('IssueRequestService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('createRequest posts the request JSON part without attachments', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);

    await issueRequestService.createRequest('issue-1', { message: 'Bitte um Rückmeldung' });

    expect(postSpy).toHaveBeenCalledWith(
      '/ticketing/v1/order-management/{issueId}/requests',
      expect.any(FormData),
      { pathParams: { issueId: 'issue-1' } },
    );
    const formData = postSpy.mock.calls[0][1] as FormData;
    expect(await (formData.get('request') as Blob).text()).toBe(JSON.stringify({ message: 'Bitte um Rückmeldung' }));
    expect(formData.getAll('attachment')).toEqual([]);
  });

  test('createRequest appends every file as an attachment part', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);
    const photo = new File(['a'], 'photo.png', { type: 'image/png' });
    const report = new File(['b'], 'report.pdf', { type: 'application/pdf' });

    await issueRequestService.createRequest('issue-1', { message: 'Anbei' }, [photo, report]);

    const formData = postSpy.mock.calls[0][1] as FormData;
    const attachments = formData.getAll('attachment') as File[];
    expect(attachments.map((file) => file.name)).toEqual(['photo.png', 'report.pdf']);
  });
});
