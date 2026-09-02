import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ContractorDashboardPage from '@/pages/contractor/dashboard.vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import type { OrganizationEmployeeJson } from '@/services/OrganizationService';

vi.mock('@/features/contractor/organizations', () => ({
  OrganizationDashboardCards: {
    name: 'OrganizationDashboardCards',
    template: '<div data-test="organization-dashboard-cards-stub" />',
  },
}));

vi.mock('@/features/contractor/orderManagement', () => ({
  OrderManagementDashboardCards: {
    name: 'OrderManagementDashboardCards',
    template: '<div data-test="order-management-dashboard-cards-stub" />',
  },
}));

const employment: OrganizationEmployeeJson = {
  id: 'emp-1',
  organizationId: 'org-1',
  organizationName: 'Musterfirma GmbH',
  name: 'Max Mustermann',
  email: 'max@musterfirma.de',
  active: true,
  employeeRole: 'OWNER',
};

describe('contractor/dashboard.vue', () => {
  beforeEach(() => {
    useOrganizationStore().$reset();
  });

  it('renders without errors', () => {
    const wrapper = mount(ContractorDashboardPage);
    expect(wrapper.exists()).toBe(true);
  });

  it('hides OrderManagementDashboardCards when the user has no organization employments', () => {
    useOrganizationStore().userEmployments = [];

    const wrapper = mount(ContractorDashboardPage);

    expect(wrapper.find('[data-test="order-management-dashboard-cards-stub"]').exists()).toBe(false);
  });

  it('shows OrderManagementDashboardCards when the user has an organization employment', () => {
    useOrganizationStore().userEmployments = [employment];

    const wrapper = mount(ContractorDashboardPage);

    expect(wrapper.find('[data-test="order-management-dashboard-cards-stub"]').exists()).toBe(true);
  });
});
