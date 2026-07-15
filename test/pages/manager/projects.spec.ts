import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerProjectsPage from '@/pages/manager/projects.vue';

vi.mock('@/features/manager/projects', () => ({
  ManagerView: {
    name: 'ManagerView',
    template: '<div data-test="manager-view-stub" />',
  },
}));

describe('manager/projects.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerProjectsPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ManagerView', () => {
    const wrapper = mount(ManagerProjectsPage);
    expect(wrapper.find('[data-test="manager-view-stub"]').exists()).toBe(true);
  });
});
