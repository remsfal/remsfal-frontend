import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import TenantDeleteButton from '@/features/project/rentalAgreements/components/TenantDeleteButton.vue';

describe('TenantDeleteButton', () => {
  it('does not render a delete button by default', () => {
    const wrapper = mount(TenantDeleteButton, { props: {} });
    expect(wrapper.find('[class*="pi-trash"]').exists()).toBe(false);
  });

  it('renders a delete button when deletable is true', () => {
    const wrapper = mount(TenantDeleteButton, { props: { deletable: true } });
    expect(wrapper.find('[class*="pi-trash"]').exists()).toBe(true);
  });

  it('shows the tenant name in the delete confirmation message', async () => {
    const wrapper = mount(TenantDeleteButton, {
      props: { tenantName: 'Max Mustermann', deletable: true },
      attachTo: document.body,
    });

    await wrapper.find('[class*="pi-trash"]').trigger('click');
    await flushPromises();

    const dialog = document.querySelector('.p-dialog');
    expect(dialog?.textContent).toContain('Max Mustermann');

    wrapper.unmount();
  });

  it('emits delete when the delete confirmation is confirmed', async () => {
    const wrapper = mount(TenantDeleteButton, {
      props: { deletable: true },
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
});
