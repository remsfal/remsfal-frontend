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
  it('renders content passed into the actions slot without triggering a card click', async () => {
    const wrapper = mount(TenantCard, {
      props: { tenant },
      slots: { actions: '<button class="my-action">Action</button>' },
    });

    expect(wrapper.find('.my-action').exists()).toBe(true);

    await wrapper.find('.my-action').trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('emits click when the card itself is clicked', async () => {
    const wrapper = mount(TenantCard, { props: { tenant } });

    await wrapper.find('[data-testid="tenant-card"]').trigger('click');

    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
