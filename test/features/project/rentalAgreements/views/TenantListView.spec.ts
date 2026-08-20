import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TenantListView from '@/features/project/rentalAgreements/views/TenantListView.vue';

describe('TenantListView.vue', () => {
  const mountView = (projectId = 'proj-1') =>
    mount(TenantListView, {
      props: { projectId },
      global: { stubs: { TenantListCard: true } },
    });

  it('renders correctly', () => {
    const wrapper = mountView();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders TenantListCard and forwards projectId', () => {
    const wrapper = mountView();
    const card = wrapper.findComponent({ name: 'TenantListCard' });
    expect(card.exists()).toBe(true);
    expect(card.props('projectId')).toBe('proj-1');
  });
});
