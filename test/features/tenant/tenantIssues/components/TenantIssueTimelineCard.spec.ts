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

const mountTimelineCard = async () => {
  const { default: TenantIssueTimelineCard } = await import(
    '@/features/tenant/tenantIssues/components/TenantIssueTimelineCard.vue'
  );

  return mount(TenantIssueTimelineCard, { props: { issueId: 'issue-1' } });
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
