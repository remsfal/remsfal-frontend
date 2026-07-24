import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantCard from '@/features/project/rentalAgreements/components/TenantCard.vue';
import type { TenantItemJson } from '@/features/project/rentalAgreements/services/TenantService';

const tenant: TenantItemJson = {
  id: 'tenant-1',
  firstName: 'Max',
  lastName: 'Mustermann',
  active: true,
};

describe('TenantCard', () => {
  it('does not render a delete button by default', () => {
    const wrapper = mount(TenantCard, { props: { tenant } });
    expect(wrapper.find('[class*="pi-trash"]').exists()).toBe(false);
  });

  it('renders a delete button when deletable is true', () => {
    const wrapper = mount(TenantCard, { props: { tenant, deletable: true } });
    expect(wrapper.find('[class*="pi-trash"]').exists()).toBe(true);
  });

  it('emits delete without emitting click when the delete button is clicked', async () => {
    const wrapper = mount(TenantCard, { props: { tenant, deletable: true } });

    await wrapper.find('[class*="pi-trash"]').trigger('click');

    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('emits click when the card itself is clicked', async () => {
    const wrapper = mount(TenantCard, { props: { tenant } });

    await wrapper.find('[data-testid="tenant-card"]').trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
