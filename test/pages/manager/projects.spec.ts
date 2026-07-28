import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerProjectsPage from '@/pages/manager/projects.vue';

vi.mock('@/features/manager/projects', () => ({
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

  it('renders ProjectSelectionView', () => {
    const wrapper = mount(ManagerProjectsPage);
    expect(wrapper.find('[data-test="project-selection-view-stub"]').exists()).toBe(true);
  });
});
