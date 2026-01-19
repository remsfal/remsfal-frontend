import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import IssueDescriptionCard from '@/components/issue/IssueDescriptionCard.vue';
import { issueService, type Issue } from '@/services/IssueService';

// ---- Mock issueService ----
vi.mock('@/services/IssueService', () => ({
  issueService: { modifyIssue: vi.fn() },
}));

// ---- Stub PrimeVue components ----
const stubs = {
  Card: true,
  Button: true,
  IssueDescription: true,
};

// ---- Test Suite ----
describe('IssueDescriptionCard.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    (issueService.modifyIssue as vi.Mock).mockResolvedValue({});

    wrapper = mount(IssueDescriptionCard, {
      props: {
        projectId: 'proj-1',
        issueId: 'issue-1',
        initialDescription: 'Initial description',
      },
      global: { stubs },
    });
  });

  test('renders component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  test('calls modifyIssue when saving', async () => {
    wrapper.vm.description = 'Updated description';
    await wrapper.vm.handleSave();

    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'proj-1',
      'issue-1',
      { description: 'Updated description' } as Partial<Issue>
    );
  });

  test('emits saved event after save', async () => {
    wrapper.vm.description = 'Updated description';
    await wrapper.vm.handleSave();

    expect(wrapper.emitted()).toHaveProperty('saved');
  });
});
