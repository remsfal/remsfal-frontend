import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ProjectContractorDetailPage from '@/pages/projects/[projectId]/contractors/[contractorId].vue';
import router from '@/router';

vi.mock('@/views/project/ProjectContractorDetailView.vue', () => ({
  default: {
    name: 'ProjectContractorDetailView',
    template: '<div data-test="project-contractor-detail-view" />',
    props: ['projectId', 'contractorId'],
  },
}));

describe('Project Contractor Detail Page', () => {
  beforeEach(async () => {
    await router.push({
      name: 'ProjectContractorDetail',
      params: { projectId: 'proj-1', contractorId: 'c-1' },
    });
    await flushPromises();
  });

  it('renders without errors', () => {
    const wrapper = mount(ProjectContractorDetailPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ProjectContractorDetailView', () => {
    const wrapper = mount(ProjectContractorDetailPage);
    expect(wrapper.find('[data-test="project-contractor-detail-view"]').exists()).toBe(true);
  });

  it('renders the view component after route navigation', async () => {
    const wrapper = mount(ProjectContractorDetailPage);
    await flushPromises();
    expect(wrapper.find('[data-test="project-contractor-detail-view"]').exists()).toBe(true);
  });
});
