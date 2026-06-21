import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerContractorListView from '@/views/ManagerContractorListView.vue';

vi.mock('@/features/manager/contractors',
  () => ({ManagerContractorListCard: { template: '<div data-test="manager-contractor-list-card" />' }}));

describe('ManagerContractorListView', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerContractorListView);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ManagerContractorListCard', () => {
    const wrapper = mount(ManagerContractorListView);
    expect(wrapper.find('[data-test="manager-contractor-list-card"]').exists()).toBe(true);
  });
});
