import { describe, test, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { issueService, type IssueJson, type IssueStatus } from '@/services/IssueService';

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
    const newIssue: Partial<IssueJson> = {
      title: 'New Issue',
      description: 'New Description',
      status: 'OPEN' as IssueStatus,
    };
    const createdIssue = await issueService.createProjectIssue(newIssue);
    expect(createdIssue.id).toBeDefined();
    expect(createdIssue.title).toBe('New Issue');
    expect(createdIssue.status).toBe('OPEN' as IssueStatus);
  });

  test('createTenancyIssueWithAttachment forwards files to initial timeline entry', async () => {
    let capturedTimelineAttachments = 0;

    server.use(
      http.post('/ticketing/v1/issues', async ({ request }) => {
        const form = await request.formData();
        const issuePayload = form.get('issue');

        expect(issuePayload).toBeInstanceOf(File);

        return HttpResponse.json({
          id: 'new-issue-id',
          title: 'New tenancy issue',
          status: 'OPEN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }),
      http.post('/ticketing/v1/issues/:issueId/timelines', async ({ request, params }) => {
        const form = await request.formData();
        capturedTimelineAttachments = form.getAll('attachment').length;

        expect(params.issueId).toBe('new-issue-id');
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    const files = [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')];

    await issueService.createTenancyIssueWithAttachment({ title: 'New tenancy issue' }, files);

    expect(capturedTimelineAttachments).toBe(2);
  });

  test('updateIssue returns the updated issue', async () => {
    const updates: Partial<IssueJson> = {
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
    expect(issueList.issues?.length).toBeGreaterThan(0);
    expect(issueList.first).toBeDefined();
    expect(issueList.size).toBeDefined();
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
    expect(result.issues).toEqual([]);
  });

  test('createIssueRelation returns the updated issue', async () => {
    const relatedIssue = await issueService.createIssueRelation(issueId, 'related-to', 'related-issue');
    expect(relatedIssue.id).toBe(issueId);
  });

  test('deleteIssueRelation resolves successfully', async () => {
    await issueService.deleteIssueRelation(issueId, 'related-to', 'related-issue');
  });

  test('setParentIssue returns the updated issue', async () => {
    const updatedIssue = await issueService.setParentIssue(issueId, 'parent-issue');
    expect(updatedIssue.id).toBe(issueId);
  });
});
