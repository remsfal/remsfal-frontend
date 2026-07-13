import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import IssueDetailsPage from '@/pages/projects/[projectId]/issues/[issueId].vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({ params: { projectId: 'project-123', issueId: 'issue-456' } }),
  };
});

vi.mock('@/features/project/issues', () => ({
  ProjectIssueView: {
    name: 'ProjectIssueView',
    props: ['projectId', 'issueId'],
    template: '<div data-test="project-issue-view-stub" />',
  },
}));

describe('projects/[projectId]/issues/[issueId].vue', () => {
  it('renders ProjectIssueView', () => {
    const wrapper = mount(IssueDetailsPage);
    expect(wrapper.find('[data-test="project-issue-view-stub"]').exists()).toBe(true);
  });

  it('passes projectId and issueId from route params to ProjectIssueView', () => {
    const wrapper = mount(IssueDetailsPage);
    const view = wrapper.findComponent({ name: 'ProjectIssueView' });
    expect(view.props('projectId')).toBe('project-123');
    expect(view.props('issueId')).toBe('issue-456');
  });
});
