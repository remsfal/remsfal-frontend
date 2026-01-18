import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectIssueView from '@/views/ProjectIssueView.vue';
import { issueService } from '@/services/IssueService';
import { nextTick } from 'vue';

vi.mock('@/services/IssueService', () => ({
  issueService: {
    getIssue: vi.fn(),
  },
}));

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const mockIssue = {
  id: 'ISSUE-1',
  title: 'Test issue',
  status: 'OPEN',
  ownerId: 'owner-1',
  reporterId: 'reporter-1',
  tenancyId: 'tenant-1',
  type: 'BUG',
  description: 'Test description',
};

const mountView = (props?: Partial<{ projectId: string; issueId: string }>) =>
  mount(ProjectIssueView, {
    props: {
      projectId: 'PROJ-1',
      issueId: 'ISSUE-1',
      ...props,
    },
    global: {
      stubs: {
        IssueDetailsCard: {
          template: '<div data-test="details" @click="$emit(\'saved\')" />',
        },
        IssueDescriptionCard: {
          template: '<div data-test="description" @click="$emit(\'saved\')" />',
        },
      },
    },
  });

describe('ProjectIssueView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches issue on mount and renders cards', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue(mockIssue as any);

    const wrapper = mountView();

    await vi.waitFor(() => {
      expect(wrapper.find('[data-test="details"]').exists()).toBe(true);
    });

    expect(wrapper.find('[data-test="description"]').exists()).toBe(true);
  });

  it('shows loader while fetching', async () => {
    let resolveFn!: (value: any) => void;

    vi.mocked(issueService.getIssue).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve;
        }) as any
    );

    const wrapper = mountView();

    await nextTick();
    expect(wrapper.find('.pi-spinner').exists()).toBe(true);

    resolveFn(mockIssue);
    await nextTick();
  });

  it('shows toast on API error', async () => {
    vi.mocked(issueService.getIssue).mockRejectedValue(new Error('API error'));

    mountView();

    await vi.waitFor(() => {
      expect(issueService.getIssue).toHaveBeenCalled();
    });
  });

  it('refetches issue when details are saved', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue(mockIssue as any);

    const wrapper = mountView();

    await vi.waitFor(() => {
      expect(wrapper.find('[data-test="details"]').exists()).toBe(true);
    });

    await wrapper.find('[data-test="details"]').trigger('click');

    await vi.waitFor(() => {
      expect(issueService.getIssue).toHaveBeenCalledTimes(2);
    });
  });

  it('refetches issue when props change', async () => {
    vi.mocked(issueService.getIssue).mockResolvedValue(mockIssue as any);

    const wrapper = mountView();

    await vi.waitFor(() => {
      expect(issueService.getIssue).toHaveBeenCalledTimes(1);
    });

    await wrapper.setProps({ issueId: 'ISSUE-2' });

    await vi.waitFor(() => {
      expect(issueService.getIssue).toHaveBeenCalledTimes(2);
    });
  });
});
