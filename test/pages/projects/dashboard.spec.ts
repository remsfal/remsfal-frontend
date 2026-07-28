import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ProjectDashboardPage from '@/pages/projects/[projectId]/dashboard.vue';

vi.mock('@/views/project/ProjectDashboard.vue', () => ({
  default: {
    name: 'ProjectDashboard',
    template: '<div data-test="project-dashboard-stub" />',
  },
}));

describe('projects/[projectId]/dashboard.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ProjectDashboardPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ProjectDashboard', () => {
    const wrapper = mount(ProjectDashboardPage);
    expect(wrapper.find('[data-test="project-dashboard-stub"]').exists()).toBe(true);
  });
});
