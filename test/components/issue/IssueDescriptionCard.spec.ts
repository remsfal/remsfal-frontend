import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
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
  IssueDescription: true, // stub child component
};

// ---- Test suite ----
describe('IssueDescriptionCard.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    (issueService.modifyIssue as Mock).mockResolvedValue({});
    wrapper = mount(IssueDescriptionCard, {
      props: {
        projectId: 'proj-1',
        issueId: 'issue-1',
        initialDescription: 'Initial description',
      },
      global: { stubs },
    });
  });

  it('renders component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('calls modifyIssue when saving', async () => {
    wrapper.vm.description = 'Updated description';
    await wrapper.vm.handleSave();
    expect(issueService.modifyIssue).toHaveBeenCalledWith(
      'proj-1',
      'issue-1',
      { description: 'Updated description' } as Partial<Issue>
    );
  });

  it('emits saved event after save', async () => {
    wrapper.vm.description = 'Updated description';
    await wrapper.vm.handleSave();
    expect(wrapper.emitted('saved')).toBeTruthy();
  });
});
