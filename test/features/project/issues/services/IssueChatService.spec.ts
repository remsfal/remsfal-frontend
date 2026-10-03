import { describe, expect, test } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../mocks/server';
import { issueChatService, type ChatMessageJson } from '@/features/project/issues/services/IssueChatService';

const CHAT_URL = '/ticketing/v1/issues/:issueId/chat';

describe('IssueChatService', () => {
  test('getMessages returns the messages array', async () => {
    const messages: ChatMessageJson[] = [{ messageId: 'm1', message: 'Hi' }];
    let receivedIssueId: string | undefined;
    server.use(
      http.get(CHAT_URL, ({ params }) => {
        receivedIssueId = params.issueId as string;
        return HttpResponse.json({ messages });
      }),
    );

    const result = await issueChatService.getMessages('issue-1');

    expect(receivedIssueId).toBe('issue-1');
    expect(result).toEqual(messages);
  });

  test('getMessages returns an empty array when messages is undefined', async () => {
    server.use(http.get(CHAT_URL, () => HttpResponse.json({})));

    const result = await issueChatService.getMessages('issue-1');

    expect(result).toEqual([]);
  });

  test('getMessages rejects when the request fails', async () => {
    server.use(http.get(CHAT_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(issueChatService.getMessages('issue-1')).rejects.toThrow();
  });

  test('sendMessage posts the message and returns the created entry', async () => {
    const created: ChatMessageJson = { messageId: 'm2', message: 'Hello' };
    let receivedIssueId: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(CHAT_URL, async ({ request, params }) => {
        receivedIssueId = params.issueId as string;
        receivedBody = await request.json();
        return HttpResponse.json(created, { status: 201 });
      }),
    );

    const result = await issueChatService.sendMessage('issue-1', 'Hello');

    expect(receivedIssueId).toBe('issue-1');
    expect(receivedBody).toEqual({ message: 'Hello' });
    expect(result).toEqual(created);
  });

  test('sendMessage rejects when the request fails', async () => {
    server.use(http.post(CHAT_URL, () => HttpResponse.json({ message: 'Error' }, { status: 500 })));

    await expect(issueChatService.sendMessage('issue-1', 'Hello')).rejects.toThrow();
  });
});
