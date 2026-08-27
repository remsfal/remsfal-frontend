import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import FileUpload from 'primevue/fileupload';
import TimelineCard from '@/components/common/TimelineCard.vue';
import type { TimelineJson } from '@/composables/useTimeline';

const toastAddMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAddMock }) }));

const makeTimeline = (overrides: Partial<TimelineJson> = {}): TimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const defaultLabels = {
  title: 'Verlauf',
  emptyText: 'Keine Einträge',
  loadErrorText: 'Laden fehlgeschlagen',
  messagePlaceholder: 'Nachricht...',
  uploadButtonLabel: 'Hochladen',
  uploadEmptyText: 'Dateien hier ablegen',
  sendButtonLabel: 'Senden',
  sendErrorMessage: 'Senden fehlgeschlagen',
};

const mountCard = (props: Partial<InstanceType<typeof TimelineCard>['$props']> = {}) =>
  mount(TimelineCard, {
    props: {
      ...defaultLabels,
      load: vi.fn().mockResolvedValue([]),
      send: vi.fn().mockResolvedValue(undefined),
      ...props,
    },
    slots: { item: '<div class="item-stub">{{ params.item.timelineId }}</div>' },
  });

describe('TimelineCard component', () => {
  beforeEach(() => {
    toastAddMock.mockClear();
  });

  it('shows loading, then empty state when load() resolves with no entries', async () => {
    let resolveLoad: ((value: TimelineJson[]) => void) | undefined;
    const load = vi.fn().mockReturnValue(new Promise<TimelineJson[]>((resolve) => { resolveLoad = resolve; }));
    const wrapper = mountCard({ load });
    await flushPromises();

    expect(wrapper.find('[data-testid="timeline-loading"]').exists()).toBe(true);

    resolveLoad?.([]);
    await flushPromises();

    expect(wrapper.find('[data-testid="timeline-empty"]').exists()).toBe(true);
  });

  it('shows error state when load() rejects', async () => {
    const wrapper = mountCard({ load: vi.fn().mockRejectedValue(new Error('fail')) });
    await flushPromises();

    expect(wrapper.find('[data-testid="timeline-error"]').exists()).toBe(true);
    expect(wrapper.text()).toContain(defaultLabels.loadErrorText);
  });

  it('renders the item slot with the loaded entries', async () => {
    const wrapper = mountCard({ load: vi.fn().mockResolvedValue([makeTimeline({ timelineId: 'abc' })]) });
    await flushPromises();

    expect(wrapper.find('.item-stub').text()).toBe('abc');
  });

  it('refetches when watchSource changes', async () => {
    const load = vi.fn().mockResolvedValue([]);
    const source = ref('a');
    mountCard({ load, watchSource: () => source.value });
    await flushPromises();
    expect(load).toHaveBeenCalledTimes(1);

    source.value = 'b';
    await flushPromises();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('sends a trimmed message and clears the input on success', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const wrapper = mountCard({ load: vi.fn().mockResolvedValue([]), send });
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-input"]').setValue('  Hallo  ');
    await wrapper.get('[data-testid="timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(send).toHaveBeenCalledWith({ purpose: 'MESSAGE_SENT', message: 'Hallo' }, []);
    expect((wrapper.get('#timeline-message').element as HTMLTextAreaElement).value).toBe('');
  });

  it('omits the message field when sending attachments only', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const wrapper = mountCard({ load: vi.fn().mockResolvedValue([]), send });
    await flushPromises();

    const fileUpload = wrapper.getComponent(FileUpload);
    fileUpload.vm.$emit('select', { files: [new File(['a'], 'a.pdf')] });
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(send.mock.calls[0][0]).not.toHaveProperty('message');
  });

  it('deduplicates files with the same name/size/lastModified before submit', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const wrapper = mountCard({ load: vi.fn().mockResolvedValue([]), send });
    await flushPromises();

    const duplicateFile = new File(['same'], 'same.pdf', { lastModified: 1700000000000 });
    const fileUpload = wrapper.getComponent(FileUpload);
    fileUpload.vm.$emit('select', { files: [duplicateFile] });
    fileUpload.vm.$emit('select', { files: [duplicateFile] });
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-input"]').setValue('Dateien');
    await wrapper.get('[data-testid="timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(send.mock.calls[0][1]).toHaveLength(1);
  });

  it('disables submit while isBlocked() returns true', async () => {
    const wrapper = mountCard({
      load: vi.fn().mockResolvedValue([makeTimeline()]),
      isBlocked: () => true,
    });
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-input"]').setValue('Text');

    expect(wrapper.get('[data-testid="timeline-message-submit"]').attributes('disabled')).toBeDefined();
  });

  it('prevents duplicate submits while a send is in flight', async () => {
    let resolveSend: (() => void) | undefined;
    const send = vi.fn().mockReturnValue(new Promise<void>((resolve) => { resolveSend = resolve; }));
    const wrapper = mountCard({ load: vi.fn().mockResolvedValue([]), send });
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-input"]').setValue('Text');
    const submitButton = wrapper.get('[data-testid="timeline-message-submit"]');
    await submitButton.trigger('click');
    await submitButton.trigger('click');
    await flushPromises();

    expect(send).toHaveBeenCalledTimes(1);
    resolveSend?.();
    await flushPromises();
  });

  it('shows an error toast with the given message when send() fails', async () => {
    const send = vi.fn().mockRejectedValue(new Error('boom'));
    const wrapper = mountCard({ load: vi.fn().mockResolvedValue([]), send });
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-input"]').setValue('Text');
    await wrapper.get('[data-testid="timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(toastAddMock).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: defaultLabels.sendErrorMessage }),
    );
  });

  it('applies a custom testIdPrefix to all data-testid attributes', async () => {
    const wrapper = mountCard({ load: vi.fn().mockResolvedValue([]), testIdPrefix: 'custom' });
    await flushPromises();

    expect(wrapper.find('[data-testid="custom-empty"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="custom-message-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="custom-message-submit"]').exists()).toBe(true);
  });
});
