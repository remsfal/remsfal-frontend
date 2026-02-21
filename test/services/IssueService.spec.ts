import { describe, test, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { issueService, type Issue, type Status } from '@/services/IssueService';

const projectId = 'test-project';
const issueId = 'test-issue';

describe('IssueService with MSW (http)', () => {

  test('getIssues returns a list of issues', async () => {
    const issueList = await issueService.getIssues(projectId);
    expect(issueList.issues?.length).toBeGreaterThan(0);
    expect(issueList.issues?.[0]).toHaveProperty('id');
    expect(issueList.issues?.[0]).toHaveProperty('title');
  });

  test('getIssue returns a single issue', async () => {
    const issue = await issueService.getIssue(issueId);
    expect(issue.id).toBe(issueId);
    expect(issue.title).toBeDefined();
    expect(issue.status).toBeDefined();
  });

  test('createIssue returns the newly created issue', async () => {
    const newIssue: Partial<Issue> = {
      title: 'New Issue',
      description: 'New Description',
      status: 'OPEN' as Status,
    };
    const createdIssue = await issueService.createProjectIssue(newIssue);
    expect(createdIssue.id).toBeDefined();
    expect(createdIssue.title).toBe('New Issue');
    expect(createdIssue.status).toBe('OPEN' as Status);
  });

  test('updateIssue returns the updated issue', async () => {
    const updates: Partial<Issue> = {
      title: 'Updated Issue',
      description: 'Updated Description',
    };
    const modifiedIssue = await issueService.updateIssue(issueId, updates);
    expect(modifiedIssue.id).toBe(issueId);
    expect(modifiedIssue.title).toBe('Updated Issue');
    expect(modifiedIssue.description).toBe('Updated Description');
  });

  test('getIssues handles optional parameters correctly', async () => {
    const issueList = await issueService.getIssues(projectId);
    expect(issueList.issues).toBeDefined();
    expect(issueList.issues.length).toBeGreaterThan(0);
    expect(issueList.first).toBeDefined();
    expect(issueList.size).toBeDefined();
    expect(issueList.total).toBeDefined();
  });
  
  test('getIssue handles non-existing issue (404)', async () => {
    await expect(issueService.getIssue('non-existing-id')).rejects.toThrow();
  });
  
  test('getIssues fallback values are applied when data is missing', async () => {
    // Mock empty response
    server.use(
      http.get('/ticketing/v1/issues', () => HttpResponse.json({}))
    );
  
    const result = await issueService.getIssues(projectId);
    expect(result.first).toBe(0);
    expect(result.size).toBe(0);
    expect(result.total).toBe(0);
    expect(result.issues).toEqual([]);
  });
});
