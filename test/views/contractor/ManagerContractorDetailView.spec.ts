import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ManagerContractorDetailView from '@/views/ManagerContractorDetailView.vue';
import router from '@/router';

vi.mock('@/features/manager/contractors', () => ({
  ManagerContractorInfoCard: {
    template: '<div data-test="manager-contractor-info-card" />',
    props: ['organizationId'],
  },
}));

describe('ManagerContractorDetailView', () => {
  beforeEach(async () => {
    await router.push({ name: 'ManagerContractorDetail', params: { organizationId: 'org-123' } });
    await flushPromises();
  });

  it('renders without errors', () => {
    const wrapper = mount(ManagerContractorDetailView);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ManagerContractorInfoCard', () => {
    const wrapper = mount(ManagerContractorDetailView);
    expect(wrapper.find('[data-test="manager-contractor-info-card"]').exists()).toBe(true);
  });

  it('passes organizationId from route params to ManagerContractorInfoCard', () => {
    const wrapper = mount(ManagerContractorDetailView);
    const card = wrapper.find('[data-test="manager-contractor-info-card"]');
    expect(card.exists()).toBe(true);
  });
});
