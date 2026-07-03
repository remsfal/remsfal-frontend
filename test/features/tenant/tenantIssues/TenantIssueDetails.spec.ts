import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { issueService } from '@/services/IssueService';
import router from '@/router';

const toastAddMock = vi.fn();

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAddMock }) }));

vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueService')>(
    '@/services/IssueService',
  );

  return {
    ...actual,
    issueService: {
      getIssue: vi.fn(),
      getIssues: vi.fn(),
      deleteIssue: vi.fn(),
      uploadAttachments: vi.fn(),
    },
  };
});

describe('TenantIssueDetails component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads issue details', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-42',
      title: 'Wasserschaden Küche',
      status: 'IN_PROGRESS',
      type: 'DEFECT',
      agreementId: 'agreement-1',
      description: 'Rohr unter der Spüle undicht.',
    });

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-42' } });

    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledWith('issue-42');
    expect(wrapper.text()).toContain('Wasserschaden Küche');
  });

  it('reloads issue details when issueId prop changes', async () => {
    vi.mocked(issueService.getIssue)
      .mockResolvedValueOnce({
        id: 'issue-1',
        title: 'Heizung defekt',
        status: 'OPEN',
        type: 'DEFECT',
        agreementId: 'agreement-1',
        description: 'Die Heizung ist kalt.',
      })
      .mockResolvedValueOnce({
        id: 'issue-2',
        title: 'Wasserleck',
        status: 'IN_PROGRESS',
        type: 'MAINTENANCE',
        agreementId: 'agreement-1',
        description: 'Leck im Bad.',
      });

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-1' } });

    await flushPromises();
    await wrapper.setProps({ issueId: 'issue-2' });
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenNthCalledWith(1, 'issue-1');
    expect(issueService.getIssue).toHaveBeenNthCalledWith(2, 'issue-2');
    expect(wrapper.text()).toContain('Wasserleck');
  });

  it('shows toast when loading issue details fails', async () => {
    vi.mocked(issueService.getIssue).mockRejectedValue(new Error('request failed'));

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-42' } });

    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledWith('issue-42');
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      life: 3000,
    }));
    expect(wrapper.find('[data-testid="tenant-issue-timeline-placeholder"]').exists()).toBe(false);
  });

  it('deletes issue when cancel button is clicked and navigates to issue list', async () => {
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined);

    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-42',
      title: 'Wasserschaden Küche',
      status: 'IN_PROGRESS',
      type: 'DEFECT',
      agreementId: 'agreement-1',
      description: 'Rohr unter der Spüle undicht.',
    });
    vi.mocked(issueService.deleteIssue).mockResolvedValue(undefined);

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, {
      props: { issueId: 'issue-42' },
      attachTo: document.body,
    });

    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-cancel"]').trigger('click');
    await flushPromises();
    expect(issueService.deleteIssue).not.toHaveBeenCalled();

    const confirmButton = document.querySelector(
      '[data-testid="tenant-issue-cancel-confirm"]',
    ) as HTMLButtonElement | null;
    expect(confirmButton).not.toBeNull();
    confirmButton?.click();
    await flushPromises();

    expect(issueService.deleteIssue).toHaveBeenCalledWith('issue-42');
    expect(pushSpy).toHaveBeenCalledWith({ name: 'TenantIssues' });
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success',
      life: 4000,
    }));
    wrapper.unmount();
    pushSpy.mockRestore();
  });

  it('shows error toast when deleting issue fails', async () => {
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined);

    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-42',
      title: 'Wasserschaden Küche',
      status: 'IN_PROGRESS',
      type: 'DEFECT',
      agreementId: 'agreement-1',
      description: 'Rohr unter der Spüle undicht.',
    });
    vi.mocked(issueService.deleteIssue).mockRejectedValue(new Error('delete failed'));

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, {
      props: { issueId: 'issue-42' },
      attachTo: document.body,
    });

    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-cancel"]').trigger('click');
    await flushPromises();

    const confirmButton = document.querySelector(
      '[data-testid="tenant-issue-cancel-confirm"]',
    ) as HTMLButtonElement | null;
    expect(confirmButton).not.toBeNull();
    confirmButton?.click();
    await flushPromises();

    expect(issueService.deleteIssue).toHaveBeenCalledWith('issue-42');
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      life: 5000,
    }));
    expect(pushSpy).not.toHaveBeenCalled();
    wrapper.unmount();
    pushSpy.mockRestore();
  });

  it('closes cancel dialog without deleting when cancel is clicked in dialog footer', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-42',
      title: 'Wasserschaden Küche',
      status: 'IN_PROGRESS',
      type: 'DEFECT',
      agreementId: 'agreement-1',
      description: 'Rohr unter der Spüle undicht.',
    });

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, {
      props: { issueId: 'issue-42' },
      attachTo: document.body,
    });

    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-cancel"]').trigger('click');
    await flushPromises();

    const cancelDialogButton = Array.from(document.querySelectorAll('button'))
      .find(button => button.textContent?.trim() === 'Abbrechen');
    expect(cancelDialogButton).toBeTruthy();
    cancelDialogButton?.click();
    await flushPromises();

    expect(issueService.deleteIssue).not.toHaveBeenCalled();
    expect(document.querySelector('[data-testid="tenant-issue-cancel-confirm"]')).toBeNull();
    wrapper.unmount();
  });

  it('prevents duplicate delete requests while deletion is in progress', async () => {
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined);
    let resolveDelete: (() => void) | undefined;
    const pendingDelete = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });

    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-42',
      title: 'Wasserschaden Küche',
      status: 'IN_PROGRESS',
      type: 'DEFECT',
      agreementId: 'agreement-1',
      description: 'Rohr unter der Spüle undicht.',
    });
    vi.mocked(issueService.deleteIssue).mockReturnValue(pendingDelete);

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, {
      props: { issueId: 'issue-42' },
      attachTo: document.body,
    });

    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-cancel"]').trigger('click');
    await flushPromises();

    const confirmButton = document.querySelector(
      '[data-testid="tenant-issue-cancel-confirm"]',
    ) as HTMLButtonElement | null;
    expect(confirmButton).not.toBeNull();
    confirmButton?.click();
    await flushPromises();

    expect(issueService.deleteIssue).toHaveBeenCalledTimes(1);
    const cancelButton = wrapper.get('[data-testid="tenant-issue-cancel"]');
    expect(cancelButton.attributes('disabled')).toBeDefined();

    await cancelButton.trigger('click');
    await flushPromises();
    expect(issueService.deleteIssue).toHaveBeenCalledTimes(1);

    resolveDelete?.();
    await flushPromises();

    wrapper.unmount();
    pushSpy.mockRestore();
  });

  it('filters Verursacher/Ort lines from description and hides empty cleaned description', async () => {
    vi.mocked(issueService.getIssue)
      .mockResolvedValueOnce({
        id: 'issue-12',
        title: 'Schaden',
        status: 'OPEN',
        type: 'DEFECT',
        agreementId: 'agreement-1',
        description: 'Verursacher: Unbekannt\nOrt: Küche\nWasser tropft aus dem Rohr',
      })
      .mockResolvedValueOnce({
        id: 'issue-13',
        title: 'Ohne Beschreibung',
        status: 'OPEN',
        type: 'DEFECT',
        agreementId: 'agreement-1',
      });

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-12' } });

    await flushPromises();

    expect(wrapper.text()).toContain('Wasser tropft aus dem Rohr');
    expect(wrapper.text()).not.toContain('Verursacher: Unbekannt');
    expect(wrapper.text()).not.toContain('Ort: Küche');

    await wrapper.setProps({ issueId: 'issue-13' });
    await flushPromises();

    expect(wrapper.text()).toContain('Ohne Beschreibung');
    expect(wrapper.text()).not.toContain('Wasser tropft aus dem Rohr');
  });

  it('renders modifiedAt as localized date or raw value when date is invalid', async () => {
    const validModifiedAt = '2026-01-02T00:00:00.000Z';
    const invalidModifiedAt = 'invalid-modified-at';

    vi.mocked(issueService.getIssue)
      .mockResolvedValueOnce({
        id: 'issue-20',
        title: 'Mit gültigem Datum',
        status: 'OPEN',
        type: 'DEFECT',
        agreementId: 'agreement-1',
        description: 'Beschreibung',
        modifiedAt: validModifiedAt,
      })
      .mockResolvedValueOnce({
        id: 'issue-21',
        title: 'Mit ungültigem Datum',
        status: 'OPEN',
        type: 'DEFECT',
        agreementId: 'agreement-1',
        description: 'Beschreibung',
        modifiedAt: invalidModifiedAt,
      });

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-20' } });

    await flushPromises();

    expect(wrapper.text()).not.toContain(validModifiedAt);

    await wrapper.setProps({ issueId: 'issue-21' });
    await flushPromises();

    expect(wrapper.text()).toContain(invalidModifiedAt);
  });

  it.each([
    ['TERMINATION', 'OPEN'],
    ['DEFECT', 'CLOSED'],
    ['DEFECT', 'REJECTED'],
  ] as const)('hides cancel action for type %s and status %s', async (type, status) => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-30',
      title: 'Nicht stornierbar',
      status,
      type,
      agreementId: 'agreement-1',
      description: 'Beschreibung',
    });

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-30' } });

    await flushPromises();

    expect(wrapper.find('[data-testid="tenant-issue-cancel"]').exists()).toBe(false);
  });

  it('uses route issueId for deletion when loaded issue has no id', async () => {
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined);

    vi.mocked(issueService.getIssue).mockResolvedValue({
      title: 'Ohne ID',
      status: 'OPEN',
      type: 'DEFECT',
      agreementId: 'agreement-1',
      description: 'Beschreibung',
    });
    vi.mocked(issueService.deleteIssue).mockResolvedValue(undefined);

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, {
      props: { issueId: 'issue-31' },
      attachTo: document.body,
    });

    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-cancel"]').trigger('click');
    await flushPromises();

    const confirmButton = document.querySelector(
      '[data-testid="tenant-issue-cancel-confirm"]',
    ) as HTMLButtonElement | null;
    expect(confirmButton).not.toBeNull();
    confirmButton?.click();
    await flushPromises();

    expect(issueService.deleteIssue).toHaveBeenCalledWith('issue-31');
    expect(pushSpy).toHaveBeenCalledWith({ name: 'TenantIssues' });

    wrapper.unmount();
    pushSpy.mockRestore();
  });

  it('renders indicator tiles for non-image attachments grouped by extension', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-1',
      title: 'Mit Anhängen',
      status: 'OPEN',
      type: 'DEFECT',
      agreementId: 'agreement-1',
      attachments: [
        {
          attachmentId: 'a1',
          fileName: 'report.pdf',
          contentType: 'application/pdf',
        },
        {
          attachmentId: 'a2',
          fileName: 'invoice.pdf',
          contentType: 'application/pdf',
        },
        {
          attachmentId: 'a3',
          fileName: 'video.mov',
          contentType: 'video/quicktime',
        },
      ],
    });

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-1' } });

    await flushPromises();

    const tiles = wrapper.findAll('[data-test="non-image-tile"]');
    expect(tiles).toHaveLength(2);

    const pdfTile = tiles.find(t => t.text().includes('PDF'));
    const movTile = tiles.find(t => t.text().includes('MOV'));

    expect(pdfTile?.text()).toContain('+2');
    expect(movTile?.text()).toContain('+1');
  });

  it('renders fallback values for image preview and download url', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-1',
      title: 'Fallback Attachment',
      status: 'OPEN',
      type: 'DEFECT',
      agreementId: 'agreement-1',
      attachments: [
        {
          attachmentId: undefined,
          fileName: undefined,
          contentType: 'image/png',
        },
      ],
    });

    const { TenantIssueDetails } = await import('@/features/tenant/tenantIssues');
    const wrapper = mount(TenantIssueDetails, { props: { issueId: 'issue-1' } });

    await flushPromises();

    const links = wrapper.findAll('a');
    expect(links[0].attributes('href')).toBe('/ticketing/v1/issues/issue-1/attachments//');
    expect(wrapper.find('img[alt="issue-attachment"]').exists()).toBe(true);
  });
});
