import {describe, it, expect} from 'vitest';
import { ContractorService } from '@/services/ContractorService';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('ContractorService (MSW with http)', () => {
  const service = new ContractorService();
  const issueId = 'test-issue';

  it('getIssues returns an empty list without calling the backend', async () => {
    // No contractor-scoped issues endpoint exists yet; the manager endpoint now
    // requires a projectId this service doesn't have, so it must not call it.
    const issueList = await service.getIssues();

    expect(issueList).toEqual({ size: 0, issues: [] });
  });

  it('should get a single issue', async () => {
    // Mock GET /ticketing/v1/issues/:issueId
    server.use(
      http.get('/ticketing/v1/issues/:issueId', (req) => {
        const { issueId } = req.params;
        if (issueId === 'test-issue') {
          return HttpResponse.json({
            id: 'test-issue',
            title: 'Issue 1',
            description: 'Description 1',
            status: 'IN_PROGRESS',
          });
        }
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      }),
    );

    const issue = await service.getIssue(issueId);

    expect(issue.title).toBe('Issue 1');
    expect(issue.status).toBe('IN_PROGRESS');
  });

  it('should handle issue retrieval error', async () => {
    // Mock 404 for any issue ID
    server.use(
      http.get('/ticketing/v1/issues/:issueId', () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      }),
    );

    await expect(service.getIssue('non-existing')).rejects.toThrow();
  });
});
