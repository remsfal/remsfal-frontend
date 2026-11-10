import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TenantOrganizationsPage from '@/pages/tenant/organizations.vue';
import { useOrganizationStore } from '@/features/common/organizations/stores/OrganizationStore';

vi.mock('@/features/contractor/organizations', () => ({
  OrganizationDashboardCards: {
    name: 'OrganizationDashboardCards',
    template: '<div data-test="organization-dashboard-cards-stub" />',
  },
}));

vi.mock('@/features/common/organizations', async () => ({
  ...(await vi.importActual<typeof import('@/features/common/organizations/stores/OrganizationStore')>(
    '@/features/common/organizations/stores/OrganizationStore',
  )),
  UserOrganizationEmploymentsCard: {
    name: 'UserOrganizationEmploymentsCard',
    template: '<div data-test="employments-card-stub" />',
  },
}));

describe('tenant/organizations.vue', () => {
  beforeEach(() => {
    useOrganizationStore().$reset();
  });

  it('renders the organization dashboard cards', () => {
    const wrapper = mount(TenantOrganizationsPage);
    expect(wrapper.find('[data-test="organization-dashboard-cards-stub"]').exists()).toBe(true);
  });

  it('hides the employments card while the organizations are loading', () => {
    const wrapper = mount(TenantOrganizationsPage);
    expect(wrapper.find('[data-test="employments-card-stub"]').exists()).toBe(false);
  });

  it('hides the employments card for users without an organization', () => {
    useOrganizationStore().initialized = true;
    const wrapper = mount(TenantOrganizationsPage);
    expect(wrapper.find('[data-test="employments-card-stub"]').exists()).toBe(false);
  });

  it('shows the employments card below the dashboard cards for organization members', () => {
    const store = useOrganizationStore();
    store.initialized = true;
    store.userEmployments = [{ organizationId: 'org-1', employeeRole: 'STAFF' }];
    const wrapper = mount(TenantOrganizationsPage);
    const html = wrapper.html();
    expect(wrapper.find('[data-test="employments-card-stub"]').exists()).toBe(true);
    expect(html.indexOf('organization-dashboard-cards-stub')).toBeLessThan(html.indexOf('employments-card-stub'));
  });
});
