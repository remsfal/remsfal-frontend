import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectContractorListPage from '@/pages/projects/[projectId]/contractors/index.vue';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>();
  return {
    ...actual,
    useRoute: () => ({ params: { projectId: 'project-123' } }),
  };
});

vi.mock('@/views/project/ProjectContractorListView.vue', () => ({
  default: {
    name: 'ProjectContractorListView',
    props: ['projectId'],
    template: '<div data-test="project-contractor-list-view-stub" />',
  },
}));

describe('projects/[projectId]/contractors/index.vue', () => {
  it('renders ProjectContractorListView', () => {
    const wrapper = mount(ProjectContractorListPage);
    expect(wrapper.find('[data-test="project-contractor-list-view-stub"]').exists()).toBe(true);
  });

  it('passes projectId from route params to ProjectContractorListView', () => {
    const wrapper = mount(ProjectContractorListPage);
    const view = wrapper.findComponent({ name: 'ProjectContractorListView' });
    expect(view.props('projectId')).toBe('project-123');
  });
});
