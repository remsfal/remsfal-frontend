import {describe, it, expect, beforeAll, afterAll, afterEach} from 'vitest';
import { ContractorService } from '../../src/services/ContractorService';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ContractorService (MSW with http)', () => {
  const service = new ContractorService();
  const issueId = 'test-issue';

  it('should get a list of issues', async () => {
    // Mock GET /api/v1/contractors/issues
    server.use(
      http.get('/api/v1/contractors/issues', () => {
        return HttpResponse.json({
          issues: [
            {
              id: issueId,
              title: 'Issue 1',
              description: 'Description 1',
              status: 'OPEN',
            },
          ],
          first: 0,
          size: 1,
          total: 1,
        });
      }),
    );

    const issueList = await service.getIssues();
    const issues = issueList.issues ?? []; // <-- safe default

    expect(issues.length).toBe(1);
    expect(issues[0].title).toBe('Issue 1');
    expect(issues[0].status).toBe('OPEN');
  });

  it('should get a single issue', async () => {
    // Mock GET /api/v1/contractors/issues/:issueId
    server.use(
      http.get('/api/v1/contractors/issues/:issueId', (req) => {
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
      http.get('/api/v1/contractors/issues/:issueId', () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
      }),
    );

    await expect(service.getIssue('non-existing')).rejects.toThrow();
  });
});
