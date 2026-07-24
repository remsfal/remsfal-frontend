import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantContactButtons from '@/features/project/rentalAgreements/components/TenantContactButtons.vue';

describe('TenantContactButtons', () => {
  it('renders call and message buttons', () => {
    const wrapper = mount(TenantContactButtons, { props: { tenantId: 'tenant-1' } });
    expect(wrapper.find('[class*="pi-phone"]').exists()).toBe(true);
    expect(wrapper.find('[class*="pi-envelope"]').exists()).toBe(true);
  });

  it('does not render a delete button by default', () => {
    const wrapper = mount(TenantContactButtons, { props: { tenantId: 'tenant-1' } });
    expect(wrapper.find('[class*="pi-trash"]').exists()).toBe(false);
  });

  it('renders a delete button when deletable is true', () => {
    const wrapper = mount(TenantContactButtons, { props: { tenantId: 'tenant-1', deletable: true } });
    expect(wrapper.find('[class*="pi-trash"]').exists()).toBe(true);
  });

  it('emits delete when the delete button is clicked', async () => {
    const wrapper = mount(TenantContactButtons, { props: { tenantId: 'tenant-1', deletable: true } });

    await wrapper.find('[class*="pi-trash"]').trigger('click');

    expect(wrapper.emitted('delete')).toBeTruthy();
  });

  it('disables call and message buttons when disabled is true', () => {
    const wrapper = mount(TenantContactButtons, { props: { tenantId: 'tenant-1', disabled: true } });
    const buttons = wrapper.findAll('button');
    buttons.forEach((btn) => expect(btn.attributes('disabled')).toBeDefined());
  });
});
