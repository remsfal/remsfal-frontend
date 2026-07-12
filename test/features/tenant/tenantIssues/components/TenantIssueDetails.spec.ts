import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { issueService } from '@/services/IssueService';
import TenantIssueDetails from '@/features/tenant/tenantIssues/components/TenantIssueDetails.vue';

const pushMock = vi.fn();
const toastAddMock = vi.fn();

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  };
});

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: toastAddMock }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock('@/services/IssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/IssueService')>(
    '@/services/IssueService',
  );

  return {
    ...actual,
    issueService: {
      getIssue: vi.fn(),
      deleteIssue: vi.fn(),
    },
  };
});

const TenantIssueSummaryCardStub = defineComponent({
  name: 'TenantIssueSummaryCard',
  props: {
    issue: { type: Object, required: true },
    deletingIssue: { type: Boolean, required: true },
  },
  emits: ['cancel'],
  template: `
    <div data-testid="summary-card">
      <button data-testid="summary-cancel" @click="$emit('cancel')">cancel</button>
    </div>
  `,
});

describe('TenantIssueDetails.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mountComponent = (issueId = 'issue-1') => mount(
    TenantIssueDetails,
    {
      props: { issueId },
      global: {
        stubs: {
          TenantIssueSummaryCard: TenantIssueSummaryCardStub,
          BaseDialog: {
            props: ['visible'],
            template: '<div v-if="visible"><slot /><slot name="footer" /></div>',
          },
          Message: { template: '<div><slot /></div>' },
          ProgressSpinner: { template: '<div data-testid="spinner" />' },
          Button: {
            props: ['label'],
            emits: ['click'],
            template: '<button v-bind="$attrs" @click="$emit(\'click\')">{{ label }}</button>',
          },
        },
      },
    },
  );

  it('loads issue and passes data to summary card', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-1',
      title: 'Heizung defekt',
    });

    const wrapper = await mountComponent('issue-1');
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledWith('issue-1');
    const summary = wrapper.getComponent(TenantIssueSummaryCardStub);
    expect(summary.props('issue')).toMatchObject({
      id: 'issue-1',
      title: 'Heizung defekt',
    });
    expect(summary.props('deletingIssue')).toBe(false);
  });

  it('reloads issue data when issueId prop changes', async () => {
    vi.mocked(issueService.getIssue)
      .mockResolvedValueOnce({
        id: 'issue-1',
        title: 'Erster Vorgang',
        attachments: [],
      })
      .mockResolvedValueOnce({
        id: 'issue-2',
        title: 'Zweiter Vorgang',
        attachments: [],
      });

    const wrapper = await mountComponent('issue-1');
    await flushPromises();

    await wrapper.setProps({ issueId: 'issue-2' });
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenNthCalledWith(1, 'issue-1');
    expect(issueService.getIssue).toHaveBeenNthCalledWith(2, 'issue-2');
    const summary = wrapper.getComponent(TenantIssueSummaryCardStub);
    expect(summary.props('issue')).toMatchObject({
      id: 'issue-2',
      title: 'Zweiter Vorgang',
    });
  });

  it('shows translated load error when issue fetching fails', async () => {
    vi.mocked(issueService.getIssue).mockRejectedValue(new Error('load failed'));

    const wrapper = await mountComponent('issue-1');
    await flushPromises();

    expect(wrapper.text()).toContain('tenantIssues.detail.loadError');
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      detail: 'tenantIssues.detail.loadError',
    }));
  });

  it('deletes issue after confirmation and navigates back to list', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-11',
      title: 'Defekt',
    });
    vi.mocked(issueService.deleteIssue).mockResolvedValue(undefined);

    const wrapper = await mountComponent('issue-11');
    await flushPromises();

    await wrapper.get('[data-testid="summary-cancel"]').trigger('click');
    await flushPromises();
    expect(issueService.deleteIssue).not.toHaveBeenCalled();

    const confirm = wrapper.get('[data-testid="tenant-issue-cancel-confirm"]');
    await confirm.trigger('click');
    await flushPromises();

    expect(issueService.deleteIssue).toHaveBeenCalledWith('issue-11');
    expect(pushMock).toHaveBeenCalledWith({ name: 'TenantIssues' });
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success',
      detail: 'tenantIssues.detail.cancelSuccess',
    }));
  });

  it('uses route issueId for deletion when loaded issue id is missing', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({ title: 'Defekt ohne ID' });
    vi.mocked(issueService.deleteIssue).mockResolvedValue(undefined);

    const wrapper = await mountComponent('route-id');
    await flushPromises();

    await wrapper.get('[data-testid="summary-cancel"]').trigger('click');
    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-cancel-confirm"]').trigger('click');
    await flushPromises();

    expect(issueService.deleteIssue).toHaveBeenCalledWith('route-id');
  });

  it('shows error toast when deleting issue fails', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-12',
      title: 'Defekt',
    });
    vi.mocked(issueService.deleteIssue).mockRejectedValue(new Error('delete failed'));

    const wrapper = await mountComponent('issue-12');
    await flushPromises();

    await wrapper.get('[data-testid="summary-cancel"]').trigger('click');
    await flushPromises();
    await wrapper.get('[data-testid="tenant-issue-cancel-confirm"]').trigger('click');
    await flushPromises();

    expect(issueService.deleteIssue).toHaveBeenCalledWith('issue-12');
    expect(pushMock).not.toHaveBeenCalled();
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      detail: 'tenantIssues.detail.cancelError',
    }));
  });
});
