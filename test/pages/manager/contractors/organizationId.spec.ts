import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerContractorDetailPage from '@/pages/manager/contractors/[organizationId].vue';

vi.mock('@/views/ManagerContractorDetailView.vue', () => ({
  default: { template: '<div data-test="manager-contractor-detail-view" />' },
}));

describe('Manager Contractor Detail Page', () => {
  it('renders without errors', () => {
    const wrapper = mount(ManagerContractorDetailPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ManagerContractorDetailView', () => {
    const wrapper = mount(ManagerContractorDetailPage);
    expect(wrapper.find('[data-test="manager-contractor-detail-view"]').exists()).toBe(true);
  });
});
