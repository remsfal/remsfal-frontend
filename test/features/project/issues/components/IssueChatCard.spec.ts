import { describe, test, expect, beforeEach, vi, type Mock } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import IssueChatCard from '@/features/project/issues/components/IssueChatCard.vue';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import { issueChatService, type ChatMessageJson } from '@/features/project/issues/services/IssueChatService';
import { useUserSessionStore } from '@/stores/UserSession';

vi.mock('@/features/project/issues/services/IssueChatService', () => ({
  issueChatService: {
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

describe('IssueChatCard.vue', () => {
  let sessionStore: ReturnType<typeof useUserSessionStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStore = useUserSessionStore();
    sessionStore.user = { id: 'user-1', email: 'me@example.com' } as ReturnType<typeof useUserSessionStore>['user'];
    (issueChatService.getMessages as Mock).mockResolvedValue([]);
  });

  const mountComponent = () => mount(IssueChatCard, { props: { issueId: 'issue-1' } });

  test('fetches messages for the given issue on mount', async () => {
    mountComponent();
    await flushPromises();

    expect(issueChatService.getMessages).toHaveBeenCalledWith('issue-1');
  });

  test('renders the internal-communication tag', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).toContain('Nur für Verwalter sichtbar');
  });

  test('shows empty state when there are no messages', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find('[data-testid="issue-chat-empty"]').exists()).toBe(true);
  });

  test('shows load error state when getMessages fails', async () => {
    (issueChatService.getMessages as Mock).mockRejectedValueOnce(new Error('fail'));

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).toContain('Chat-Nachrichten konnten nicht geladen werden.');
    expect(wrapper.find('[data-testid="issue-chat-empty"]').exists()).toBe(false);
  });

  test('marks own vs. other messages via the own prop on TimelineEntryCard', async () => {
    const messages: ChatMessageJson[] = [
      {
        messageId: 'm1', senderId: 'user-1', senderName: 'Me', message: 'own', createdAt: '2024-01-01T10:00:00Z',
      },
      {
        messageId: 'm2', senderId: 'user-2', senderName: 'Other', message: 'other', createdAt: '2024-01-01T10:01:00Z',
      },
    ];
    (issueChatService.getMessages as Mock).mockResolvedValue(messages);

    const wrapper = mountComponent();
    await flushPromises();

    const entries = wrapper.findAllComponents(TimelineEntryCard);
    expect(entries).toHaveLength(2);
    expect(entries[0].props('own')).toBe(true);
    expect(entries[0].props('title')).toBe('Sie');
    expect(entries[1].props('own')).toBe(false);
    expect(entries[1].props('title')).toBe('Other');
  });

  test('falls back to a placeholder label when senderName is missing', async () => {
    const messages: ChatMessageJson[] = [
      {
        messageId: 'm1', senderId: 'user-2', message: 'hi' 
      },
    ];
    (issueChatService.getMessages as Mock).mockResolvedValue(messages);

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findComponent(TimelineEntryCard).props('title')).toBe('Unbekannter Absender');
  });

  test('sorts messages chronologically by createdAt', async () => {
    const messages: ChatMessageJson[] = [
      {
        messageId: 'm2', senderId: 'user-1', message: 'second', createdAt: '2024-01-01T10:01:00Z',
      },
      {
        messageId: 'm1', senderId: 'user-1', message: 'first', createdAt: '2024-01-01T10:00:00Z',
      },
    ];
    (issueChatService.getMessages as Mock).mockResolvedValue(messages);

    const wrapper = mountComponent();
    await flushPromises();

    const entries = wrapper.findAllComponents(TimelineEntryCard);
    expect(entries[0].props('message')).toBe('first');
    expect(entries[1].props('message')).toBe('second');
  });

  test('sends a message and appends it to the list', async () => {
    const created: ChatMessageJson = {
      messageId: 'm3', senderId: 'user-1', message: 'New msg', createdAt: '2024-01-01T10:02:00Z',
    };
    (issueChatService.sendMessage as Mock).mockResolvedValue(created);

    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.find('#issue-chat-message').setValue('New msg');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(issueChatService.sendMessage).toHaveBeenCalledWith('issue-1', 'New msg');
    expect(wrapper.text()).toContain('New msg');
    expect(wrapper.find<HTMLTextAreaElement>('#issue-chat-message').element.value).toBe('');
  });

  test('does not send an empty or whitespace-only message', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.find('#issue-chat-message').setValue('   ');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(issueChatService.sendMessage).not.toHaveBeenCalled();
  });

  test('shows an error toast when sending a message fails', async () => {
    (issueChatService.sendMessage as Mock).mockRejectedValueOnce(new Error('fail'));

    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.find('#issue-chat-message').setValue('New msg');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    // messageText is preserved on failure, so the input is not cleared
    expect(wrapper.find<HTMLTextAreaElement>('#issue-chat-message').element.value).toBe('New msg');
  });

  test('re-fetches messages when the issueId prop changes', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.setProps({ issueId: 'issue-2' });
    await flushPromises();

    expect(issueChatService.getMessages).toHaveBeenCalledWith('issue-2');
  });
});
