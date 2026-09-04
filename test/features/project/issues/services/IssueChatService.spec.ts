import { afterEach, describe, expect, test, vi } from 'vitest';
import { apiClient } from '@/services/ApiClient';
import { issueChatService, type ChatMessageJson } from '@/features/project/issues/services/IssueChatService';

describe('IssueChatService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getMessages returns the messages array', async () => {
    const messages: ChatMessageJson[] = [{ messageId: 'm1', message: 'Hi' }];
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ messages });

    const result = await issueChatService.getMessages('issue-1');

    expect(getSpy).toHaveBeenCalledWith('/ticketing/v1/issues/{issueId}/chat', {pathParams: { issueId: 'issue-1' },});
    expect(result).toEqual(messages);
  });

  test('getMessages returns an empty array when messages is undefined', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({});

    const result = await issueChatService.getMessages('issue-1');

    expect(result).toEqual([]);
  });

  test('sendMessage posts the message and returns the created entry', async () => {
    const created: ChatMessageJson = { messageId: 'm2', message: 'Hello' };
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(created);

    const result = await issueChatService.sendMessage('issue-1', 'Hello');

    expect(postSpy).toHaveBeenCalledWith(
      '/ticketing/v1/issues/{issueId}/chat',
      { message: 'Hello' },
      { pathParams: { issueId: 'issue-1' } },
    );
    expect(result).toEqual(created);
  });
});
