import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import type { TenantIssueJson } from '@/services/TenantIssueService';
import { tenantIssueService } from '@/services/TenantIssueService';
import TenantIssueDetailView from '@/features/tenant/tenantIssues/views/TenantIssueDetailView.vue';

const pushMock = vi.fn();
const addMock = vi.fn();

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  };
});

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

vi.mock('@/services/TenantIssueService', async () => {
  const actual = await vi.importActual<typeof import('@/services/TenantIssueService')>(
    '@/services/TenantIssueService',
  );

  return {
    ...actual,
    tenantIssueService: {
      getIssue: vi.fn(),
      closeIssue: vi.fn(),
    },
  };
});

const TenantIssueSummaryCardStub = defineComponent({
  name: 'TenantIssueSummaryCard',
  props: {
    issue: {
      type: Object,
      required: true,
    },
    deletingIssue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['cancel'],
  template: '<button data-testid="summary-stub" @click="$emit(\'cancel\')">{{ issue.title }}</button>',
});

const BaseDialogStub = defineComponent({
  name: 'BaseDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    header: {
      type: String,
      default: '',
    },
  },
  emits: ['update:visible'],
  template: `
    <div v-if="visible" data-testid="cancel-dialog">
      <slot />
      <slot name="footer" />
    </div>
  `,
});

describe('TenantIssueDetailView', () => {
  const baseIssue: TenantIssueJson = {
    id: 'issue-1',
    title: 'Heizung defekt',
    status: 'OPEN',
    type: 'DEFECT',
    agreementId: 'agreement-1',
    description: 'Wasser tropft von der Decke',
  };

  const mountDetails = (issueId = 'issue-1') => {
    return mount(TenantIssueDetailView, {
      props: { issueId },
      global: {
        stubs: {
          TenantIssueSummaryCard: TenantIssueSummaryCardStub,
          BaseDialog: BaseDialogStub,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tenantIssueService.getIssue).mockResolvedValue(baseIssue);
    vi.mocked(tenantIssueService.closeIssue).mockResolvedValue();
  });

  it('fetches issue on mount and passes it to summary card', async () => {
    const wrapper = mountDetails();

    await flushPromises();

    expect(tenantIssueService.getIssue).toHaveBeenCalledWith('issue-1');
    const summaryStub = wrapper.getComponent({ name: 'TenantIssueSummaryCard' });
    expect(summaryStub.props('issue')).toEqual(baseIssue);
    expect(summaryStub.props('deletingIssue')).toBe(false);
  });

  it('refetches issue when issueId changes', async () => {
    vi.mocked(tenantIssueService.getIssue)
      .mockResolvedValueOnce(baseIssue)
      .mockResolvedValueOnce({
        ...baseIssue,
        id: 'issue-2',
        title: 'Fenster defekt',
      });

    const wrapper = mountDetails('issue-1');
    await flushPromises();

    await wrapper.setProps({ issueId: 'issue-2' });
    await flushPromises();

    expect(tenantIssueService.getIssue).toHaveBeenNthCalledWith(1, 'issue-1');
    expect(tenantIssueService.getIssue).toHaveBeenNthCalledWith(2, 'issue-2');
  });

  it('shows translated load error message and error toast when fetch fails', async () => {
    vi.mocked(tenantIssueService.getIssue).mockRejectedValueOnce(new Error('fetch failed'));

    const wrapper = mountDetails();
    await flushPromises();

    expect(wrapper.text()).toContain('Meldungsdetails konnten nicht geladen werden.');
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      summary: 'Fehler',
      detail: 'Meldungsdetails konnten nicht geladen werden.',
    }));
  });

  it('closes issue after confirmation and navigates back to list', async () => {
    const wrapper = mountDetails();
    await flushPromises();

    await wrapper.get('[data-testid="summary-stub"]').trigger('click');
    expect(wrapper.find('[data-testid="cancel-dialog"]').exists()).toBe(true);

    await wrapper.get('[data-testid="tenant-issue-cancel-confirm"]').trigger('click');
    await flushPromises();

    expect(tenantIssueService.closeIssue).toHaveBeenCalledWith('issue-1');
    expect(pushMock).toHaveBeenCalledWith({ name: 'TenantIssues' });
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success',
      detail: 'Vorgang wurde erfolgreich abgebrochen.',
    }));
  });

  it('shows error toast and does not navigate when cancel fails', async () => {
    vi.mocked(tenantIssueService.closeIssue).mockRejectedValueOnce(new Error('close failed'));

    const wrapper = mountDetails();
    await flushPromises();

    await wrapper.get('[data-testid="summary-stub"]').trigger('click');
    await wrapper.get('[data-testid="tenant-issue-cancel-confirm"]').trigger('click');
    await flushPromises();

    expect(tenantIssueService.closeIssue).toHaveBeenCalledWith('issue-1');
    expect(pushMock).not.toHaveBeenCalled();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      detail: 'Vorgang konnte nicht abgebrochen werden.',
    }));
  });
});
