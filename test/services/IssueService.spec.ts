import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../../test/mocks/handlers';
import { issueService, type Issue, StatusValues } from '../../src/services/IssueService';

const server = setupServer(...handlers);

describe('IssueService with MSW', () => {
  const projectId = 'test-project';
  const issueId = 'test-issue';

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('getIssues returns a list of issues', async () => {
    const issueList = await issueService.getIssues(projectId);
    expect(issueList.issues?.length).toBeGreaterThan(0);
    expect(issueList.issues?.[0]).toHaveProperty('id');
    expect(issueList.issues?.[0]).toHaveProperty('title');
  });

  test('getIssue returns a single issue', async () => {
    const issue = await issueService.getIssue(projectId, issueId);
    expect(issue.id).toBe(issueId);
    expect(issue.title).toBeDefined();
    expect(issue.status).toBeDefined();
  });

  test('createIssue returns the newly created issue', async () => {
    const newIssue: Partial<Issue> = {
      title: 'New Issue',
      description: 'New Description',
      status: StatusValues.OPEN,
      ownerId: 'owner1',
    };
    const createdIssue = await issueService.createIssue(projectId, newIssue);
    expect(createdIssue.id).toBeDefined();
    expect(createdIssue.title).toBe('New Issue');
    expect(createdIssue.status).toBe(StatusValues.OPEN);
  });

  test('modifyIssue returns the updated issue', async () => {
    const updates: Partial<Issue> = {
      title: 'Updated Issue',
      description: 'Updated Description',
    };
    const modifiedIssue = await issueService.modifyIssue(projectId, issueId, updates);
    expect(modifiedIssue.id).toBe(issueId);
    expect(modifiedIssue.title).toBe('Updated Issue');
    expect(modifiedIssue.description).toBe('Updated Description');
  });
});
