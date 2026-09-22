import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerDashboardPage from '@/pages/manager/dashboard.vue';

vi.mock('@/features/project/dashboard', () => ({
  ProjectDashboardView: {
    name: 'ProjectDashboardView',
    template: '<div data-test="project-dashboard-stub" />',
  },
}));

vi.mock('@/features/manager/projects', () => ({
  ProjectsWelcomeMessage: {
    name: 'ProjectsWelcomeMessage',
    template: '<div data-test="welcome-message-stub" />',
  },
}));

describe('manager/dashboard.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerDashboardPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ProjectDashboard', () => {
    const wrapper = mount(ManagerDashboardPage);
    expect(wrapper.find('[data-test="project-dashboard-stub"]').exists()).toBe(true);
  });
});
