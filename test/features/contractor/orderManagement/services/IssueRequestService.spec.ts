import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { issueRequestService } from '@/features/contractor/orderManagement/services/IssueRequestService';

describe('IssueRequestService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('createRequest posts the message to the requests endpoint', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(undefined);

    await issueRequestService.createRequest('issue-1', { message: 'Bitte um Rückmeldung' });

    expect(postSpy).toHaveBeenCalledWith(
      '/ticketing/v1/order-management/{issueId}/requests',
      { message: 'Bitte um Rückmeldung' },
      { pathParams: { issueId: 'issue-1' } },
    );
  });
});
