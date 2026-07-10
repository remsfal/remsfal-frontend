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
    mount(TenantIssueDetails, { props: { issueId: 'issue-42' } });

    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledWith('issue-42');
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      life: 3000,
    }));
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

    await cancelButton.trigger('click');
    await flushPromises();
    expect(issueService.deleteIssue).toHaveBeenCalledTimes(1);

    resolveDelete?.();
    await flushPromises();

    wrapper.unmount();
    pushSpy.mockRestore();
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

});
