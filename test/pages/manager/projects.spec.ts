import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerProjectsPage from '@/pages/manager/projects.vue';

vi.mock('@/features/common/projects', () => ({
  ProjectsWelcomeMessage: {
    name: 'ProjectsWelcomeMessage',
    template: '<div data-test="welcome-message-stub" />',
  },
  ProjectSelectionView: {
    name: 'ProjectSelectionView',
    template: '<div data-test="project-selection-view-stub" />',
  },
}));

describe('manager/projects.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerProjectsPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ProjectsWelcomeMessage above ProjectSelectionView', () => {
    const wrapper = mount(ManagerProjectsPage);
    const html = wrapper.html();
    expect(wrapper.find('[data-test="welcome-message-stub"]').exists()).toBe(true);
    expect(html.indexOf('welcome-message-stub')).toBeLessThan(html.indexOf('project-selection-view-stub'));
  });

  it('renders ProjectSelectionView', () => {
    const wrapper = mount(ManagerProjectsPage);
    expect(wrapper.find('[data-test="project-selection-view-stub"]').exists()).toBe(true);
  });
});
