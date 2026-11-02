import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ContractorClientListPage from '@/pages/contractor/clients/index.vue';

vi.mock('@/features/contractor/customers',
  () => ({ ContractorClientListView: { template: '<div data-test="contractor-client-list-view" />' } }));

describe('Contractor Clients Index Page', () => {
  it('renders without errors', () => {
    const wrapper = mount(ContractorClientListPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders ContractorClientListView', () => {
    const wrapper = mount(ContractorClientListPage);
    expect(wrapper.find('[data-test="contractor-client-list-view"]').exists()).toBe(true);
  });
});
