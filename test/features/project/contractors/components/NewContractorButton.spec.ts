import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import NewContractorButton from '@/features/project/contractors/components/NewContractorButton.vue';
import { projectContractorService } from '@/services/ProjectContractorService';

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

// Always render dialog content so form fields are accessible without needing to simulate open
const BaseDialogStub = {
  name: 'BaseDialog',
  inheritAttrs: false,
  template: '<div data-testid="dialog" :data-visible="String($attrs.visible)"><slot /></div>',
};

describe('NewContractorButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(projectContractorService, 'createContractor').mockResolvedValue(undefined);
  });

  const mountButton = (projectId = 'proj-1') =>
    mount(NewContractorButton, {
      props: { projectId },
      global: {
        stubs: {
          PhoneInput: true,
          BaseDialog: BaseDialogStub,
        },
      },
    });

  it('renders the button with label', () => {
    const wrapper = mountButton();
    expect(wrapper.text()).toContain('Auftragnehmer hinzufügen');
  });

  it('dialog is initially not visible', () => {
    const wrapper = mountButton();
    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('dialog becomes visible when button is clicked', async () => {
    const wrapper = mountButton();
    const trigger = wrapper.findAll('button').find(b => b.text().includes('Auftragnehmer'));
    await trigger?.trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');
  });

  it('renders dialog form fields', () => {
    const wrapper = mountButton();
    expect(wrapper.text()).toContain('Organisationsname');
    expect(wrapper.text()).toContain('E-Mail');
    expect(wrapper.text()).toContain('Telefon');
    expect(wrapper.text()).toContain('Ansprechpartner');
    expect(wrapper.text()).toContain('Gewerk');
  });

  it('renders PhoneInput inside dialog', () => {
    const wrapper = mountButton();
    expect(wrapper.findComponent({ name: 'PhoneInput' }).exists()).toBe(true);
  });

  it('shows phone validation error for invalid number', async () => {
    const wrapper = mountButton();

    const phoneInput = wrapper.findComponent({ name: 'PhoneInput' });
    await phoneInput.vm.$emit('update:modelValue', 'invalid-phone');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Telefonformat');
  });

  it('does not show phone error when phone is empty', async () => {
    const wrapper = mountButton();

    const phoneInput = wrapper.findComponent({ name: 'PhoneInput' });
    await phoneInput.vm.$emit('update:modelValue', '');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain('Telefonformat');
  });

  it('clears phone error when phone becomes valid', async () => {
    const wrapper = mountButton();

    const phoneInput = wrapper.findComponent({ name: 'PhoneInput' });
    await phoneInput.vm.$emit('update:modelValue', 'invalid');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Telefonformat');

    await phoneInput.vm.$emit('update:modelValue', '+4915123456789');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain('Telefonformat');
  });

  it('closes dialog when cancel button is clicked', async () => {
    const wrapper = mountButton();
    const trigger = wrapper.findAll('button').find(b => b.text().includes('Auftragnehmer'));
    await trigger?.trigger('click');
    await wrapper.vm.$nextTick();

    const cancelBtn = wrapper.findAll('button').find(b => b.text() === 'Abbrechen');
    await cancelBtn?.trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = wrapper.find('[data-testid="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('false');
  });

  it('calls createContractor and emits newContractor on valid form submit', async () => {
    const wrapper = mountButton();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        companyName: { value: 'Test GmbH' },
        email: { value: 'test@gmbh.de' },
        contactPerson: { value: 'Max' },
        trade: { value: 'Bau' },
      },
    });
    await flushPromises();

    expect(projectContractorService.createContractor).toHaveBeenCalledWith('proj-1', expect.objectContaining({ companyName: 'Test GmbH' }));
    expect(wrapper.emitted('newContractor')).toBeTruthy();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('calls createContractor with optional fields as undefined when empty', async () => {
    const wrapper = mountButton();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: {
        companyName: { value: 'Minimal GmbH' },
        email: { value: '' },
        contactPerson: { value: '' },
        trade: { value: '' },
      },
    });
    await flushPromises();

    expect(projectContractorService.createContractor).toHaveBeenCalledWith('proj-1', {
      companyName: 'Minimal GmbH',
      email: undefined,
      phone: undefined,
      contactPerson: undefined,
      trade: undefined,
    });
  });

  it('shows error toast when createContractor fails', async () => {
    vi.spyOn(projectContractorService, 'createContractor').mockRejectedValue(new Error('API error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mountButton();
    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { companyName: { value: 'Test GmbH' }, email: { value: '' }, contactPerson: { value: '' }, trade: { value: '' } },
    });
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    consoleSpy.mockRestore();
  });

  it('does not call createContractor when form is invalid', async () => {
    const wrapper = mountButton();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: false, states: {} });
    await flushPromises();

    expect(projectContractorService.createContractor).not.toHaveBeenCalled();
  });

  it('resets form when dialog emits hide', async () => {
    const wrapper = mountButton();

    const dialog = wrapper.findComponent({ name: 'BaseDialog' });
    await dialog.vm.$emit('hide');
    await wrapper.vm.$nextTick();

    expect(wrapper.exists()).toBe(true);
  });
});
