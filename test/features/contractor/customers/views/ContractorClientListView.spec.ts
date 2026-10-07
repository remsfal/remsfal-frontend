import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ContractorClientListView from '@/features/contractor/customers/views/ContractorClientListView.vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';

vi.mock('@/features/contractor/customers', () => ({
  ContractorClientListCard: {
    props: ['organizationId'],
    template: '<div data-test="contractor-client-list-card">{{ organizationId }}</div>',
  },
}));

describe('ContractorClientListView', () => {
  let organizationStore: ReturnType<typeof useOrganizationStore>;

  beforeEach(() => {
    organizationStore = useOrganizationStore();
    organizationStore.initialized = true;
    organizationStore.userEmployments = [];
  });

  it('renders one card per organization the user is employed in', () => {
    organizationStore.userEmployments = [
      {
        organizationId: 'org-1', organizationName: 'Sanitär GmbH', employeeRole: 'OWNER' 
      },
      {
        organizationId: 'org-2', organizationName: 'Elektro AG', employeeRole: 'STAFF' 
      },
    ];
    const wrapper = mount(ContractorClientListView);
    const cards = wrapper.findAll('[data-test="contractor-client-list-card"]');
    expect(cards).toHaveLength(2);
    expect(cards[0].text()).toBe('org-1');
    expect(cards[1].text()).toBe('org-2');
  });

  it('shows a hint when the user is not employed in any organization', () => {
    const wrapper = mount(ContractorClientListView);
    expect(wrapper.find('[data-test="contractor-client-list-card"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('Du bist in keiner Organisation tätig.');
  });

  it('fetches the organizations on mount when the store is not initialized', () => {
    organizationStore.initialized = false;
    const fetchSpy = vi.spyOn(organizationStore, 'fetchUserOrganization').mockResolvedValue();
    fetchSpy.mockClear();
    mount(ContractorClientListView);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });
});
