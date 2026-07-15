import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import IssueOverviewPage from '@/pages/projects/[projectId]/issues/index.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({
      params: { projectId: 'proj-1' },
      query: {
        assigneeId: 'user-1', status: 'OPEN', type: 'MAINTENANCE'
      },
    }),
  };
});

vi.mock('@/features/project/issues', () => ({
  IssueListView: {
    name: 'IssueListView',
    props: ['projectId', 'assigneeId', 'status', 'type'],
    template: '<div data-test="issue-list-view-stub" />',
  },
}));

describe('projects/[projectId]/issues/index.vue', () => {
  it('renders IssueListView', () => {
    const wrapper = mount(IssueOverviewPage);
    expect(wrapper.find('[data-test="issue-list-view-stub"]').exists()).toBe(true);
  });

  it('passes projectId from route params to IssueListView', () => {
    const wrapper = mount(IssueOverviewPage);
    const view = wrapper.findComponent({ name: 'IssueListView' });
    expect(view.props('projectId')).toBe('proj-1');
  });

  it('passes query params to IssueListView', () => {
    const wrapper = mount(IssueOverviewPage);
    const view = wrapper.findComponent({ name: 'IssueListView' });
    expect(view.props('assigneeId')).toBe('user-1');
    expect(view.props('status')).toBe('OPEN');
    expect(view.props('type')).toBe('MAINTENANCE');
  });
});
