import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { Form } from '@primevue/forms';
import ContractorBaseDataCard from '@/features/project/contractors/components/ContractorBaseDataCard.vue';
import { projectContractorService } from '@/services/ProjectContractorService';

const mockContractor = {
  id: 'c-1',
  companyName: 'Test GmbH',
  email: 'test@test.de',
  phone: '+4930123456',
  contactPerson: 'Max Muster',
  trade: 'Bauarbeiten',
  remarks: 'Zuverlässig',
};

const addMock = vi.fn();
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: addMock }) }));

describe('ContractorBaseDataCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(projectContractorService, 'getContractor').mockResolvedValue(mockContractor);
    vi.spyOn(projectContractorService, 'updateContractor').mockResolvedValue(mockContractor);
  });

  const mountCard = () =>
    mount(ContractorBaseDataCard, {
      props: { projectId: 'proj-1', contractorId: 'c-1' },
      global: { stubs: { PhoneInput: true } },
    });

  it('calls getContractor with correct ids on mount', async () => {
    mountCard();
    await flushPromises();
    expect(projectContractorService.getContractor).toHaveBeenCalledWith('proj-1', 'c-1');
  });

  it('renders the card title', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Auftragnehmer');
  });

  it('renders the companyName label', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Organisationsname');
  });

  it('renders the email label', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('E-Mail');
  });

  it('renders the phone label', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Telefon');
  });

  it('renders the contactPerson label', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Ansprechpartner');
  });

  it('renders the trade label', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Gewerk');
  });

  it('renders the remarks label', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Bemerkungen');
  });

  it('renders required fields indicator', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.text()).toContain('Plichtfelder');
  });

  it('renders PhoneInput stub', async () => {
    const wrapper = mountCard();
    await flushPromises();
    expect(wrapper.findComponent({ name: 'PhoneInput' }).exists()).toBe(true);
  });

  it('save button is disabled initially (not dirty)', async () => {
    const wrapper = mountCard();
    await flushPromises();
    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('does not throw when getContractor rejects', async () => {
    vi.spyOn(projectContractorService, 'getContractor').mockRejectedValue(new Error('Not found'));
    const wrapper = mountCard();
    await expect(flushPromises()).resolves.not.toThrow();
    expect(wrapper.exists()).toBe(true);
  });

  it('shows phone validation error for invalid number', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const phoneInput = wrapper.findComponent({ name: 'PhoneInput' });
    await phoneInput.vm.$emit('update:modelValue', 'invalid-phone');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Telefonformat');
  });

  it('does not show phone error when phone is empty', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const phoneInput = wrapper.findComponent({ name: 'PhoneInput' });
    await phoneInput.vm.$emit('update:modelValue', '');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain('Telefonformat');
  });

  it('shows phone error only after phone value is entered', async () => {
    const wrapper = mountCard();
    await flushPromises();

    // Valid phone - no error
    const phoneInput = wrapper.findComponent({ name: 'PhoneInput' });
    await phoneInput.vm.$emit('update:modelValue', '+491511234567');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain('Telefonformat');

    // Invalid phone - error shows
    await phoneInput.vm.$emit('update:modelValue', '12345');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Telefonformat');
  });

  it('save button is disabled when phone has error', async () => {
    const wrapper = mountCard();
    await flushPromises();

    // Enter something to make it dirty
    const nameInput = wrapper.find('input[name="companyName"]');
    if (nameInput.exists()) {
      await nameInput.setValue('Updated Name');
    }

    const phoneInput = wrapper.findComponent({ name: 'PhoneInput' });
    await phoneInput.vm.$emit('update:modelValue', 'invalid');
    await wrapper.vm.$nextTick();

    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('shows success toast after successful update via valid form submit', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { companyName: { value: 'Updated GmbH' } },
    });
    await flushPromises();

    expect(projectContractorService.updateContractor).toHaveBeenCalled();
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('shows error toast when updateContractor throws', async () => {
    vi.spyOn(projectContractorService, 'updateContractor').mockRejectedValue(new Error('Save failed'));
    const wrapper = mountCard();
    await flushPromises();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { companyName: { value: 'Updated GmbH' } },
    });
    await flushPromises();

    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('does not call updateContractor when form is invalid', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', { valid: false, states: {} });
    await flushPromises();

    expect(projectContractorService.updateContractor).not.toHaveBeenCalled();
  });

  it('does not call updateContractor when phoneError is set', async () => {
    const wrapper = mountCard();
    await flushPromises();

    const phoneInput = wrapper.findComponent({ name: 'PhoneInput' });
    await phoneInput.vm.$emit('update:modelValue', 'invalid-phone');
    await wrapper.vm.$nextTick();

    const form = wrapper.findComponent(Form);
    await form.vm.$emit('submit', {
      valid: true,
      states: { companyName: { value: 'Updated GmbH' } },
    });
    await flushPromises();

    expect(projectContractorService.updateContractor).not.toHaveBeenCalled();
  });
});
