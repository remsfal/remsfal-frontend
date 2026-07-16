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
    expect(result.size).toBe(0);
    expect(result.issues).toEqual([]);
  });

  test('createIssueRelation returns the updated issue', async () => {
    const relatedIssue = await issueService.createIssueRelation(issueId, 'related-to', 'related-issue');
    expect(relatedIssue.id).toBe(issueId);
  });

  test('deleteIssueRelation resolves successfully', async () => {
    await expect(
      issueService.deleteIssueRelation(issueId, 'related-to', 'related-issue'),
    ).resolves.toBeDefined();
  });

  test('setParentIssue returns the updated issue', async () => {
    const updatedIssue = await issueService.setParentIssue(issueId, 'parent-issue');
    expect(updatedIssue.id).toBe(issueId);
  });

  test('getIssues sends all optional parameters when provided', async () => {
    let capturedParams: Record<string, string> = {};
    server.use(
      http.get('/ticketing/v1/issues', ({ request }) => {
        const url = new URL(request.url);
        capturedParams = Object.fromEntries(url.searchParams.entries());
        return HttpResponse.json({ issues: [], size: 0 });
      }),
    );

    await issueService.getIssues(
      projectId,
      'OPEN' as IssueStatus,
      'assignee-1',
      'agreement-1',
      'unit-1',
      'APARTMENT',
      'cursor-1',
      50,
    );

    expect(capturedParams).toMatchObject({
      projectId,
      status: 'OPEN',
      assigneeId: 'assignee-1',
      agreementId: 'agreement-1',
      rentalUnitId: 'unit-1',
      rentalUnitType: 'APARTMENT',
      cursor: 'cursor-1',
      limit: '50',
    });
  });

  test('deleteIssue resolves successfully', async () => {
    await expect(issueService.deleteIssue(issueId)).resolves.toBeDefined();
  });

  test('deleteIssue rejects when deletion fails', async () => {
    await expect(issueService.deleteIssue('cannot-delete')).rejects.toThrow();
  });

  test('deleteAttachment resolves successfully', async () => {
    await expect(
      issueService.deleteAttachment(issueId, 'attachment-1'),
    ).resolves.toBeDefined();
  });

  test('deleteAttachment rejects when deletion fails', async () => {
    await expect(
      issueService.deleteAttachment(issueId, 'cannot-delete'),
    ).rejects.toThrow();
  });

  test('uploadAttachments resolves successfully', async () => {
    const file = new File(['file content'], 'photo.png', { type: 'image/png' });

    await expect(issueService.uploadAttachments(issueId, [file])).resolves.toBeUndefined();
  });

  test('uploadAttachments throws when the upload fails', async () => {
    server.use(
      http.post('/ticketing/v1/issues/:issueId/attachments', () => {
        return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
      }),
    );
    const file = new File(['file content'], 'photo.png', { type: 'image/png' });

    await expect(issueService.uploadAttachments(issueId, [file])).rejects.toThrow(
      'Failed to upload attachments: 500',
    );
  });
});
