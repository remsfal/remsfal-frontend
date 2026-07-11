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
      <span data-testid="summary-title">{{ issue?.title }}</span>
      <button data-testid="summary-cancel" @click="$emit('cancel')">cancel</button>
    </div>
  `,
});

const TenantIssueAttachmentsCardStub = defineComponent({
  name: 'TenantIssueAttachmentsCard',
  props: {
    issueId: { type: String, required: true },
    attachments: { type: Array, required: true },
  },
  template: `
    <div data-testid="attachments-card">
      {{ issueId }}|{{ attachments.length }}
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
          TenantIssueAttachmentsCard: TenantIssueAttachmentsCardStub,
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

  it('loads issue and passes data to summary and attachments cards', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-1',
      title: 'Heizung defekt',
      attachments: [{ attachmentId: 'a1', fileName: 'report.pdf' }],
    });

    const wrapper = await mountComponent('issue-1');
    await flushPromises();

    expect(issueService.getIssue).toHaveBeenCalledWith('issue-1');
    expect(wrapper.get('[data-testid="summary-title"]').text()).toBe('Heizung defekt');
    expect(wrapper.get('[data-testid="attachments-card"]').text()).toContain('issue-1|1');
  });

  it('falls back to route issueId and empty attachments when issue fields are missing', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({ title: 'Ohne Anhang und ID' });

    const wrapper = await mountComponent('route-issue-id');
    await flushPromises();

    expect(wrapper.get('[data-testid="summary-title"]').text()).toBe('Ohne Anhang und ID');
    expect(wrapper.get('[data-testid="attachments-card"]').text()).toContain('route-issue-id|0');
  });

  it('uses route issueId when issue id is missing, but keeps existing attachments', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      title: 'Ohne ID',
      attachments: [{ attachmentId: 'a1', fileName: 'image.png' }],
    });

    const wrapper = await mountComponent('route-fallback-id');
    await flushPromises();

    expect(wrapper.get('[data-testid="attachments-card"]').text()).toContain('route-fallback-id|1');
  });

  it('uses issue id and falls back to empty attachments when attachments are null', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-from-response',
      title: 'Mit ID ohne Attachments',
      attachments: null,
    });

    const wrapper = await mountComponent('route-id');
    await flushPromises();

    expect(wrapper.get('[data-testid="attachments-card"]').text()).toContain('issue-from-response|0');
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
    expect(wrapper.get('[data-testid="summary-title"]').text()).toBe('Zweiter Vorgang');
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
      attachments: [],
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

  it('shows error toast when deleting issue fails', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue({
      id: 'issue-12',
      title: 'Defekt',
      attachments: [],
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
