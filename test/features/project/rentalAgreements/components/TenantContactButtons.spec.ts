import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
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

  it('emits delete when the delete confirmation dialog is confirmed', async () => {
    const wrapper = mount(TenantContactButtons, {
      props: { tenantId: 'tenant-1', deletable: true },
      attachTo: document.body,
    });

    await wrapper.find('[class*="pi-trash"]').trigger('click');
    await flushPromises();

    const confirmButton = document.querySelector('.p-dialog [class*="pi-trash"]')?.closest('button');
    expect(confirmButton).not.toBeNull();
    confirmButton!.click();
    await flushPromises();

    expect(wrapper.emitted('delete')).toBeTruthy();

    wrapper.unmount();
  });

  it('shows the tenant name in the delete confirmation message', async () => {
    const wrapper = mount(TenantContactButtons, {
      props: {
        tenantId: 'tenant-1', tenantName: 'Max Mustermann', deletable: true 
      },
      attachTo: document.body,
    });

    await wrapper.find('[class*="pi-trash"]').trigger('click');
    await flushPromises();

    const dialog = document.querySelector('.p-dialog');
    expect(dialog?.textContent).toContain('Max Mustermann');

    wrapper.unmount();
  });

  it('disables call and message buttons when disabled is true', () => {
    const wrapper = mount(TenantContactButtons, { props: { tenantId: 'tenant-1', disabled: true } });
    const buttons = wrapper.findAll('button');
    buttons.forEach((btn) => expect(btn.attributes('disabled')).toBeDefined());
  });

  it('disables the phone and email buttons when no contact data is available', () => {
    const wrapper = mount(TenantContactButtons, { props: { tenantId: 'tenant-1' } });
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => expect(btn.attributes('disabled')).toBeDefined());
  });

  it('renders a mailto link with the email address as label', () => {
    const wrapper = mount(TenantContactButtons, {props: { tenantId: 'tenant-1', email: 'tenant@example.com' },});

    const link = wrapper.find('a[href="mailto:tenant@example.com"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('tenant@example.com');
  });

  it('renders a tel link with the number as label when only one phone number is set', () => {
    const wrapper = mount(TenantContactButtons, {props: { tenantId: 'tenant-1', mobilePhoneNumber: '+491234567890' },});

    const link = wrapper.find('a[href="tel:+491234567890"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('+491234567890');
  });

  it('renders one call button per number, each labeled with its type', () => {
    const wrapper = mount(TenantContactButtons, {
      props: {
        tenantId: 'tenant-1',
        mobilePhoneNumber: '+491111111111',
        businessPhoneNumber: '+492222222222',
      },
    });

    const mobileLink = wrapper.find('a[href="tel:+491111111111"]');
    const businessLink = wrapper.find('a[href="tel:+492222222222"]');
    expect(mobileLink.text()).toBe('Mobiltelefon: +491111111111');
    expect(businessLink.text()).toBe('Geschäftstelefon: +492222222222');
  });
});
