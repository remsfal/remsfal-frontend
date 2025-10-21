import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse, PathParams } from 'msw';
import { issueService, type Issue, StatusValues } from '../../src/services/IssueService';


const projectId = 'test-project';
const issueId = 'test-issue';
const mockIssues: Issue[] = [
  { id: 'test-issue', title: 'Mock Issue 1', status: StatusValues.OPEN, owner: 'user1' },
  { id: 'issue-2', title: 'Mock Issue 2', status: StatusValues.CLOSED, owner: 'user2' },
];

//  MSW handlers (typed + safe)
const handlers = [
  // GET all issues
  http.get('/ticketing/v1/issues', () => {
    return HttpResponse.json({ issues: mockIssues });
  }),

  // GET single issue
  http.get<PathParams<'issueId'>>('/ticketing/v1/issues/:issueId', ({ params }) => {
    const { issueId } = params;
    const issue = mockIssues.find(i => i.id === issueId);
    return issue
      ? HttpResponse.json(issue)
      : HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // POST create issue
  http.post('/ticketing/v1/issues', async ({ request }) => {
    const body = (await request.json()) as Partial<Issue>;
    const createdIssue: Issue = {
      id: 'new-issue',
      title: body.title ?? 'Untitled',
      status: body.status ?? StatusValues.OPEN,
      owner: body.owner ?? 'unknown',
      description: body.description ?? '',
    };
    return HttpResponse.json(createdIssue, { status: 201 });
  }),

  // PATCH modify issue
  http.patch<PathParams<'issueId'>>('/ticketing/v1/issues/:issueId', async ({ params, request }) => {
    const { issueId } = params;
    const body = (await request.json()) as Partial<Issue>;
    const existing = mockIssues.find(i => i.id === issueId);
    const updatedIssue: Issue = {
      ...existing!,
      ...body,
      id: issueId,
    };
    return HttpResponse.json(updatedIssue);
  }),
];

const server = setupServer(...handlers);

describe('IssueService with MSW (http)', () => {
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
      owner: 'owner1',
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
