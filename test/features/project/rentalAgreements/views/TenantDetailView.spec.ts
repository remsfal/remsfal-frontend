import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantDetailView from '@/features/project/rentalAgreements/views/TenantDetailView.vue';

describe('TenantDetailView', () => {
  const mountView = () =>
    mount(TenantDetailView, {
      props: { projectId: 'project-1', tenantId: 'tenant-1' },
      global: {
        stubs: {
          TenantContactDataCard: true,
          TenantAddressCard: true,
        },
      },
    });

  test('renders without errors', () => {
    const wrapper = mountView();
    expect(wrapper.exists()).toBe(true);
  });

  test('renders TenantContactDataCard with the projectId/tenantId props', () => {
    const wrapper = mountView();
    const card = wrapper.findComponent({ name: 'TenantContactDataCard' });
    expect(card.exists()).toBe(true);
    expect(card.props()).toMatchObject({ projectId: 'project-1', tenantId: 'tenant-1' });
  });

  test('renders TenantAddressCard with the projectId/tenantId props', () => {
    const wrapper = mountView();
    const card = wrapper.findComponent({ name: 'TenantAddressCard' });
    expect(card.exists()).toBe(true);
    expect(card.props()).toMatchObject({ projectId: 'project-1', tenantId: 'tenant-1' });
  });
});
