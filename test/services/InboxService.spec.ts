import {describe, it, expect, vi} from 'vitest';
import { inboxService } from '../../src/services/InboxService';

describe('InboxService', () => {
  it('should generate mock inbox data', () => {
    const messages = inboxService.generateMockInboxData();

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBe(7);

    // Check structure of one message
    const message = messages[0];
    expect(message).toHaveProperty('id');
    expect(message).toHaveProperty('type');
    expect(message).toHaveProperty('contractor');
    expect(message).toHaveProperty('project');
    expect(message).toHaveProperty('unit');
    expect(message).toHaveProperty('tenant');
    expect(message).toHaveProperty('owner');
    expect(message).toHaveProperty('senderName');
    expect(message).toHaveProperty('senderEmail');
    expect(message).toHaveProperty('subject');
    expect(message).toHaveProperty('body');
    expect(message).toHaveProperty('receivedAt');
    expect(message).toHaveProperty('isRead');
    expect(typeof message.id).toBe('string');
    expect(message.receivedAt instanceof Date).toBe(true);
  });

  it('should fetch inbox data asynchronously', async () => {
    const spy = vi.spyOn(inboxService, 'generateMockInboxData');
    const data = await inboxService.fetchInboxData();

    expect(spy).toHaveBeenCalled();
    expect(data).toBeTypeOf('object');
    expect(data.length).toBe(7);
    expect(data[1].type).toBe('Rechnung');
  });

  it('should respect message read/unread status', () => {
    const messages = inboxService.generateMockInboxData();

    const readMessages = messages.filter((msg) => msg.isRead);
    const unreadMessages = messages.filter((msg) => !msg.isRead);

    expect(readMessages.length).toBe(2);
    expect(unreadMessages.length).toBe(5);
  });
});
