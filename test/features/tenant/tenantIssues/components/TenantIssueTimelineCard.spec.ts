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

const mountTimelineCard = async (issueId = 'issue-1') => {
  const { default: TenantIssueTimelineCard } = await import(
    '@/features/tenant/tenantIssues/components/TenantIssueTimelineCard.vue'
  );

  return mount(TenantIssueTimelineCard, { props: { issueId } });
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

  it('renders non-image attachment tiles and opens download in a new tab', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValue(createTimelineList([
      {
        timelineId: 'timeline-1',
        purpose: 'MESSAGE_SENT',
        createdAt: '2026-01-02T10:00:00.000Z',
        attachments: [{
          attachmentId: 'att-1',
          fileName: 'report.pdf',
          contentType: 'application/pdf',
        }],
      },
    ]));

    const wrapper = await mountTimelineCard();

    await flushPromises();

    expect(wrapper.find('[data-testid="tenant-issue-timeline"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('PDF');

    await wrapper.get('button.cursor-pointer').trigger('click');

    expect(openSpy).toHaveBeenCalledWith(
      '/ticketing/v1/tenant-relations/issues/issue-1/attachments/att-1/report.pdf',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('renders image attachments and triggers download from image action button', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValue(createTimelineList([
      {
        timelineId: 'timeline-image',
        purpose: 'MESSAGE_SENT',
        createdAt: '2026-01-02T10:00:00.000Z',
        attachments: [{
          attachmentId: 'img-1',
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
        }],
      },
    ]));

    const wrapper = await mountTimelineCard();
    await flushPromises();

    const imageDownloadButton = wrapper.get('button.p-button');
    await imageDownloadButton.trigger('click');

    expect(openSpy).toHaveBeenCalledWith(
      '/ticketing/v1/tenant-relations/issues/issue-1/attachments/img-1/photo.jpg',
      '_blank',
      'noopener,noreferrer',
    );
    openSpy.mockRestore();
  });

  it('treats image extensions as images even without content type', async () => {
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValue(createTimelineList([
      {
        timelineId: 'timeline-image-ext',
        purpose: 'MESSAGE_SENT',
        createdAt: '2026-01-02T10:00:00.000Z',
        attachments: [{
          attachmentId: 'img-ext-1',
          fileName: 'photo.webp',
        }],
      },
    ]));

    const wrapper = await mountTimelineCard();
    await flushPromises();

    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.text()).not.toContain('WEBP');
  });

  it('renders purpose-based titles including fallback', async () => {
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValue(createTimelineList([
      {
        timelineId: 'p1',
        purpose: 'ISSUE_CREATED',
        createdAt: '2026-01-02T10:00:00.000Z',
      },
      {
        timelineId: 'p2',
        purpose: 'MESSAGE_SENT',
        createdAt: '2026-01-02T10:01:00.000Z',
      },
      {
        timelineId: 'p3',
        purpose: 'APPOINTMENT_REQUESTED',
        createdAt: '2026-01-02T10:02:00.000Z',
      },
      {
        timelineId: 'p4',
        purpose: 'APPOINTMENT_SCHEDULED',
        createdAt: '2026-01-02T10:03:00.000Z',
      },
      {
        timelineId: 'p5',
        purpose: 'STATUS_CHANGED',
        createdAt: '2026-01-02T10:04:00.000Z',
      },
      { timelineId: 'p6', createdAt: '2026-01-02T10:05:00.000Z' },
    ]));

    const wrapper = await mountTimelineCard();
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.issueCreatedTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.tenantMessageTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.appointmentRequestedTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.appointmentScheduledTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.statusChangedTitle'));
    expect(text).toContain(i18n.global.t('tenantIssues.timeline.entryFallbackTitle'));
  });

  it('shows FILE label for attachments without extension and ignores attachments without id', async () => {
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValue(createTimelineList([
      {
        timelineId: 'timeline-file',
        purpose: 'MESSAGE_SENT',
        createdAt: '2026-01-02T10:00:00.000Z',
        attachments: [
          { attachmentId: 'file-1', fileName: 'README' },
          { fileName: 'missing-id.txt' },
        ],
      },
    ]));

    const wrapper = await mountTimelineCard();
    await flushPromises();

    expect(wrapper.text()).toContain('FILE');
    expect(wrapper.findAll('[data-testid="tenant-issue-timeline-attachment-url"]')).toHaveLength(1);
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

  it('disables submit and blocks sending when timeline contains CLOSED or REJECTED message', async () => {
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValue(createTimelineList([
      {
        timelineId: 'closed-1',
        purpose: 'STATUS_CHANGED',
        message: 'CLOSED',
        createdAt: '2026-01-02T10:00:00.000Z',
      },
    ]));

    const wrapper = await mountTimelineCard();
    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-timeline-message-input"]').setValue('Neue Nachricht');

    const submitButton = wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]');
    expect(submitButton.attributes('disabled')).toBeDefined();

    await submitButton.trigger('click');
    await flushPromises();

    expect(tenantTimelineService.createTimelineEntryWithAttachments).not.toHaveBeenCalled();

    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValueOnce(createTimelineList([
      {
        timelineId: 'rejected-1',
        purpose: 'STATUS_CHANGED',
        message: 'REJECTED',
        createdAt: '2026-01-02T10:01:00.000Z',
      },
    ]));

    await wrapper.setProps({ issueId: 'issue-2' });
    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-timeline-message-input"]').setValue('Noch eine Nachricht');

    const rejectedSubmitButton = wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]');
    expect(rejectedSubmitButton.attributes('disabled')).toBeDefined();

    await rejectedSubmitButton.trigger('click');
    await flushPromises();

    expect(tenantTimelineService.createTimelineEntryWithAttachments).not.toHaveBeenCalled();
  });

  it('blocks sending for status messages regardless of casing and surrounding whitespace', async () => {
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValue(createTimelineList([
      {
        timelineId: 'rejected-normalized',
        purpose: 'STATUS_CHANGED',
        message: '  rejected  ',
        createdAt: '2026-01-02T10:00:00.000Z',
      },
    ]));

    const wrapper = await mountTimelineCard();
    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-timeline-message-input"]').setValue('Nachricht');
    await wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]').trigger('click');
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
    expect(
      wrapper.get('[data-testid="tenant-issue-timeline-message-submit"]').attributes('disabled'),
    ).toBeDefined();
  });

  it('merges selected files and submits them together with the message', async () => {
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
    vi.mocked(tenantTimelineService.getTimelineEntries).mockResolvedValue(createTimelineList([
      {
        timelineId: 'encoded-url',
        purpose: 'MESSAGE_SENT',
        createdAt: '2026-01-02T10:00:00.000Z',
        attachments: [{
          attachmentId: 'att id/1',
          fileName: 'file name #1.pdf',
          contentType: 'application/pdf',
        }],
      },
    ]));

    const wrapper = await mountTimelineCard('issue id/ä');
    await flushPromises();
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
