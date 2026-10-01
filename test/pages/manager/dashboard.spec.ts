import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerDashboardPage from '@/pages/manager/dashboard.vue';

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

  it('renders ProjectsWelcomeMessage', () => {
    const wrapper = mount(ManagerDashboardPage);
    expect(wrapper.find('[data-test="welcome-message-stub"]').exists()).toBe(true);
  });
});
