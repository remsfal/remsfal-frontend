import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import FileUpload from 'primevue/fileupload';
import i18n from '@/i18n/i18n';
import {issueTimelineService,
  type TimelineJson,
  type TimelineListJson,} from '@/features/project/issues/services/IssueTimelineService';

const toastAddMock = vi.fn();

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAddMock }) }));

vi.mock('@/features/project/issues/services/IssueTimelineService', async () => {
  const actual = await vi.importActual<typeof import('@/features/project/issues/services/IssueTimelineService')>(
    '@/features/project/issues/services/IssueTimelineService',
  );
  return {
    ...actual,
    issueTimelineService: {
      getTimelineEntries: vi.fn(),
      createTimelineEntryWithAttachments: vi.fn(),
    },
  };
});

const createTimelineList = (timelines: TimelineJson[]): TimelineListJson => ({ timelines });

const makeTimeline = (overrides: Partial<TimelineJson> = {}): TimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  message: '',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const mountTimelineCard = async (issueId = 'issue-1') => {
  const { default: IssueTimelineCard } = await import(
    '@/features/project/issues/components/IssueTimelineCard.vue'
  );
  return mount(IssueTimelineCard, { props: { issueId } });
};

describe('IssueTimelineCard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(issueTimelineService.getTimelineEntries).mockResolvedValue(createTimelineList([]));
    vi.mocked(issueTimelineService.createTimelineEntryWithAttachments).mockResolvedValue();
  });

  it('shows empty state when no timeline entries are available', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    expect(issueTimelineService.getTimelineEntries).toHaveBeenCalledWith('issue-1');
    expect(wrapper.find('[data-testid="issue-timeline-empty"]').exists()).toBe(true);
  });

  it('shows loading spinner while timeline request is pending', async () => {
    let resolveRequest: ((value: TimelineListJson) => void) | undefined;
    const pendingRequest = new Promise<TimelineListJson>((resolve) => {
      resolveRequest = resolve;
    });
    vi.mocked(issueTimelineService.getTimelineEntries).mockReturnValueOnce(pendingRequest);

    const wrapper = await mountTimelineCard();
    expect(wrapper.find('[data-testid="issue-timeline-loading"]').exists()).toBe(true);

    resolveRequest?.(createTimelineList([]));
    await flushPromises();

    expect(wrapper.find('[data-testid="issue-timeline-empty"]').exists()).toBe(true);
  });

  it('shows error state when timeline loading fails', async () => {
    vi.mocked(issueTimelineService.getTimelineEntries).mockRejectedValueOnce(new Error('load failed'));

    const wrapper = await mountTimelineCard();
    await flushPromises();

    expect(wrapper.find('[data-testid="issue-timeline-error"]').exists()).toBe(true);
    expect(wrapper.text()).toContain(i18n.global.t('tenantIssues.timeline.loadError'));
  });

  it('refetches timelines when issueId prop changes', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    await wrapper.setProps({ issueId: 'issue-2' });
    await flushPromises();

    expect(issueTimelineService.getTimelineEntries).toHaveBeenCalledWith('issue-2');
  });

  it('keeps submit disabled and does not send for empty message without attachments', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    const submitButton = wrapper.get('[data-testid="issue-timeline-message-submit"]');
    expect(submitButton.attributes('disabled')).toBeDefined();

    await submitButton.trigger('click');
    await flushPromises();

    expect(issueTimelineService.createTimelineEntryWithAttachments).not.toHaveBeenCalled();
  });

  it('submits messages and clears the input after success', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    await wrapper.get('[data-testid="issue-timeline-message-input"]').setValue('Neue Nachricht');
    await wrapper.get('[data-testid="issue-timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(issueTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({ message: 'Neue Nachricht' }),
      [],
    );
    expect((wrapper.get('#issue-timeline-message').element as HTMLTextAreaElement).value).toBe('');
    expect(wrapper.get('[data-testid="issue-timeline-message-submit"]').attributes('disabled')).toBeDefined();
  });

  it('submits selected files and merges file selections', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    await wrapper.get('[data-testid="issue-timeline-message-input"]').setValue('Mit Dateien');
    const fileUpload = wrapper.getComponent(FileUpload);
    fileUpload.vm.$emit('select', { files: [new File(['a'], 'a.pdf', { type: 'application/pdf' })] });
    fileUpload.vm.$emit('select', { files: [new File(['b'], 'b.pdf', { type: 'application/pdf' })] });
    await flushPromises();

    await wrapper.get('[data-testid="issue-timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(issueTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({ message: 'Mit Dateien' }),
      expect.arrayContaining([
        expect.objectContaining({ name: 'a.pdf' }),
        expect.objectContaining({ name: 'b.pdf' }),
      ]),
    );
  });

  it('submits attachment-only messages without adding an empty message field', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    const fileUpload = wrapper.getComponent(FileUpload);
    fileUpload.vm.$emit('select', { files: [new File(['attachment'], 'only-attachment.pdf', { type: 'application/pdf' })] });
    await flushPromises();

    await wrapper.get('[data-testid="issue-timeline-message-submit"]').trigger('click');
    await flushPromises();

    const secondArgument = vi.mocked(issueTimelineService.createTimelineEntryWithAttachments).mock.calls[0][1];
    expect(secondArgument).toEqual(expect.objectContaining({ purpose: 'MESSAGE_SENT' }));
    expect(secondArgument).not.toHaveProperty('message');
  });

  it('keeps send button disabled when file select payload is not an array', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    const fileUpload = wrapper.getComponent(FileUpload);
    fileUpload.vm.$emit('select', { files: {} });
    await flushPromises();

    expect(wrapper.get('[data-testid="issue-timeline-message-submit"]').attributes('disabled')).toBeDefined();
    expect(issueTimelineService.createTimelineEntryWithAttachments).not.toHaveBeenCalled();
  });

  it('deduplicates files with same name/size/lastModified before submit', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    await wrapper.get('[data-testid="issue-timeline-message-input"]').setValue('Deduplicate');
    const duplicateFile = new File(['same'], 'same.pdf', {
      type: 'application/pdf',
      lastModified: 1700000000000,
    });
    const fileUpload = wrapper.getComponent(FileUpload);
    fileUpload.vm.$emit('select', { files: [duplicateFile] });
    fileUpload.vm.$emit('select', { files: [duplicateFile] });
    await flushPromises();

    await wrapper.get('[data-testid="issue-timeline-message-submit"]').trigger('click');
    await flushPromises();

    const submittedFiles = vi.mocked(issueTimelineService.createTimelineEntryWithAttachments).mock.calls[0][2];
    expect(submittedFiles).toHaveLength(1);
    expect(submittedFiles[0]).toMatchObject({ name: 'same.pdf' });
  });

  it('prevents duplicate submits while request is still in flight', async () => {
    let resolveSubmission: (() => void) | undefined;
    const pendingSubmission = new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    });
    vi.mocked(issueTimelineService.createTimelineEntryWithAttachments).mockReturnValueOnce(pendingSubmission);

    const wrapper = await mountTimelineCard();
    await flushPromises();
    await wrapper.get('[data-testid="issue-timeline-message-input"]').setValue('Eine Nachricht');

    const submitButton = wrapper.get('[data-testid="issue-timeline-message-submit"]');
    await submitButton.trigger('click');
    await submitButton.trigger('click');
    await flushPromises();

    expect(issueTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledTimes(1);

    resolveSubmission?.();
    await flushPromises();
  });

  it('shows an error toast when message submission fails', async () => {
    vi.mocked(issueTimelineService.createTimelineEntryWithAttachments).mockRejectedValueOnce(
      new Error('submit failed'),
    );
    const wrapper = await mountTimelineCard();
    await flushPromises();

    await wrapper.get('[data-testid="issue-timeline-message-input"]').setValue('Fehlermeldung');
    await wrapper.get('[data-testid="issue-timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(toastAddMock).toHaveBeenCalledTimes(1);
    const toastPayload = toastAddMock.mock.calls[0][0] as {
      severity?: string;
      detail?: string;
      summary?: string;
    };
    expect(toastPayload.severity).toBe('error');
    expect(toastPayload.summary).toBe(i18n.global.t('error.general'));
    expect(toastPayload.detail).toBe(i18n.global.t('tenantIssues.timeline.createError'));
  });
});
