import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerContractorListPage from '@/pages/manager/contractors/index.vue';

vi.mock('@/views/ManagerContractorListView.vue', () => ({
  default: { template: '<div data-test="manager-contractor-list-view" />' },
}));

describe('Manager Contractors Index Page', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerContractorListPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ManagerContractorListView', () => {
    const wrapper = mount(ManagerContractorListPage);
    expect(wrapper.find('[data-test="manager-contractor-list-view"]').exists()).toBe(true);
  });
});
