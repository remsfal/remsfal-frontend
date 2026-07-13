import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContractorDashboardPage from '@/pages/contractor/dashboard.vue';

vi.mock('@/views/contractor/ContractorDashboard.vue', () => ({
  default: {
    name: 'ContractorDashboard',
    template: '<div data-test="contractor-dashboard-stub" />',
  },
}));

describe('contractor/dashboard.vue', () => {
  it('renders without errors', () => {
    const wrapper = mount(ContractorDashboardPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ContractorDashboard', () => {
    const wrapper = mount(ContractorDashboardPage);
    expect(wrapper.find('[data-test="contractor-dashboard-stub"]').exists()).toBe(true);
  });
});
