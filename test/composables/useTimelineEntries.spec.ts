import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defineComponent, ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n/i18n';
import { useTimelineEntries } from '@/composables/useTimelineEntries';
import type { UseTimelineEntriesOptions } from '@/composables/useTimelineEntries';

interface TestEntry {
  purpose: string;
  message?: string;
}

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

type LoadEntriesFn = UseTimelineEntriesOptions<TestEntry>['loadEntries'];
type SendMessageFn = UseTimelineEntriesOptions<TestEntry>['sendMessage'];

function mountTimeline(options: UseTimelineEntriesOptions<TestEntry>) {
  const TestComponent = defineComponent({
    setup() {
      return { ...useTimelineEntries(options) };
    },
    template: '<div></div>',
  });
  return mount(TestComponent);
}

describe('useTimelineEntries', () => {
  let loadEntries: ReturnType<typeof vi.fn<LoadEntriesFn>>;
  let sendMessage: ReturnType<typeof vi.fn<SendMessageFn>>;

  beforeEach(() => {
    vi.clearAllMocks();
    loadEntries = vi.fn<LoadEntriesFn>().mockResolvedValue([]);
    sendMessage = vi.fn<SendMessageFn>().mockResolvedValue(undefined);
  });

  it('loads entries for the current issueId on mount', async () => {
    loadEntries.mockResolvedValue([{ purpose: 'MESSAGE_SENT', message: 'hi' }]);
    const wrapper = mountTimeline({
      issueId: () => 'issue-1',
      loadEntries,
      sendMessage,
      createErrorToastDetail: 'error.general',
    });
    await flushPromises();

    expect(loadEntries).toHaveBeenCalledWith('issue-1');
    expect(wrapper.vm.timelines).toEqual([{ purpose: 'MESSAGE_SENT', message: 'hi' }]);
    expect(wrapper.vm.loading).toBe(false);
    expect(wrapper.vm.error).toBe(false);
  });

  it('sets error and clears entries when loadEntries() rejects', async () => {
    loadEntries.mockRejectedValue(new Error('boom'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountTimeline({
      issueId: () => 'issue-1',
      loadEntries,
      sendMessage,
      createErrorToastDetail: 'error.general',
      loadErrorLogLabel: 'custom load error',
    });
    await flushPromises();

    expect(wrapper.vm.error).toBe(true);
    expect(wrapper.vm.timelines).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('custom load error', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('re-fetches when issueId changes', async () => {
    const currentIssueId = ref('issue-1');
    mountTimeline({
      issueId: () => currentIssueId.value,
      loadEntries,
      sendMessage,
      createErrorToastDetail: 'error.general',
    });
    await flushPromises();
    expect(loadEntries).toHaveBeenCalledWith('issue-1');

    currentIssueId.value = 'issue-2';
    await flushPromises();
    expect(loadEntries).toHaveBeenCalledWith('issue-2');
  });

  it('canSendMessage requires text or a file, and is false while sending', async () => {
    const wrapper = mountTimeline({
      issueId: () => 'issue-1',
      loadEntries,
      sendMessage,
      createErrorToastDetail: 'error.general',
    });
    await flushPromises();

    expect(wrapper.vm.canSendMessage).toBe(false);
    wrapper.vm.messageText = 'hello';
    await flushPromises();
    expect(wrapper.vm.canSendMessage).toBe(true);
  });

  it('does not submit when isBlocked() returns true', async () => {
    const wrapper = mountTimeline({
      issueId: () => 'issue-1',
      loadEntries,
      sendMessage,
      isBlocked: () => true,
      createErrorToastDetail: 'error.general',
    });
    await flushPromises();
    wrapper.vm.messageText = 'hello';
    await flushPromises();

    expect(wrapper.vm.canSendMessage).toBe(false);
    await wrapper.vm.submitMessage();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('submitMessage sends the trimmed message, clears input and re-fetches on success', async () => {
    const wrapper = mountTimeline({
      issueId: () => 'issue-1',
      loadEntries,
      sendMessage,
      createErrorToastDetail: 'error.general',
    });
    await flushPromises();
    wrapper.vm.messageText = '  hello  ';
    await flushPromises();

    await wrapper.vm.submitMessage();
    await flushPromises();

    expect(sendMessage).toHaveBeenCalledWith('issue-1', 'hello', []);
    expect(wrapper.vm.messageText).toBe('');
    expect(loadEntries).toHaveBeenCalledTimes(2);
  });

  it('shows an error toast and logs when sendMessage() rejects', async () => {
    sendMessage.mockRejectedValue(new Error('submit failed'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountTimeline({
      issueId: () => 'issue-1',
      loadEntries,
      sendMessage,
      createErrorToastDetail: 'tenantIssues.timeline.createError',
      createErrorLogLabel: 'custom submit error',
    });
    await flushPromises();
    wrapper.vm.messageText = 'hello';
    await flushPromises();

    await wrapper.vm.submitMessage();
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      detail: i18n.global.t('tenantIssues.timeline.createError'),
    }));
    expect(consoleErrorSpy).toHaveBeenCalledWith('custom submit error', expect.any(Error));
    expect(wrapper.vm.sendingMessage).toBe(false);
    consoleErrorSpy.mockRestore();
  });
});
