import { describe, test, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { parseMultipart, type MultipartPart } from '../../../../utils/testHelpers';
import { tenantIssueService, type TenantIssueJson } from '@/features/tenant/tenantIssues/services/TenantIssueService';

const issueId = 'test-issue';

describe('TenantIssueService with MSW (http)', () => {

  test('getIssues returns a list of issues', async () => {
    const issueList = await tenantIssueService.getIssues();
    expect(issueList.issues?.length).toBeGreaterThan(0);
    expect(issueList.issues?.[0]).toHaveProperty('id');
    expect(issueList.issues?.[0]).toHaveProperty('title');
  });

  test('getIssues fallback values are applied when data is missing', async () => {
    server.use(
      http.get('/ticketing/v1/tenant-relations/issues', () => HttpResponse.json({}))
    );

    const result = await tenantIssueService.getIssues();
    expect(result.size).toBe(0);
    expect(result.issues).toEqual([]);
  });

  test('getIssues sends cursor and limit when provided', async () => {
    let capturedParams: Record<string, string> = {};
    server.use(
      http.get('/ticketing/v1/tenant-relations/issues', ({ request }) => {
        const url = new URL(request.url);
        capturedParams = Object.fromEntries(url.searchParams.entries());
        return HttpResponse.json({ issues: [], size: 0 });
      }),
    );

    await tenantIssueService.getIssues('cursor-1', 25);

    expect(capturedParams).toMatchObject({ cursor: 'cursor-1', limit: '25' });
  });

  test('getIssue returns a single issue', async () => {
    const issue = await tenantIssueService.getIssue(issueId);
    expect(issue.id).toBe(issueId);
    expect(issue.title).toBeDefined();
    expect(issue.status).toBeDefined();
  });

  test('getIssue handles non-existing issue (404)', async () => {
    await expect(tenantIssueService.getIssue('non-existing-id')).rejects.toThrow();
  });

  test('createIssueWithAttachment uploads the issue with attached files', async () => {
    const newIssue: Partial<TenantIssueJson> = {
      title: 'Issue with attachment',
      description: 'Has a file',
      type: 'DEFECT',
      agreementId: 'agreement-1',
    };
    const file = new File(['file content'], 'photo.png', { type: 'image/png' });

    const createdIssue = await tenantIssueService.createIssueWithAttachment(newIssue, [file]);

    expect(createdIssue.id).toBeDefined();
    expect(createdIssue).toMatchObject(newIssue);
  });

  test('createIssueWithAttachment sends the issue JSON part and the attachments', async () => {
    let parts: Record<string, MultipartPart[]> = {};
    server.use(
      http.post('/ticketing/v1/tenant-relations/issues', async ({ request }) => {
        parts = await parseMultipart(request);
        return HttpResponse.json({ id: 'new-tenant-issue-id' }, { status: 201 });
      }),
    );
    const newIssue: Partial<TenantIssueJson> = { title: 'Issue with attachment', type: 'DEFECT' };

    await tenantIssueService.createIssueWithAttachment(newIssue, [
      new File(['a'], 'a.png', { type: 'image/png' }),
      new File(['b'], 'b.pdf', { type: 'application/pdf' }),
    ]);

    expect(parts.issue).toHaveLength(1);
    expect(parts.issue[0].contentType).toBe('application/json');
    expect(JSON.parse(parts.issue[0].body)).toEqual(newIssue);
    expect(parts.attachment?.map(part => part.filename)).toEqual(['a.png', 'b.pdf']);
  });

  test('createIssueWithAttachment rejects when the request fails', async () => {
    server.use(
      http.post('/ticketing/v1/tenant-relations/issues', () =>
        HttpResponse.json({ message: 'Error' }, { status: 500 }),
      ),
    );

    await expect(tenantIssueService.createIssueWithAttachment({ title: 'X' }, [])).rejects.toThrow();
  });

  test('closeIssue resolves successfully', async () => {
    await expect(tenantIssueService.closeIssue(issueId)).resolves.toBeDefined();
  });

  test('closeIssue rejects when closing fails', async () => {
    await expect(tenantIssueService.closeIssue('cannot-close')).rejects.toThrow();
  });
});
