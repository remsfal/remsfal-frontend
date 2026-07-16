import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import FileUpload from 'primevue/fileupload';
import i18n from '@/i18n/i18n';
import { tenantTimelineService, type TenantTimelineJson, type TenantTimelineListJson } from '@/services/TenantTimelineService';

const toastAddMock = vi.fn();

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAddMock }) }));

vi.mock('@/services/TenantTimelineService', async () => {
  const actual = await vi.importActual<typeof import('@/services/TenantTimelineService')>(
    '@/services/TenantTimelineService',
  );
  return {
    ...actual,
    tenantTimelineService: {
      getTimelineEntries: vi.fn(),
      createTimelineEntryWithAttachments: vi.fn(),
    },
  };
});

const createTimelineList = (timelines: TenantTimelineJson[]): TenantTimelineListJson => ({ timelines });

const makeTimeline = (overrides: Partial<TenantTimelineJson> = {}): TenantTimelineJson => ({
  timelineId: 'timeline-1',
  purpose: 'MESSAGE_SENT',
  createdAt: '2026-01-02T10:00:00.000Z',
  ...overrides,
});

const mountTimelineCard = async (issueId = 'issue-1') => {
  const { default: TenantIssueTimelineCard } = await import(
    '@/features/tenant/tenantIssues/components/TenantIssueTimelineCard.vue'
  );
  return mount(TenantIssueTimelineCard, { props: { issueId } });
};

const mountWithTimelines = async (timelines: TenantTimelineJson[], issueId = 'issue-1') => {
  vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValueOnce(createTimelineList(timelines));
  const wrapper = await mountTimelineCard(issueId);
  await flushPromises();
  return wrapper;
};

