import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerDashboardPage from '@/pages/manager/dashboard.vue';

vi.mock('@/features/project/dashboard', () => ({
  ProjectDashboardView: {
    name: 'ProjectDashboardView',
    template: '<div data-test="project-dashboard-stub" />',
  },
  ProjectsWelcomeMessage: {
    name: 'ProjectsWelcomeMessage',
    template: '<div data-test="welcome-message-stub" />',
  },
}));

vi.mock('@/features/project/issues', () => ({
  RecentIssuesCard: {
    name: 'RecentIssuesCard',
    template: '<div data-test="recent-issues-stub" />',
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

  it('renders the recent issues card', () => {
    const wrapper = mount(ManagerDashboardPage);
    expect(wrapper.find('[data-test="recent-issues-stub"]').exists()).toBe(true);
  });
});
