import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import NewTenantButton from '@/features/project/rentalAgreements/components/NewTenantButton.vue';
import { tenantService, type TenantItemJson } from '@/features/project/rentalAgreements/services/TenantService';

vi.mock('@/features/project/rentalAgreements/services/TenantService', () => ({tenantService: { fetchTenants: vi.fn() },}));

const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /></div>',
};

describe('NewTenantButton', () => {
  const mockTenants: TenantItemJson[] = [
    {
      id: '1', firstName: 'Max', lastName: 'Mustermann', email: 'max@example.com' 
    },
    {
      id: '2', firstName: 'Erika', lastName: 'Musterfrau' 
    },
  ];

  beforeEach(() => {
    vi.mocked(tenantService.fetchTenants).mockReset();
    vi.mocked(tenantService.fetchTenants).mockResolvedValue(mockTenants);
  });

  const mountButton = (props: Record<string, unknown> = {}) =>
    mount(NewTenantButton, {
      props: { projectId: 'proj-1', ...props },
      global: { stubs: { BaseDialog: BaseDialogStub } },
    });

  const findConfirmButton = (wrapper: ReturnType<typeof mountButton>) =>
    wrapper.find('[data-testid="dialog"]').findAll('button').find((btn) => btn.text() === 'Mieter hinzufügen');

  it('renders the button with label', () => {
    const wrapper = mountButton();
    expect(wrapper.text()).toContain('Neuen Mieter hinzufügen');
  });

  it('renders TenantForm fields inside the dialog', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');

    expect(wrapper.find('input[name="firstName"]').exists()).toBe(true);
    expect(wrapper.find('input[name="lastName"]').exists()).toBe(true);
  });

  it('loads tenants on open and builds AutoComplete option labels', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(tenantService.fetchTenants).toHaveBeenCalledWith('proj-1');

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('complete', { query: '' });
    await wrapper.vm.$nextTick();

    const suggestions = autoComplete.props('suggestions');
    expect(suggestions).toHaveLength(2);
    expect(suggestions[0].label).toBe('Max Mustermann (max@example.com)');
    expect(suggestions[1].label).toBe('Erika Musterfrau');
  });

  it('logs an error when loading tenants fails', async () => {
    vi.mocked(tenantService.fetchTenants).mockRejectedValue(new Error('network error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load tenants:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('filters tenants by first name, last name, or email', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });

    await autoComplete.vm.$emit('complete', { query: 'erika' });
    await wrapper.vm.$nextTick();
    expect(autoComplete.props('suggestions')).toHaveLength(1);
    expect(autoComplete.props('suggestions')[0].firstName).toBe('Erika');

    await autoComplete.vm.$emit('complete', { query: 'mustermann' });
    await wrapper.vm.$nextTick();
    expect(autoComplete.props('suggestions')[0].lastName).toBe('Mustermann');

    await autoComplete.vm.$emit('complete', { query: 'max@example.com' });
    await wrapper.vm.$nextTick();
    expect(autoComplete.props('suggestions')[0].email).toBe('max@example.com');

    await autoComplete.vm.$emit('complete', { query: 'nomatch' });
    await wrapper.vm.$nextTick();
    expect(autoComplete.props('suggestions')).toHaveLength(0);
  });

  it('does nothing when the AutoComplete selection is cleared', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('update:modelValue', null);

    expect(wrapper.emitted('newTenant')).toBeFalsy();
  });

  it('keeps the selection and disables confirm until it is explicitly confirmed', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(findConfirmButton(wrapper)?.attributes('disabled')).toBeDefined();

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('update:modelValue', mockTenants[0]);

    expect(wrapper.emitted('newTenant')).toBeFalsy();
    expect(findConfirmButton(wrapper)?.attributes('disabled')).toBeUndefined();
  });

  it('emits newTenant and closes the dialog when the selection is confirmed', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');
    await flushPromises();

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('update:modelValue', mockTenants[0]);
    await findConfirmButton(wrapper)?.trigger('click');

    expect(wrapper.emitted('newTenant')).toBeTruthy();
    const payload = wrapper.emitted('newTenant')![0][0] as { firstName: string; lastName: string };
    expect(payload.firstName).toBe('Max');
    expect(payload.lastName).toBe('Mustermann');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('disables confirm and shows a hint when the selected tenant already exists', async () => {
    const wrapper = mountButton({
      existingTenants: [{
        id: '1', firstName: 'Max', lastName: 'Mustermann' 
      }],
    });
    await wrapper.find('button').trigger('click');
    await flushPromises();

    const autoComplete = wrapper.findComponent({ name: 'AutoComplete' });
    await autoComplete.vm.$emit('update:modelValue', mockTenants[0]);

    expect(findConfirmButton(wrapper)?.attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain('Dieser Mieter wurde bereits hinzugefügt');

    await findConfirmButton(wrapper)?.trigger('click');
    expect(wrapper.emitted('newTenant')).toBeFalsy();
  });

  it('emits newTenant and closes dialog when TenantForm submits', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        firstName: { value: 'Erika' },
        lastName: { value: 'Musterfrau' },
        email: { value: '' },
        mobilePhoneNumber: { value: '' },
        businessPhoneNumber: { value: '' },
        privatePhoneNumber: { value: '' },
        placeOfBirth: { value: '' },
      },
    });

    expect(wrapper.emitted('newTenant')).toBeTruthy();
    const payload = wrapper.emitted('newTenant')![0][0] as { firstName: string; lastName: string };
    expect(payload.firstName).toBe('Erika');
    expect(payload.lastName).toBe('Musterfrau');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('syncs visible state when BaseDialog emits update:visible', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');

    const baseDialog = wrapper.findComponent({ name: 'BaseDialog' });
    await baseDialog.vm.$emit('update:visible', false);

    expect(wrapper.find('[data-testid="dialog"]').attributes('data-visible')).toBe('false');
  });

  it('closes the dialog and hides the form when cancel is emitted', async () => {
    const wrapper = mountButton();
    await wrapper.find('button').trigger('click');

    const tenantForm = wrapper.findComponent({ name: 'TenantForm' });
    await tenantForm.vm.$emit('cancel');

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
    expect(wrapper.findComponent({ name: 'TenantForm' }).exists()).toBe(false);
  });
});