describe('TenantIssueTimelineCard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValue(createTimelineList([]));
    vi.mocked(tenantTimelineService.createTimelineEntryWithAttachments).mockResolvedValue();
  });

  it('shows empty state when no timeline entries are available', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    expect(tenantTimelineService.getTimelineEntries).toHaveBeenCalledWith('issue-1');
    expect(wrapper.find('[data-testid="tenant-issue-timeline-empty"]').exists()).toBe(true);
  });

  it('shows loading spinner while timeline request is pending', async () => {
    let resolveRequest: ((value: TenantTimelineListJson) => void) | undefined;
    const pendingRequest = new Promise<TenantTimelineListJson>((resolve) => {
      resolveRequest = resolve;
    });
    vi.mocked(tenantTimelineService.getTimelineEntries).mockReturnValueOnce(pendingRequest);

    const wrapper = await mountTimelineCard();
    expect(wrapper.find('[data-testid="tenant-issue-timeline-loading"]').exists()).toBe(true);

    resolveRequest?.(createTimelineList([]));
    await flushPromises();

    expect(wrapper.find('[data-testid="tenant-issue-timeline-empty"]').exists()).toBe(true);
  });

  it.each([
    {
      name: 'renders non-image attachment tile and opens download',
      attachment: {
        attachmentId: 'att-1',
        fileName: 'report.pdf',
        contentType: 'application/pdf',
      },
      expectedUrl: '/ticketing/v1/tenant-relations/issues/issue-1/attachments/att-1/report.pdf',
      expectedLabel: 'PDF',
    },
    {
      name: 'falls back to attachment id when filename is missing',
      attachment: { attachmentId: 'fallback-att', contentType: 'application/pdf' },
      expectedUrl: '/ticketing/v1/tenant-relations/issues/issue-1/attachments/fallback-att/fallback-att',
      expectedLabel: 'FILE',
    },
  ])('$name', async ({ attachment, expectedUrl, expectedLabel }) => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = await mountWithTimelines([makeTimeline({ attachments: [attachment] })]);

    expect(wrapper.text()).toContain(expectedLabel);
    await wrapper.get('button.cursor-pointer').trigger('click');

    expect(openSpy).toHaveBeenCalledWith(expectedUrl, '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('renders image attachments and triggers download from image action button', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = await mountWithTimelines([
      makeTimeline({
        attachments: [
          {
            attachmentId: 'img-1',
            fileName: 'photo.jpg',
            contentType: 'image/jpeg',
          },
        ],
      }),
    ]);

    await wrapper.get('button.p-button').trigger('click');

    expect(openSpy).toHaveBeenCalledWith(
      '/ticketing/v1/tenant-relations/issues/issue-1/attachments/img-1/photo.jpg',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('treats image extensions as images even without content type', async () => {
    const wrapper = await mountWithTimelines([
      makeTimeline({ attachments: [{ attachmentId: 'img-ext-1', fileName: 'photo.webp' }] }),
    ]);

    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('WEBP');
  });

  it('shows FILE label for attachments without extension and ignores attachments without id', async () => {
    const wrapper = await mountWithTimelines([
      makeTimeline({
        attachments: [
          { attachmentId: 'file-1', fileName: 'README' },
          { fileName: 'missing-id.txt' },
        ],
      }),
    ]);

    expect(wrapper.text()).toContain('FILE');
    expect(wrapper.findAll('button.cursor-pointer')).toHaveLength(1);
  });

  it('renders purpose-based titles including fallback', async () => {
    const wrapper = await mountWithTimelines([
      makeTimeline({ timelineId: 'p1', purpose: 'ISSUE_CREATED' }),
      makeTimeline({ timelineId: 'p2', purpose: 'MESSAGE_SENT' }),
      makeTimeline({ timelineId: 'p3', purpose: 'APPOINTMENT_REQUESTED' }),
      makeTimeline({ timelineId: 'p4', purpose: 'APPOINTMENT_SCHEDULED' }),
      makeTimeline({ timelineId: 'p5', purpose: 'STATUS_CHANGED' }),
      makeTimeline({ timelineId: 'p6', purpose: 'UNKNOWN_PURPOSE' as TenantTimelineJson['purpose'] }),
      makeTimeline({ timelineId: 'p7', purpose: undefined }),
    ]);

    const text = wrapper.text();
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.issueCreatedTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.tenantMessageTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.appointmentRequestedTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.appointmentScheduledTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.statusChangedTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.entryFallbackTitle'));
  });

  it('shows error state when timeline loading fails', async () => {
    vi.mocked(tenantTimelineService.getTimelineEntries).mockRejectedValueOnce(new Error('load failed'));

    const wrapper = await mountTimelineCard();
    await flushPromises();

    expect(wrapper.find('[data-testid="tenant-issue-timeline-error"]').exists()).toBe(true);
    expect(wrapper.text()).toContain(i18n.global.t('tenantIssues.timeline.loadError'));
  });

  it('refetches timelines when issueId prop changes', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    await wrapper.setProps({ issueId: 'issue-2' });
    await flushPromises();

    expect(tenantTimelineService.getTimelineEntries).toHaveBeenCalledWith('issue-2');
  });

  it('renders fallback date placeholder when createdAt is missing', async () => {
    const wrapper = await mountWithTimelines([makeTimeline({ createdAt: undefined })]);

    expect(wrapper.find('[data-testid="tenant-issue-timeline-entry"]').text()).toContain(
      i18n.global.t('tenantIssues.timeline.tenantMessageTitle'),
    );
    expect(wrapper.find('.w-40').text()).toContain('-');
  });

  it.each([
    { label: 'CLOSED', message: 'CLOSED' },
    { label: 'REJECTED', message: 'REJECTED' },
    { label: 'normalized rejected', message: '  rejected  ' },
  ])('blocks sending when timeline contains $label status message', async ({ message }) => {
    const wrapper = await mountWithTimelines([
      makeTimeline({ purpose: 'STATUS_CHANGED', message }),
    ]);

    await wrapper.get('[data-testid="tenant-issue-timeline-message-input"]').setValue('Neue Nachricht');
    const submitButton = wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]');

    expect(submitButton.attributes('disabled')).toBeDefined();

    await submitButton.trigger('click');
    await flushPromises();

    expect(tenantTimelineService.createTimelineEntryWithAttachments).not.toHaveBeenCalled();
  });

  it('keeps submit disabled and does not send for empty message without attachments', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    const submitButton = wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]');
    expect(submitButton.attributes('disabled')).toBeDefined();

    await submitButton.trigger('click');
    await flushPromises();

    expect(tenantTimelineService.createTimelineEntryWithAttachments).not.toHaveBeenCalled();
  });

  it('submits tenant messages and clears the input after success', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    await wrapper.get('[data-testid="tenant-issue-timeline-message-input"]').setValue('Neue Nachricht');
    await wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(tenantTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
      'issue-1',
      expect.objectContaining({ message: 'Neue Nachricht' }),
      [],
    );
    expect((wrapper.get('#tenant-timeline-message').element as HTMLTextAreaElement).value).toBe('');
    expect(wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]').attributes('disabled')).toBeDefined();
  });

  it('submits selected files and merges file selections', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    await wrapper.get('[data-testid="tenant-issue-timeline-message-input"]').setValue('Mit Dateien');
    const fileUpload = wrapper.getComponent(FileUpload);
    fileUpload.vm.$emit('select', { files: [new File(['a'], 'a.pdf', { type: 'application/pdf' })] });
    fileUpload.vm.$emit('select', { files: [new File(['b'], 'b.pdf', { type: 'application/pdf' })] });
    await flushPromises();

    await wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]').trigger('click');
    await flushPromises();

    expect(tenantTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledWith(
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

    await wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]').trigger('click');
    await flushPromises();

    const secondArgument = vi.mocked(tenantTimelineService.createTimelineEntryWithAttachments).mock.calls[0][1];
    expect(secondArgument).toEqual(expect.objectContaining({ purpose: 'MESSAGE_SENT' }));
    expect(secondArgument).not.toHaveProperty('message');
  });

  it('keeps send button disabled when file select payload is not an array', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    const fileUpload = wrapper.getComponent(FileUpload);
    fileUpload.vm.$emit('select', { files: {} });
    await flushPromises();

    expect(wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]').attributes('disabled')).toBeDefined();
    expect(tenantTimelineService.createTimelineEntryWithAttachments).not.toHaveBeenCalled();
  });

  it('deduplicates files with same name/size/lastModified before submit', async () => {
    const wrapper = await mountTimelineCard();
    await flushPromises();

    await wrapper.get('[data-testid="tenant-issue-timeline-message-input"]').setValue('Deduplicate');
    const duplicateFile = new File(['same'], 'same.pdf', {
      type: 'application/pdf',
      lastModified: 1700000000000,
    });
    const fileUpload = wrapper.getComponent(FileUpload);
    fileUpload.vm.$emit('select', { files: [duplicateFile] });
    fileUpload.vm.$emit('select', { files: [duplicateFile] });
    await flushPromises();

    await wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]').trigger('click');
    await flushPromises();

    const submittedFiles = vi.mocked(tenantTimelineService.createTimelineEntryWithAttachments).mock.calls[0][2];
    expect(submittedFiles).toHaveLength(1);
    expect(submittedFiles[0]).toMatchObject({ name: 'same.pdf' });
  });

  it('prevents duplicate submits while request is still in flight', async () => {
    let resolveSubmission: (() => void) | undefined;
    const pendingSubmission = new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    });
    vi.mocked(tenantTimelineService.createTimelineEntryWithAttachments).mockReturnValueOnce(pendingSubmission);

    const wrapper = await mountTimelineCard();
    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-timeline-message-input"]').setValue('Eine Nachricht');

    const submitButton = wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]');
    await submitButton.trigger('click');
    await submitButton.trigger('click');
    await flushPromises();

    expect(tenantTimelineService.createTimelineEntryWithAttachments).toHaveBeenCalledTimes(1);

    resolveSubmission?.();
    await flushPromises();
  });

  it('encodes issue, attachment and filename in generated download URL', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const wrapper = await mountWithTimelines([
      makeTimeline({
        attachments: [{
          attachmentId: 'att id/1',
          fileName: 'file name #1.pdf',
          contentType: 'application/pdf',
        }],
      }),
    ], 'issue id/ä');

    await wrapper.get('button.cursor-pointer').trigger('click');

    expect(openSpy).toHaveBeenCalledWith(
      '/ticketing/v1/tenant-relations/issues/issue%20id%2F%C3%A4/attachments/att%20id%2F1/file%20name%20%231.pdf',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('shows an error toast when message submission fails', async () => {
    vi.mocked(tenantTimelineService.createTimelineEntryWithAttachments).mockRejectedValueOnce(
      new Error('submit failed'),
    );
    const wrapper = await mountTimelineCard();
    await flushPromises();

    await wrapper.get('[data-testid="tenant-issue-timeline-message-input"]').setValue('Fehlermeldung');
    await wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]').trigger('click');
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
