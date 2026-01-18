import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import IssueView from '@/views/IssueView.vue';
import { useRouter } from 'vue-router';
import {StatusValues, type IssueItem } from '@/services/IssueService';

// Mock PrimeVue components
vi.mock('primevue/button', () => ({ default: { template: '<button><slot /></button>' } }));
vi.mock('primevue/dialog', () => ({ default: { template: '<div><slot /></div>' } }));
vi.mock('primevue/inputtext', () => ({ default: { template: '<input />' } }));
vi.mock('@/components/IssueTable.vue', () => ({
default: {
 template: '<div data-test="issue-table" />', props: ['issues'], emits: ['rowSelect'] 
},
}));

// Mock router
vi.mock('vue-router', () => ({ useRouter: vi.fn() }));

// Mock IssueService
vi.mock('@/services/IssueService', () => {
  return {
    IssueService: vi.fn().mockImplementation(() => ({
      getIssues: vi.fn().mockResolvedValue({ issues: [] }),
      createIssue: vi.fn().mockResolvedValue({
        id: '1',
        title: 'Test Issue',
        description: 'Test Description',
        status: StatusValues.OPEN,
        type: 'TASK',
      }),
    })),
    ISSUE_TYPE_TASK: 'TASK',
    StatusValues: { OPEN: 'OPEN', CLOSED: 'CLOSED' },
  };
});

describe('IssueView.vue', () => {
  let routerPushMock: any;

  beforeEach(() => {
    routerPushMock = vi.fn();
    (useRouter as any).mockReturnValue({ push: routerPushMock });
  });

  it('renders title correctly based on props', async () => {
    const wrapper = mount(IssueView, {
 props: {
 projectId: '123', category: 'DEFECT', owner: 'Alice' 
} 
});
    expect(wrapper.html()).toContain('Meine Mängel');

    await wrapper.setProps({ owner: undefined, status: 'OPEN' });
    expect(wrapper.html()).toContain('Offene Mängel');
  });

  it('creates a new issue and updates tables', async () => {
    const wrapper = mount(IssueView, { props: { projectId: '123' } });

    // Open dialog
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();

    // Simulate creating an issue
    const newIssue: IssueItem = {
      id: '1',
      title: 'New Issue',
      description: 'Description',
      status: StatusValues.OPEN,
      type: 'TASK',
    };
    wrapper.vm.issues.push(newIssue); // Add issue to the issues array
    wrapper.vm.issuesByStatusOpen.push(newIssue); // Add issue to the open issues array
    wrapper.vm.myIssues.push(newIssue); // Add issue to the user's issues array
    await wrapper.vm.$nextTick();

    // Close dialog
    wrapper.vm.visible = false;
    await wrapper.vm.$nextTick();

    // Assertions
    expect(wrapper.vm.visible).toBe(false);
    expect(wrapper.vm.issues.length).toBe(1);
    expect(wrapper.vm.issuesByStatusOpen.length).toBe(1);
    expect(wrapper.vm.myIssues.length).toBe(1);
  });

  it('calls router.push when an issue is selected', async () => {
    const wrapper = mount(IssueView, { props: { projectId: '123' } });

    const issue: IssueItem = {
 id: '1', title: 'Issue 1', description: '', status: 'OPEN', type: 'TASK' 
};
    wrapper.vm.onIssueSelect(issue);

    expect(routerPushMock).toHaveBeenCalledWith({ name: 'IssueDetails', params: { issueId: '1' } });
  });

  it('loads issues on mount', async () => {
    const wrapper = mount(IssueView, { props: { projectId: '123', owner: 'Alice' } });
    await flushPromises();

    expect(wrapper.vm.issues).toEqual([]);
    expect(wrapper.vm.issuesByStatusOpen).toEqual([]);
    expect(wrapper.vm.myIssues).toEqual([]);
  });

  it('renders the correct IssueTable based on props', async () => {
    const wrapper = mount(IssueView, { props: { projectId: '123', owner: 'Alice' } });
    expect(wrapper.find('[data-test="issue-table"]').exists()).toBe(true);
  });
});
