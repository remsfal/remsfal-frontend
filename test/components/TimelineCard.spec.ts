import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import FileUpload from 'primevue/fileupload';
import TimelineCard from '@/components/TimelineCard.vue';
import type { TenantTimelineJson } from '@/composables/useTimeline';

const toastAddMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAddMock }) }));

const makeTimeline = (overrides: Partial<TenantTimelineJson> = {}): TenantTimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const defaultLabels = { title: 'Verlauf' };

const i18nTexts = {loadErrorText: 'Nachrichten konnten nicht geladen werden.',};

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
    let resolveLoad: ((value: TenantTimelineJson[]) => void) | undefined;
    const load = vi.fn().mockReturnValue(new Promise<TenantTimelineJson[]>((resolve) => { resolveLoad = resolve; }));
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
    expect(wrapper.text()).toContain(i18nTexts.loadErrorText);
  });

  it('disables the compose form while the timeline is loading', async () => {
    let resolveLoad: ((value: TenantTimelineJson[]) => void) | undefined;
    const load = vi.fn().mockReturnValue(new Promise<TenantTimelineJson[]>((resolve) => { resolveLoad = resolve; }));
    const wrapper = mountCard({ load });
    await flushPromises();

    expect(wrapper.get('[data-testid="timeline-message-input"]').attributes('disabled')).toBeDefined();
    expect(wrapper.getComponent(FileUpload).props('disabled')).toBe(true);
    expect(wrapper.get('[data-testid="timeline-message-submit"]').attributes('disabled')).toBeDefined();

    resolveLoad?.([]);
    await flushPromises();
  });

  it('disables the compose form when loading failed', async () => {
    const wrapper = mountCard({ load: vi.fn().mockRejectedValue(new Error('fail')) });
    await flushPromises();

    expect(wrapper.get('[data-testid="timeline-message-input"]').attributes('disabled')).toBeDefined();
    expect(wrapper.getComponent(FileUpload).props('disabled')).toBe(true);
    expect(wrapper.get('[data-testid="timeline-message-submit"]').attributes('disabled')).toBeDefined();
  });

  it('does not send a message typed while the timeline could not be loaded', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const wrapper = mountCard({ load: vi.fn().mockRejectedValue(new Error('fail')), send });
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-input"]').setValue('Text');
    await wrapper.get('[data-testid="timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(send).not.toHaveBeenCalled();
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

  it('sends an empty message when sending attachments only', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const wrapper = mountCard({ load: vi.fn().mockResolvedValue([]), send });
    await flushPromises();

    const fileUpload = wrapper.getComponent(FileUpload);
    fileUpload.vm.$emit('select', { files: [new File(['a'], 'a.pdf')] });
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(send.mock.calls[0][0]).toEqual({ purpose: 'MESSAGE_SENT', message: '' });
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
    expect(wrapper.get('[data-testid="timeline-message-input"]').attributes('disabled')).toBeDefined();
    expect(wrapper.getComponent(FileUpload).props('disabled')).toBe(true);

    resolveSend?.();
    await flushPromises();
  });

  it('logs and shows an error toast when send() fails', async () => {
    const send = vi.fn().mockRejectedValue(new Error('boom'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const wrapper = mountCard({ load: vi.fn().mockResolvedValue([]), send });
    await flushPromises();

    await wrapper.get('[data-testid="timeline-message-input"]').setValue('Text');
    await wrapper.get('[data-testid="timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(toastAddMock).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Fehler',
      detail: 'Nachricht konnte nicht gesendet werden. Versuchen sie es später noch einmal.',
      life: 4000,
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create timeline entry', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  describe('hideComposer / before-composer slot', () => {
    it('renders the composer by default', async () => {
      const wrapper = mountCard({ load: vi.fn().mockResolvedValue([]) });
      await flushPromises();

      expect(wrapper.find('[data-testid="timeline-message-input"]').exists()).toBe(true);
    });

    it('hides the composer when hideComposer is set, and renders before-composer slot content', async () => {
      const wrapper = mount(TimelineCard, {
        props: {
          ...defaultLabels,
          load: vi.fn().mockResolvedValue([]),
          send: vi.fn().mockResolvedValue(undefined),
          hideComposer: true,
        },
        slots: {
          item: '<div class="item-stub">{{ params.item.timelineId }}</div>',
          'before-composer': '<div data-testid="custom-picker">Pick one</div>',
        },
      });
      await flushPromises();

      expect(wrapper.find('[data-testid="timeline-message-input"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="custom-picker"]').exists()).toBe(true);
    });
  });

  describe('composer-actions slot', () => {
    it('renders the default submit button when no slot content is given', async () => {
      const wrapper = mountCard({ load: vi.fn().mockResolvedValue([]) });
      await flushPromises();

      expect(wrapper.get('[data-testid="timeline-message-submit"]').text()).toBe('Nachricht senden');
    });

    it('lets a consumer render its own action row using the exposed submit/cancel/state', async () => {
      const send = vi.fn().mockResolvedValue(undefined);
      const wrapper = mount(TimelineCard, {
        props: {
          ...defaultLabels,
          load: vi.fn().mockResolvedValue([]),
          send,
        },
        slots: {
          item: '<div class="item-stub">{{ params.item.timelineId }}</div>',
          'composer-actions': `
            <button data-testid="custom-cancel" @click="params.cancel">Custom cancel</button>
            <button data-testid="custom-submit" :disabled="!params.canSubmit || params.sending" @click="params.submit">
              Custom submit
            </button>
          `,
        },
      });
      await flushPromises();

      expect(wrapper.find('[data-testid="timeline-message-submit"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="custom-submit"]').exists()).toBe(true);

      await wrapper.get('[data-testid="timeline-message-input"]').setValue('Text');
      await wrapper.get('[data-testid="custom-submit"]').trigger('click');
      await flushPromises();

      expect(send).toHaveBeenCalledWith({ purpose: 'MESSAGE_SENT', message: 'Text' }, []);

      await wrapper.get('[data-testid="timeline-message-input"]').setValue('Draft');
      await wrapper.get('[data-testid="custom-cancel"]').trigger('click');

      expect((wrapper.get('[data-testid="timeline-message-input"]').element as HTMLTextAreaElement).value).toBe('');
    });
  });
});
